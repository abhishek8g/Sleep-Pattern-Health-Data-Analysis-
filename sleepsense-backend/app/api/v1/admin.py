from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
import math
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.deps import require_admin
from app.schemas.user import UserListResponse, UserResponse
from app.schemas.auth import MessageResponse
from app.models.user import User, UserStatus, UserRole
from app.models.dataset import Dataset
from app.models.prediction import Prediction
from app.models.activity_log import ActivityLog
from app.models.feedback import Feedback, FeedbackStatus

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=dict)
def admin_dashboard(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.status == UserStatus.ACTIVE).count()
    total_datasets = db.query(Dataset).count()
    total_predictions = db.query(Prediction).count()
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_users = db.query(User).filter(User.created_at >= thirty_days_ago).count()

    daily_registrations = []
    for i in range(6, -1, -1):
        day = datetime.utcnow() - timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = db.query(User).filter(User.created_at >= day_start, User.created_at < day_end).count()
        daily_registrations.append({"date": day_start.strftime("%Y-%m-%d"), "count": count})

    top_users = (
        db.query(User.id, User.full_name, User.email, func.count(Dataset.id).label("dataset_count"))
        .outerjoin(Dataset, Dataset.user_id == User.id)
        .group_by(User.id, User.full_name, User.email)
        .order_by(func.count(Dataset.id).desc())
        .limit(5)
        .all()
    )

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_datasets": total_datasets,
        "total_predictions": total_predictions,
        "new_users_30_days": new_users,
        "daily_registrations": daily_registrations,
        "top_users": [
            {"id": str(u.id), "name": u.full_name, "email": u.email, "datasets": u.dataset_count}
            for u in top_users
        ],
    }


@router.get("/users", response_model=dict)
def list_users(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    if search:
        query = query.filter((User.email.ilike(f"%{search}%")) | (User.full_name.ilike(f"%{search}%")))
    if role:
        query = query.filter(User.role == role)
    if status:
        query = query.filter(User.status == status)

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [UserListResponse.model_validate(u).model_dump() for u in users],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": math.ceil(total / per_page),
    }


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: str, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.put("/users/{user_id}/suspend", response_model=MessageResponse)
def suspend_user(user_id: str, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if str(user.id) == str(admin.id):
        raise HTTPException(status_code=400, detail="Cannot suspend yourself")
    user.status = UserStatus.SUSPENDED
    db.commit()
    return MessageResponse(message=f"User {user.email} suspended.")


@router.put("/users/{user_id}/activate", response_model=MessageResponse)
def activate_user(user_id: str, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = UserStatus.ACTIVE
    db.commit()
    return MessageResponse(message=f"User {user.email} activated.")


@router.put("/users/{user_id}/role", response_model=MessageResponse)
def assign_role(
    user_id: str, role: str,
    admin: User = Depends(require_admin), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if role not in [r.value for r in UserRole]:
        raise HTTPException(status_code=400, detail="Invalid role")
    user.role = role
    db.commit()
    return MessageResponse(message=f"Role '{role}' assigned.")


@router.delete("/users/{user_id}", response_model=MessageResponse)
def delete_user(user_id: str, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if str(user.id) == str(admin.id):
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
    db.delete(user)
    db.commit()
    return MessageResponse(message="User deleted.")


@router.get("/activity-logs", response_model=dict)
def get_activity_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(50, ge=1, le=200),
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(ActivityLog)
    total = query.count()
    logs = query.order_by(ActivityLog.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "items": [
            {
                "id": str(log.id),
                "user_id": str(log.user_id) if log.user_id else None,
                "action": log.action,
                "description": log.description,
                "ip_address": log.ip_address,
                "created_at": log.created_at.isoformat(),
            }
            for log in logs
        ],
        "total": total,
        "page": page,
    }


@router.get("/system-stats", response_model=dict)
def system_stats(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    return {
        "total_users": db.query(User).count(),
        "total_datasets": db.query(Dataset).count(),
        "total_predictions": db.query(Prediction).count(),
        "total_feedback": db.query(Feedback).count(),
        "pending_feedback": db.query(Feedback).filter(Feedback.status == FeedbackStatus.OPEN).count(),
    }
