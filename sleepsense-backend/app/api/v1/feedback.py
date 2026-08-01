from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.schemas.auth import MessageResponse
from app.models.user import User
from app.models.feedback import Feedback, FeedbackStatus

router = APIRouter(prefix="/feedback", tags=["Feedback"])


class FeedbackCreate(BaseModel):
    subject: str
    message: str
    rating: Optional[int] = None


@router.post("/", response_model=dict, status_code=201)
def submit_feedback(
    data: FeedbackCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Submit user feedback."""
    if data.rating and not (1 <= data.rating <= 5):
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    feedback = Feedback(
        user_id=current_user.id,
        subject=data.subject,
        message=data.message,
        rating=data.rating,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return {"id": str(feedback.id), "message": "Feedback submitted. Thank you!"}


@router.get("/", response_model=dict)
def list_my_feedback(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List feedback submitted by current user."""
    items = db.query(Feedback).filter(Feedback.user_id == current_user.id).all()
    return {
        "items": [
            {
                "id": str(f.id),
                "subject": f.subject,
                "message": f.message,
                "rating": f.rating,
                "status": f.status.value,
                "admin_reply": f.admin_reply,
                "created_at": f.created_at.isoformat(),
            }
            for f in items
        ]
    }
