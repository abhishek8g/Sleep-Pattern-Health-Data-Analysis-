from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.schemas.user import UserResponse, UserUpdate, ChangePasswordRequest
from app.schemas.auth import MessageResponse
from app.models.user import User
from app.core.security import verify_password, get_password_hash
import cloudinary
import cloudinary.uploader
from app.core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
)

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_active_user)):
    """Get current user profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
def update_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update user profile."""
    for field, value in update_data.model_dump(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Upload profile avatar."""
    if file.content_type not in ["image/jpeg", "image/png", "image/gif", "image/webp"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Use JPEG, PNG, GIF, or WebP.")

    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 5MB.")

    try:
        result = cloudinary.uploader.upload(
            contents,
            folder="sleepsense/avatars",
            public_id=f"user_{current_user.id}",
            transformation=[{"width": 300, "height": 300, "crop": "fill"}],
        )
        current_user.avatar_url = result["secure_url"]
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.put("/me/password", response_model=MessageResponse)
def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Change password."""
    if not verify_password(data.current_password, current_user.hashed_password or ""):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = get_password_hash(data.new_password)
    db.commit()
    return MessageResponse(message="Password changed successfully!")


@router.delete("/me", response_model=MessageResponse)
def delete_account(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Delete user account."""
    db.delete(current_user)
    db.commit()
    return MessageResponse(message="Account deleted successfully.")


@router.get("/me/stats", response_model=dict)
def get_user_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get user statistics summary."""
    from app.models.dataset import Dataset
    from app.models.prediction import Prediction
    from app.models.report import Report

    dataset_count = db.query(Dataset).filter(Dataset.user_id == current_user.id).count()
    prediction_count = db.query(Prediction).filter(Prediction.user_id == current_user.id).count()
    report_count = db.query(Report).filter(Report.user_id == current_user.id).count()

    return {
        "datasets_uploaded": dataset_count,
        "predictions_made": prediction_count,
        "reports_generated": report_count,
        "login_count": current_user.login_count,
        "member_since": current_user.created_at.isoformat(),
    }
