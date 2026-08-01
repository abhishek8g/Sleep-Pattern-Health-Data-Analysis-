from sqlalchemy import Column, String, Boolean, DateTime, Text, Enum, Integer, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class DatasetStatus(str, enum.Enum):
    UPLOADING = "uploading"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"


def _uuid():
    return str(uuid.uuid4())


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(String(36), primary_key=True, default=_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    file_name = Column(String(255), nullable=False)
    file_url = Column(String(500), nullable=False)
    file_type = Column(String(10), nullable=False)
    file_size = Column(Integer, nullable=False)
    row_count = Column(Integer, nullable=True)
    column_count = Column(Integer, nullable=True)
    status = Column(Enum(DatasetStatus), default=DatasetStatus.UPLOADING)
    columns_info = Column(JSON, nullable=True)
    summary_stats = Column(JSON, nullable=True)
    preview_data = Column(JSON, nullable=True)
    is_cleaned = Column(Boolean, default=False)
    cleaning_report = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="datasets")
    predictions = relationship("Prediction", back_populates="dataset")
    reports = relationship("Report", back_populates="dataset")
    eda_results = relationship("EDAResult", back_populates="dataset", cascade="all, delete-orphan")
