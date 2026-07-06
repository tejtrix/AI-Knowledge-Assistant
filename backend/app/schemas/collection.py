from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List

class CollectionBase(BaseModel):
    name: str
    description: str | None = None

class CollectionCreate(CollectionBase):
    pass

class CollectionUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

class CollectionResponse(CollectionBase):
    id: UUID
    owner_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
