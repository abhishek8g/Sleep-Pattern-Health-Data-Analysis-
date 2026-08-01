from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status

from app.models.user import User, UserStatus, UserRole
from app.schemas.user import UserCreate
from app.schemas.auth import LoginRequest
from app.core.security import (
    verify_password, get_password_hash, create_access_token,
    create_refresh_token, decode_token, generate_otp, generate_reset_token
)
from app.core.config import settings
from app.services.email_service import send_verification_email, send_reset_password_email
import logging

logger = logging.getLogger(__name__)


def register_user(db: Session, user_data: UserCreate) -> User:
    """Register a new user."""
    # Check if email exists
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    # Check if username exists
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    otp = generate_otp()
    otp_expires = datetime.utcnow() + timedelta(minutes=10)

    user = User(
        email=user_data.email,
        username=user_data.username.lower(),
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        otp_code=otp,
        otp_expires_at=otp_expires,
        status=UserStatus.PENDING,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Send verification email (non-blocking)
    try:
        send_verification_email(user.email, user.full_name, otp)
    except Exception as e:
        logger.warning(f"Could not send verification email: {e}")

    return user


def verify_email_otp(db: Session, email: str, otp: str) -> User:
    """Verify email with OTP."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_email_verified:
        raise HTTPException(status_code=400, detail="Email already verified")
    if user.otp_code != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if user.otp_expires_at and user.otp_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP has expired")

    user.is_email_verified = True
    user.status = UserStatus.ACTIVE
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    db.refresh(user)
    return user


def login_user(db: Session, login_data: LoginRequest) -> dict:
    """Authenticate user and return tokens."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password or ""):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not user.is_email_verified:
        raise HTTPException(status_code=403, detail="Please verify your email first")
    if user.status == UserStatus.SUSPENDED:
        raise HTTPException(status_code=403, detail="Account suspended. Contact support.")

    # Update last login
    user.last_login = datetime.utcnow()
    user.login_count = (user.login_count or 0) + 1
    db.commit()
    db.refresh(user)

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id)})
    return {"access_token": access_token, "refresh_token": refresh_token, "user": user}


def refresh_access_token(db: Session, refresh_token: str) -> dict:
    """Issue new access token from refresh token."""
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user or user.status == UserStatus.SUSPENDED:
        raise HTTPException(status_code=401, detail="User not found or suspended")

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": access_token, "user": user}


def request_password_reset(db: Session, email: str) -> bool:
    """Send password reset email."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return True  # Don't reveal if email exists

    token = generate_reset_token()
    user.reset_token = token
    user.reset_token_expires_at = datetime.utcnow() + timedelta(hours=1)
    db.commit()

    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={token}"
    try:
        send_reset_password_email(user.email, user.full_name, reset_link)
    except Exception as e:
        logger.warning(f"Could not send reset email: {e}")
    return True


def reset_password(db: Session, token: str, new_password: str) -> bool:
    """Reset password with token."""
    user = db.query(User).filter(User.reset_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    if user.reset_token_expires_at and user.reset_token_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token has expired")

    user.hashed_password = get_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()
    return True


def resend_otp(db: Session, email: str) -> bool:
    """Resend OTP verification email."""
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_email_verified:
        raise HTTPException(status_code=400, detail="Email already verified")

    otp = generate_otp()
    user.otp_code = otp
    user.otp_expires_at = datetime.utcnow() + timedelta(minutes=10)
    db.commit()

    try:
        send_verification_email(user.email, user.full_name, otp)
    except Exception as e:
        logger.warning(f"Could not send OTP email: {e}")
    return True
