from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
import math

from app.core.database import get_db
from app.api.deps import get_current_active_user
from app.schemas.dataset import DatasetResponse, DatasetUpdate, PaginatedDatasets
from app.schemas.auth import MessageResponse
from app.models.user import User
from app.models.dataset import Dataset, DatasetStatus
from app.services.dataset_service import upload_file_to_cloudinary, process_dataset

router = APIRouter(prefix="/datasets", tags=["Datasets"])

ALLOWED_TYPES = {
    "text/csv": "csv",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
    "application/vnd.ms-excel": "xls",
    "application/json": "json",
}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB


@router.post("/upload", response_model=DatasetResponse, status_code=201)
async def upload_dataset(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    name: Optional[str] = None,
    description: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Upload a new dataset (CSV, Excel, or JSON)."""
    file_type = ALLOWED_TYPES.get(file.content_type)
    if not file_type:
        # Try by extension
        ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else ""
        if ext in ["csv", "xlsx", "xls", "json"]:
            file_type = ext
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Use CSV, Excel, or JSON.")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Max 50MB allowed.")

    # Upload to Cloudinary
    file_url = upload_file_to_cloudinary(
        contents,
        f"{current_user.id}_{file.filename}",
    )

    dataset = Dataset(
        user_id=current_user.id,
        name=name or file.filename,
        description=description,
        file_name=file.filename,
        file_url=file_url,
        file_type=file_type,
        file_size=len(contents),
        status=DatasetStatus.UPLOADING,
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)

    # Process in background
    background_tasks.add_task(process_dataset, db, dataset, contents)

    return dataset


@router.get("/", response_model=PaginatedDatasets)
def list_datasets(
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """List user's datasets with pagination."""
    query = db.query(Dataset).filter(Dataset.user_id == current_user.id)
    if search:
        query = query.filter(Dataset.name.ilike(f"%{search}%"))
    if status:
        query = query.filter(Dataset.status == status)

    total = query.count()
    items = query.order_by(Dataset.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return PaginatedDatasets(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        pages=math.ceil(total / per_page),
    )


@router.get("/{dataset_id}", response_model=DatasetResponse)
def get_dataset(
    dataset_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get a specific dataset."""
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id, Dataset.user_id == current_user.id
    ).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset


@router.put("/{dataset_id}", response_model=DatasetResponse)
def update_dataset(
    dataset_id: str,
    data: DatasetUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update dataset metadata."""
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id, Dataset.user_id == current_user.id
    ).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(dataset, field, value)
    db.commit()
    db.refresh(dataset)
    return dataset


@router.delete("/{dataset_id}", response_model=MessageResponse)
def delete_dataset(
    dataset_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Delete a dataset."""
    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id, Dataset.user_id == current_user.id
    ).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    db.delete(dataset)
    db.commit()
    return MessageResponse(message="Dataset deleted successfully.")


@router.get("/{dataset_id}/eda", response_model=dict)
def get_eda(
    dataset_id: str,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get or trigger EDA for a dataset."""
    from app.models.eda_result import EDAResult
    from app.services.eda_service import run_eda

    dataset = db.query(Dataset).filter(
        Dataset.id == dataset_id, Dataset.user_id == current_user.id
    ).first()
    if not dataset:
        raise HTTPException(status_code=404, detail="Dataset not found")
    if dataset.status != DatasetStatus.READY:
        raise HTTPException(status_code=400, detail="Dataset is not ready yet")

    eda = db.query(EDAResult).filter(EDAResult.dataset_id == dataset.id).first()
    if not eda:
        background_tasks.add_task(run_eda, db, dataset)
        return {"message": "EDA started. Please check back in a moment.", "status": "processing"}

    return {
        "id": str(eda.id),
        "dataset_id": str(eda.dataset_id),
        "summary_stats": eda.summary_stats,
        "correlation_matrix": eda.correlation_matrix,
        "missing_values": eda.missing_values,
        "outliers": eda.outliers,
        "distributions": eda.distributions,
        "charts_data": eda.charts_data,
        "ai_insights": eda.ai_insights,
        "created_at": eda.created_at.isoformat(),
    }
