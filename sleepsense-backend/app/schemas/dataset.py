from pydantic import BaseModel
from typing import Optional, Any, Dict, List
from datetime import datetime
from app.models.dataset import DatasetStatus


class DatasetResponse(BaseModel):
    id: str
    user_id: str
    name: str
    description: Optional[str]
    file_name: str
    file_url: str
    file_type: str
    file_size: int
    row_count: Optional[int]
    column_count: Optional[int]
    status: DatasetStatus
    columns_info: Optional[Dict[str, Any]]
    summary_stats: Optional[Dict[str, Any]]
    preview_data: Optional[List[Dict[str, Any]]]
    is_cleaned: bool
    cleaning_report: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class PaginatedDatasets(BaseModel):
    items: List[DatasetResponse]
    total: int
    page: int
    per_page: int
    pages: int
