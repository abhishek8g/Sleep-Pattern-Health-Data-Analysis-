from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


def _uuid():
    return str(uuid.uuid4())


class EDAResult(Base):
    __tablename__ = "eda_results"

    id = Column(String(36), primary_key=True, default=_uuid)
    dataset_id = Column(String(36), ForeignKey("datasets.id"), nullable=False)
    summary_stats = Column(JSON, nullable=True)
    correlation_matrix = Column(JSON, nullable=True)
    missing_values = Column(JSON, nullable=True)
    outliers = Column(JSON, nullable=True)
    distributions = Column(JSON, nullable=True)
    charts_data = Column(JSON, nullable=True)
    ai_insights = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    dataset = relationship("Dataset", back_populates="eda_results")
