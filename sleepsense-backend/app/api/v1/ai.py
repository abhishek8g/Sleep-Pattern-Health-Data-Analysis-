from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.models.user import User
from app.models.dataset import Dataset
from app.services.ai_service import (
    ask_ai, generate_health_recommendations, generate_weekly_report_summary
)

router = APIRouter(prefix="/ai", tags=["AI"])


class ChatRequest(BaseModel):
    question: str
    dataset_id: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    context_used: bool


@router.post("/chat", response_model=ChatResponse)
def chat_with_ai(
    request: ChatRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Ask AI a question about your health data."""
    context = f"User: {current_user.full_name}\n"

    if request.dataset_id:
        dataset = db.query(Dataset).filter(
            Dataset.id == request.dataset_id,
            Dataset.user_id == current_user.id
        ).first()
        if dataset and dataset.summary_stats:
            context += f"\nDataset: {dataset.name}\n"
            context += f"Summary: {str(dataset.summary_stats)[:500]}\n"

    answer = ask_ai(request.question, context)
    return ChatResponse(answer=answer, context_used=bool(request.dataset_id))


@router.get("/recommendations/{dataset_id}", response_model=dict)
def get_recommendations(
    dataset_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Generate AI health recommendations for a dataset."""
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id, Dataset.user_id == current_user.id
    ).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")

    from app.models.prediction import Prediction, PredictionStatus
    latest_prediction = db.query(Prediction).filter(
        Prediction.user_id == current_user.id,
        Prediction.status == PredictionStatus.COMPLETED
    ).order_by(Prediction.created_at.desc()).first()

    recommendations = generate_health_recommendations(
        dataset.summary_stats or {},
        latest_prediction.model_results if latest_prediction else None,
    )
    return recommendations


@router.get("/weekly-report", response_model=dict)
def get_weekly_report(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Generate AI weekly health report."""
    from app.models.dataset import Dataset
    from app.models.prediction import Prediction, PredictionStatus

    datasets = db.query(Dataset).filter(
        Dataset.user_id == current_user.id
    ).order_by(Dataset.created_at.desc()).limit(5).all()

    predictions = db.query(Prediction).filter(
        Prediction.user_id == current_user.id,
        Prediction.status == PredictionStatus.COMPLETED
    ).order_by(Prediction.created_at.desc()).limit(5).all()

    user_data = {
        "name": current_user.full_name,
        "datasets_count": len(datasets),
        "predictions_count": len(predictions),
        "latest_dataset": datasets[0].name if datasets else None,
        "latest_prediction_type": predictions[0].prediction_type.value if predictions else None,
        "best_model_accuracy": predictions[0].accuracy if predictions else None,
    }

    summary = generate_weekly_report_summary(user_data)
    return {
        "summary": summary,
        "datasets_analyzed": len(datasets),
        "predictions_completed": len(predictions),
    }
