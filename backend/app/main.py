from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title="AI Knowledge Assistant API",
    description="Enterprise-grade RAG platform API",
    version="1.0.0",
)

from app.api import auth, upload, chat, collections

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(upload.router, prefix=f"{settings.API_V1_STR}/documents", tags=["documents"])
app.include_router(chat.router, prefix=f"{settings.API_V1_STR}/chat", tags=["chat"])
app.include_router(collections.router, prefix=f"{settings.API_V1_STR}/collections", tags=["collections"])

@app.get("/api/v1/health")
async def health_check():
    return {
        "success": True,
        "message": "API is healthy",
        "data": {
            "version": app.version,
        },
        "errors": None
    }
