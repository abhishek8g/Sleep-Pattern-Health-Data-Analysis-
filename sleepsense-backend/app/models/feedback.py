from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class FeedbackStatus(str, enum.Enum):
    OPEN = "open"
    REVIEWED = "reviewed"
    CLOSED = "closed"


def _uuid():
    return str(uuid.uuid4())


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(String(36), primary_key=True, default=_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    rating = Column(Integer, nullable=True)
    status = Column(Enum(FeedbackStatus), default=FeedbackStatus.OPEN)
    admin_reply = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="feedbacks")
