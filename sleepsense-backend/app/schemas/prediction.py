from pydantic import BaseModel
from typing import Optional, Any, Dict, List
from datetime import datetime
from app.models.prediction import PredictionStatus, PredictionType


class PredictionCreate(BaseModel):
    dataset_id: str
    prediction_type: PredictionType
    target_column: Optional[str] = None
    feature_columns: Optional[List[str]] = None


class PredictionResponse(BaseModel):
    id: str
    user_id: str
    dataset_id: Optional[str]
    prediction_type: PredictionType
    status: PredictionStatus
    model_name: Optional[str]
    model_results: Optional[Dict[str, Any]]
    best_model: Optional[str]
    accuracy: Optional[float]
    precision: Optional[float]
    recall: Optional[float]
    f1_score: Optional[float]
    mae: Optional[float]
    mse: Optional[float]
    rmse: Optional[float]
    r2_score: Optional[float]
    confidence_score: Optional[float]
    shap_values: Optional[Dict[str, Any]]
    feature_importance: Optional[Dict[str, Any]]
    predictions_data: Optional[List[Any]]
    error_message: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class PaginatedPredictions(BaseModel):
    items: List[PredictionResponse]
    total: int
    page: int
    per_page: int
    pages: int
