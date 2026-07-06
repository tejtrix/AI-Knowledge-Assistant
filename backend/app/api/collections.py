from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.session import get_db
from app.database.models.user import User
from app.database.models.collection import Collection
from app.core.dependencies import get_current_active_user
from app.schemas.collection import CollectionResponse, CollectionCreate, CollectionUpdate

router = APIRouter()

@router.post("/", response_model=CollectionResponse)
async def create_collection(
    collection_in: CollectionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    collection = Collection(
        name=collection_in.name,
        description=collection_in.description,
        owner_id=current_user.id
    )
    db.add(collection)
    await db.commit()
    await db.refresh(collection)
    return collection

@router.get("/", response_model=list[CollectionResponse])
async def list_collections(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Collection)
        .where(Collection.owner_id == current_user.id)
        .order_by(Collection.created_at.desc())
    )
    return result.scalars().all()

@router.delete("/{collection_id}")
async def delete_collection(
    collection_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Collection)
        .where(Collection.id == collection_id, Collection.owner_id == current_user.id)
    )
    collection = result.scalar_one_or_none()
    
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
        
    await db.delete(collection)
    await db.commit()
    
    return {"status": "success", "detail": "Collection deleted"}
