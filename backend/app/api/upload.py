import os
import shutil
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db
from app.database.models.user import User
from app.database.models.document import Document
from app.core.dependencies import get_current_active_user
from app.core.config import settings
from app.schemas.document import DocumentResponse
from app.workers.tasks import process_document_task

router = APIRouter()

def validate_file(file: UploadFile):
    allowed_extensions = [ext.strip() for ext in settings.ALLOWED_FILE_TYPES.split(",")]
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Supported types: {settings.ALLOWED_FILE_TYPES}")
    
    # In a real app we would check file size via a middleware or by reading chunks up to MAX_UPLOAD_SIZE
    return True

@router.post("/", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    collection_id: str | None = Form(None),
    language: str = Form("en"),
    ocr_enabled: bool = Form(False),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    validate_file(file)
    
    # Create upload directory if it doesn't exist
    os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)
    
    # Generate unique filename to avoid collisions
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIRECTORY, unique_filename)
    
    # Save the file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_size = os.path.getsize(file_path)
    if file_size > settings.MAX_UPLOAD_SIZE:
        os.remove(file_path)
        raise HTTPException(status_code=413, detail="File too large")

    # Save document record to DB
    new_doc = Document(
        filename=unique_filename,
        original_filename=file.filename,
        document_type=file.filename.split(".")[-1].lower() if "." in file.filename else "unknown",
        mime_type=file.content_type or "application/octet-stream",
        size=file_size,
        owner_id=current_user.id,
        collection_id=uuid.UUID(collection_id) if collection_id else None,
        language=language,
        ocr_enabled=ocr_enabled,
        storage_path=file_path,
        status="processing",
        embedding_status="pending"
    )
    
    db.add(new_doc)
    await db.commit()
    await db.refresh(new_doc)
    
    # Trigger celery background task for processing
    process_document_task.delay(str(new_doc.id))

    return new_doc
