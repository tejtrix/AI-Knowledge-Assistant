from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime

class DocumentBase(BaseModel):
    filename: str
    original_filename: str
    document_type: str
    mime_type: str
    size: int
    collection_id: UUID | None = None
    language: str = "en"
    ocr_enabled: bool = False

class DocumentCreate(DocumentBase):
    owner_id: UUID
    storage_path: str

class DocumentUpdate(BaseModel):
    filename: str | None = None
    collection_id: UUID | None = None
    status: str | None = None
    chunk_count: int | None = None
    embedding_status: str | None = None

class DocumentResponse(DocumentBase):
    id: UUID
    owner_id: UUID
    status: str
    chunk_count: int
    embedding_status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
