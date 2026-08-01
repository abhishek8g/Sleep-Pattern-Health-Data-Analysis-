from sqlalchemy import Column, String, DateTime, Text, Enum, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid
import enum


class PredictionStatus(str, enum.Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class PredictionType(str, enum.Enum):
    SLEEP_QUALITY = "sleep_quality"
    STRESS_LEVEL = "stress_level"
    HEART_RATE_RISK = "heart_rate_risk"
    LIFESTYLE_SCORE = "lifestyle_score"


def _uuid():
    return str(uuid.uuid4())


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    dataset_id = Column(String(36), ForeignKey("datasets.id"), nullable=True)
    prediction_type = Column(Enum(PredictionType), nullable=False)
    status = Column(Enum(PredictionStatus), default=PredictionStatus.PENDING)
    model_name = Column(String(100), nullable=True)
    model_results = Column(JSON, nullable=True)
    best_model = Column(String(100), nullable=True)
    accuracy = Column(Float, nullable=True)
    precision = Column(Float, nullable=True)
    recall = Column(Float, nullable=True)
    f1_score = Column(Float, nullable=True)
    mae = Column(Float, nullable=True)
    mse = Column(Float, nullable=True)
    rmse = Column(Float, nullable=True)
    r2_score = Column(Float, nullable=True)
    confidence_score = Column(Float, nullable=True)
    shap_values = Column(JSON, nullable=True)
    feature_importance = Column(JSON, nullable=True)
    predictions_data = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="predictions")
    dataset = relationship("Dataset", back_populates="predictions")
