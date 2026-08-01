from sqlalchemy import Column, String, DateTime, Text, Enum, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class ReportType(str, enum.Enum):
    PDF = "pdf"
    EXCEL = "excel"
    CSV = "csv"
    WEEKLY = "weekly"
    MONTHLY = "monthly"


def _uuid():
    return str(uuid.uuid4())


class Report(Base):
    __tablename__ = "reports"

    id = Column(String(36), primary_key=True, default=_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    dataset_id = Column(String(36), ForeignKey("datasets.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    report_type = Column(Enum(ReportType), nullable=False)
    file_url = Column(String(500), nullable=True)
    report_data = Column(JSON, nullable=True)
    ai_insights = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="reports")
    dataset = relationship("Dataset", back_populates="reports")
