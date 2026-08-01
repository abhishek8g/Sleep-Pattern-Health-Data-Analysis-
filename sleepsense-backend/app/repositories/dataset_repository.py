"""Dataset data access layer."""
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional, List
from uuid import UUID

from app.models.dataset import Dataset, DatasetStatus


class DatasetRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, dataset_id: UUID) -> Optional[Dataset]:
        return self.db.query(Dataset).filter(Dataset.id == dataset_id).first()

    def get_by_id_and_user(self, dataset_id: UUID, user_id: UUID) -> Optional[Dataset]:
        return (
            self.db.query(Dataset)
            .filter(Dataset.id == dataset_id, Dataset.user_id == user_id)
            .first()
        )

    def list_by_user(
        self,
        user_id: UUID,
        page: int = 1,
        per_page: int = 10,
        search: Optional[str] = None,
        status: Optional[DatasetStatus] = None,
    ) -> tuple[List[Dataset], int]:
        query = self.db.query(Dataset).filter(Dataset.user_id == user_id)
        if search:
            query = query.filter(Dataset.name.ilike(f"%{search}%"))
        if status:
            query = query.filter(Dataset.status == status)

        total = query.count()
        items = (
            query.order_by(desc(Dataset.created_at))
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )
        return items, total

    def create(self, dataset: Dataset) -> Dataset:
        self.db.add(dataset)
        self.db.commit()
        self.db.refresh(dataset)
        return dataset

    def update(self, dataset: Dataset) -> Dataset:
        self.db.commit()
        self.db.refresh(dataset)
        return dataset

    def delete(self, dataset: Dataset) -> None:
        self.db.delete(dataset)
        self.db.commit()

    def count_by_user(self, user_id: UUID) -> int:
        return self.db.query(Dataset).filter(Dataset.user_id == user_id).count()

    def count_total(self) -> int:
        return self.db.query(Dataset).count()
