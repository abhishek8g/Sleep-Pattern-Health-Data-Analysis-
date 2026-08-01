from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.schemas.notification import PaginatedNotifications, NotificationResponse
from app.schemas.auth import MessageResponse
from app.models.user import User
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("/", response_model=PaginatedNotifications)
def list_notifications(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    unread_only: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List user notifications."""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    if unread_only:
        query = query.filter(Notification.is_read == False)

    unread_count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).count()

    items = query.order_by(Notification.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return PaginatedNotifications(items=items, total=query.count(), unread_count=unread_count)


@router.put("/{notification_id}/read", response_model=NotificationResponse)
def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Mark notification as read."""
    from fastapi import HTTPException
    notif = db.query(Notification).filter(
        Notification.id == notification_id, Notification.user_id == current_user.id
    ).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.put("/read-all", response_model=MessageResponse)
def mark_all_read(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Mark all notifications as read."""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return MessageResponse(message="All notifications marked as read.")
