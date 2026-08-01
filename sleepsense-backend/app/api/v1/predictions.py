from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session
import math

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.schemas.prediction import PredictionCreate, PredictionResponse, PaginatedPredictions
from app.models.user import User
from app.models.dataset import Dataset, DatasetStatus
from app.models.prediction import Prediction, PredictionStatus
from app.services.ml_service import run_prediction
from app.services.ai_service import explain_prediction

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post("/", response_model=PredictionResponse, status_code=201)
def create_prediction(
    data: PredictionCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Start a new ML prediction job."""
    dataset = db.query(Dataset).filter(
        Dataset.id == data.dataset_id, Dataset.user_id == current_user.id
    ).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    if dataset.status != DatasetStatus.READY:
        raise HTTPException(status_code=400, detail="Dataset is not ready for analysis")

    prediction = Prediction(
        user_id=current_user.id,
        dataset_id=dataset.id,
        prediction_type=data.prediction_type,
        status=PredictionStatus.PENDING,
    )
    db.add(prediction)
    db.commit()
    db.refresh(prediction)

    # Determine target column from type
    target_map = {
        "sleep_quality": "sleep_quality",
        "stress_level": "stress_level",
        "heart_rate_risk": "heart_rate",
        "lifestyle_score": "lifestyle_score",
    }
    target_col = data.target_column or target_map.get(data.prediction_type.value, "sleep_quality")

    background_tasks.add_task(
        run_prediction, db, prediction, dataset, target_col, data.feature_columns
    )

    return prediction


@router.get("/", response_model=PaginatedPredictions)
def list_predictions(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    status: str = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List user's predictions."""
    query = db.query(Prediction).filter(Prediction.user_id == current_user.id)
    if status:
        query = query.filter(Prediction.status == status)

    total = query.count()
    items = query.order_by(Prediction.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return PaginatedPredictions(
        items=items, total=total, page=page, per_page=per_page,
        pages=math.ceil(total / per_page),
    )


@router.get("/{prediction_id}", response_model=PredictionResponse)
def get_prediction(
    prediction_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get a specific prediction result."""
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id, Prediction.user_id == current_user.id
    ).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return prediction


@router.get("/{prediction_id}/explain", response_model=dict)
def explain_prediction_result(
    prediction_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get AI explanation of prediction results."""
    prediction = db.query(Prediction).filter(
        Prediction.id == prediction_id, Prediction.user_id == current_user.id
    ).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    if prediction.status != PredictionStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Prediction not yet completed")

    metrics = {
        "accuracy": prediction.accuracy,
        "precision": prediction.precision,
        "recall": prediction.recall,
        "f1_score": prediction.f1_score,
        "confidence": prediction.confidence_score,
    }
    explanation = explain_prediction(
        prediction.prediction_type.value,
        metrics,
        prediction.feature_importance or {},
    )
    return {"explanation": explanation, "feature_importance": prediction.feature_importance}
