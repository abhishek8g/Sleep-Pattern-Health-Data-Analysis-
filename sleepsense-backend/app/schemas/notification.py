from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.notification import NotificationType


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    notification_type: NotificationType
    is_read: bool
    action_url: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}


class PaginatedNotifications(BaseModel):
    items: List[NotificationResponse]
    total: int
    unread_count: int
