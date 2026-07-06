from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database.base import BaseModel

class Document(BaseModel):
    __tablename__ = "documents"

    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    document_type: Mapped[str] = mapped_column(String(50), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size: Mapped[int] = mapped_column(Integer, nullable=False)
    
    owner_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    collection_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), nullable=True) # Assuming collection feature comes later
    
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)
    chunk_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ocr_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    embedding_status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    storage_path: Mapped[str] = mapped_column(String(1024), nullable=False)

    owner = relationship("User", backref="documents")
