"""User data access layer — separates DB queries from business logic."""
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import Optional, List
from uuid import UUID

from app.models.user import User, UserRole, UserStatus


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: UUID) -> Optional[User]:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()

    def get_by_google_id(self, google_id: str) -> Optional[User]:
        return self.db.query(User).filter(User.google_id == google_id).first()

    def get_by_reset_token(self, token: str) -> Optional[User]:
        return self.db.query(User).filter(User.reset_token == token).first()

    def list(
        self,
        page: int = 1,
        per_page: int = 20,
        search: Optional[str] = None,
        role: Optional[UserRole] = None,
        status: Optional[UserStatus] = None,
    ) -> tuple[List[User], int]:
        query = self.db.query(User)
        if search:
            query = query.filter(
                (User.email.ilike(f"%{search}%")) |
                (User.full_name.ilike(f"%{search}%")) |
                (User.username.ilike(f"%{search}%"))
            )
        if role:
            query = query.filter(User.role == role)
        if status:
            query = query.filter(User.status == status)

        total = query.count()
        users = (
            query.order_by(desc(User.created_at))
            .offset((page - 1) * per_page)
            .limit(per_page)
            .all()
        )
        return users, total

    def create(self, user: User) -> User:
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User) -> User:
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()

    def count_by_role(self) -> dict:
        results = (
            self.db.query(User.role, func.count(User.id))
            .group_by(User.role)
            .all()
        )
        return {role.value: count for role, count in results}

    def count_active(self) -> int:
        return self.db.query(User).filter(User.status == UserStatus.ACTIVE).count()
