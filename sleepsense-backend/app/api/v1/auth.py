from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_user
from app.schemas.auth import (
    LoginRequest, TokenResponse, RefreshTokenRequest,
    ForgotPasswordRequest, ResetPasswordRequest,
    VerifyEmailRequest, ResendOTPRequest, MessageResponse
)
from app.schemas.user import UserCreate, UserResponse
from app.services import auth_service
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=MessageResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user account."""
    auth_service.register_user(db, user_data)
    return MessageResponse(message="Registration successful! Please check your email for the OTP.")


@router.post("/verify-email", response_model=MessageResponse)
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    """Verify email address with OTP."""
    auth_service.verify_email_otp(db, data.email, data.otp)
    return MessageResponse(message="Email verified successfully! You can now log in.")


@router.post("/resend-otp", response_model=MessageResponse)
def resend_otp(data: ResendOTPRequest, db: Session = Depends(get_db)):
    """Resend verification OTP."""
    auth_service.resend_otp(db, data.email)
    return MessageResponse(message="OTP sent successfully!")


@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password."""
    result = auth_service.login_user(db, login_data)
    return TokenResponse(
        access_token=result["access_token"],
        refresh_token=result["refresh_token"],
        user=result["user"],
    )


@router.post("/refresh", response_model=dict)
def refresh_token(data: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Refresh access token."""
    result = auth_service.refresh_access_token(db, data.refresh_token)
    return {"access_token": result["access_token"], "token_type": "bearer"}


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request password reset email."""
    auth_service.request_password_reset(db, data.email)
    return MessageResponse(message="If the email exists, a reset link has been sent.")


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password with token."""
    auth_service.reset_password(db, data.token, data.new_password)
    return MessageResponse(message="Password reset successfully!")


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current user profile."""
    return current_user


@router.post("/logout", response_model=MessageResponse)
def logout(current_user: User = Depends(get_current_user)):
    """Logout (client should discard tokens)."""
    return MessageResponse(message="Logged out successfully!")
