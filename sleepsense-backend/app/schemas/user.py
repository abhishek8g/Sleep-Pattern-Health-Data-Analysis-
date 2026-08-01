from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime
from app.models.user import UserRole, UserStatus


class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str


class UserCreate(UserBase):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("username")
    @classmethod
    def validate_username(cls, v):
        if len(v) < 3:
            raise ValueError("Username must be at least 3 characters")
        return v.lower()


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    phone: Optional[str] = None
    timezone: Optional[str] = None
    language: Optional[str] = None
    theme: Optional[str] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    avatar_url: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: str
    avatar_url: Optional[str]
    role: UserRole
    status: UserStatus
    is_email_verified: bool
    bio: Optional[str]
    phone: Optional[str]
    timezone: str
    language: str
    theme: str
    email_notifications: bool
    push_notifications: bool
    last_login: Optional[datetime]
    login_count: int
    created_at: datetime

    model_config = {"from_attributes": True}


class UserListResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: str
    avatar_url: Optional[str]
    role: UserRole
    status: UserStatus
    is_email_verified: bool
    last_login: Optional[datetime]
    created_at: datetime

    model_config = {"from_attributes": True}


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v
