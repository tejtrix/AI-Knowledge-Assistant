from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from datetime import datetime
from app.database.models.user import RoleEnum

class UserBase(BaseModel):
    name: str
    email: EmailStr
    avatar_url: str | None = None
    language: str = "en"
    theme: str = "system"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    avatar_url: str | None = None
    language: str | None = None
    theme: str | None = None
    password: str | None = None

class UserInDBBase(UserBase):
    id: UUID
    role: RoleEnum
    is_active: bool
    is_verified: bool
    last_login: str | None = None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserResponse(UserInDBBase):
    pass
