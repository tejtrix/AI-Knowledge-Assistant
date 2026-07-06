from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Any

class ChatMessageBase(BaseModel):
    role: str
    content: str
    citations: List[Any] | None = None
    confidence_score: float | None = None
    response_time_ms: int | None = None

class ChatMessageCreate(ChatMessageBase):
    session_id: UUID

class ChatMessageResponse(ChatMessageBase):
    id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ChatSessionBase(BaseModel):
    title: str

class ChatSessionCreate(ChatSessionBase):
    user_id: UUID

class ChatSessionResponse(ChatSessionBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime
    messages: List[ChatMessageResponse] = []
    
    model_config = ConfigDict(from_attributes=True)
