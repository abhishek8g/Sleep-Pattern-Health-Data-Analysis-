"""Google OAuth authentication handler."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import httpx
import uuid

from app.core.database import get_db
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.models.user import User, UserRole, UserStatus

router = APIRouter(prefix="/auth", tags=["Google OAuth"])

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo"


@router.get("/google/login", response_model=dict)
def google_login_url():
    """Return the Google OAuth authorization URL."""
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return {"url": f"https://accounts.google.com/o/oauth2/v2/auth?{query}"}


@router.get("/google/callback", response_model=dict)
def google_callback(code: str, db: Session = Depends(get_db)):
    """Handle Google OAuth callback — exchange code for tokens."""
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Google OAuth not configured")

    # Exchange code for tokens
    with httpx.Client() as client:
        token_resp = client.post(GOOGLE_TOKEN_URL, data={
            "code": code,
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
            "grant_type": "authorization_code",
        })
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange Google code")
        token_data = token_resp.json()

        # Get user info
        user_resp = client.get(
            GOOGLE_USERINFO_URL,
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        if user_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to get Google user info")
        google_user = user_resp.json()

    google_id = google_user["id"]
    email = google_user["email"]
    full_name = google_user.get("name", email.split("@")[0])
    avatar_url = google_user.get("picture")

    # Find or create user
    user = db.query(User).filter(User.google_id == google_id).first()
    if not user:
        user = db.query(User).filter(User.email == email).first()

    if user:
        # Update Google ID and avatar if needed
        if not user.google_id:
            user.google_id = google_id
        if avatar_url and not user.avatar_url:
            user.avatar_url = avatar_url
        user.is_email_verified = True
        if user.status == UserStatus.PENDING:
            user.status = UserStatus.ACTIVE
        db.commit()
    else:
        # Create new user from Google account
        username = email.split("@")[0].lower().replace(".", "_")
        # Ensure username is unique
        base = username
        counter = 1
        while db.query(User).filter(User.username == username).first():
            username = f"{base}{counter}"
            counter += 1

        user = User(
            id=uuid.uuid4(),
            email=email,
            username=username,
            full_name=full_name,
            avatar_url=avatar_url,
            google_id=google_id,
            is_email_verified=True,
            status=UserStatus.ACTIVE,
            role=UserRole.USER,
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Redirect to frontend with tokens
    redirect_url = (
        f"{settings.FRONTEND_URL}/auth/google/success"
        f"?access_token={access_token}"
        f"&refresh_token={refresh_token}"
    )

    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=redirect_url)
