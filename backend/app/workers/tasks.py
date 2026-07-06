from app.workers.celery_app import celery_app
import asyncio
from uuid import UUID

def run_async(coro):
    """Helper to run async code inside a synchronous celery task."""
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(coro)

@celery_app.task(bind=True, max_retries=3)
def process_document_task(self, document_id: str):
    """
    Background task to process an uploaded document.
    Steps:
    1. Extract text (OCR if needed)
    2. Clean text
    3. Chunk text
    4. Generate embeddings
    5. Store in vector db
    """
    # For now this is a placeholder for the heavy ML lifting
    print(f"Starting processing for document {document_id}")
    
    # Normally we would query the db, get the document, process the file, etc.
    # We will implement the actual logic in the services layer and call it here.
    return {"status": "completed", "document_id": document_id}
