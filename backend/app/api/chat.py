import json
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
import time

from app.database.session import get_db
from app.database.models.user import User
from app.database.models.chat import ChatSession, ChatMessage
from app.core.dependencies import get_current_active_user
from app.schemas.chat import ChatSessionResponse, ChatMessageResponse, ChatSessionCreate
from app.rag.engine import stream_rag_response

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: UUID | None = None
    collection_id: str | None = None

@router.post("/sessions", response_model=ChatSessionResponse)
async def create_chat_session(
    session_in: ChatSessionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    session = ChatSession(
        user_id=current_user.id,
        title=session_in.title
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.get("/sessions", response_model=list[ChatSessionResponse])
async def list_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(ChatSession)
        .where(ChatSession.user_id == current_user.id)
        .order_by(ChatSession.updated_at.desc())
    )
    return result.scalars().all()

@router.post("/completions/stream")
async def stream_chat(
    request: ChatRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    start_time = time.time()
    session_id = request.session_id
    
    if not session_id:
        # Create a new session if none provided
        session = ChatSession(
            user_id=current_user.id,
            title=request.message[:50] + "..."
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)
        session_id = session.id
    
    # Save user message
    user_msg = ChatMessage(
        session_id=session_id,
        role="user",
        content=request.message
    )
    db.add(user_msg)
    await db.commit()

    async def generate_response():
        full_response = ""
        citations_data = []
        
        try:
            async for chunk in stream_rag_response(request.message, request.collection_id):
                if chunk["type"] == "citations":
                    citations_data = chunk["data"]
                    # Send citations block to client
                    yield f"data: {json.dumps({'type': 'citations', 'citations': citations_data})}\n\n"
                elif chunk["type"] == "chunk":
                    content = chunk["data"]
                    full_response += content
                    # Send content chunk
                    yield f"data: {json.dumps({'type': 'chunk', 'content': content})}\n\n"
            
            # Send session ID back so frontend knows if a new one was created
            yield f"data: {json.dumps({'type': 'metadata', 'session_id': str(session_id)})}\n\n"
            
            # Finished
            yield "data: [DONE]\n\n"
            
            # Save assistant message to DB after streaming completes
            response_time_ms = int((time.time() - start_time) * 1000)
            assistant_msg = ChatMessage(
                session_id=session_id,
                role="assistant",
                content=full_response,
                citations=citations_data,
                response_time_ms=response_time_ms
            )
            db.add(assistant_msg)
            await db.commit()
            
        except Exception as e:
            # Send error chunk
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"
            
    return StreamingResponse(generate_response(), media_type="text/event-stream")
