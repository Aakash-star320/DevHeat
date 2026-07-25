"""Career Coach conversation API."""
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.config import logger
from app.database import get_db
from app.models.database import ChatMessage, Conversation, Portfolio, User
from app.routers.auth_router import get_current_user
from app.services import career_bot_service


router = APIRouter(prefix="/career-bot", tags=["Career Bot"])


class ConversationCreateRequest(BaseModel):
    title: Optional[str] = Field(default=None, max_length=160)


class ConversationRenameRequest(BaseModel):
    title: str = Field(min_length=1, max_length=160)


class ConversationResponse(BaseModel):
    id: str
    title: str
    conversation_type: str
    created_at: str
    updated_at: str


class ChatMessageRequest(BaseModel):
    message: str = Field(min_length=1, max_length=6000)


class ChatMessageResponse(BaseModel):
    user_message: str
    assistant_message: str
    ai_service: str
    model_used: str
    timestamp: str
    conversation_id: str
    state_updated: bool


class ChatHistoryItem(BaseModel):
    id: str
    role: str
    content: str
    created_at: str
    ai_service: Optional[str] = None


class ChatHistoryResponse(BaseModel):
    messages: List[ChatHistoryItem]
    total_count: int


async def get_current_user_with_completed_portfolio(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Keep Career Coach access tied to a completed candidate profile."""
    result = await db.execute(
        select(Portfolio.id)
        .where(Portfolio.user_id == current_user.id, Portfolio.status == "completed")
        .limit(1)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Create a completed portfolio before using AI Career Coach.",
        )
    return current_user


def serialise_conversation(conversation: Conversation) -> dict:
    return {
        "id": conversation.id,
        "title": conversation.title,
        "conversation_type": conversation.conversation_type,
        "created_at": conversation.created_at.isoformat(),
        "updated_at": conversation.updated_at.isoformat(),
    }


async def get_owned_conversation(
    conversation_id: str, user: User, db: AsyncSession
) -> Conversation:
    result = await db.execute(
        select(Conversation).where(
            Conversation.id == conversation_id,
            Conversation.user_id == user.id,
            Conversation.is_deleted.is_(False),
        )
    )
    conversation = result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.get("/conversations", response_model=List[ConversationResponse])
async def list_conversations(
    current_user: User = Depends(get_current_user_with_completed_portfolio), db: AsyncSession = Depends(get_db)
):
    """List only the requesting user's active Career Coach conversations."""
    result = await db.execute(
        select(Conversation)
        .where(
            Conversation.user_id == current_user.id,
            Conversation.conversation_type == "career_coach",
            Conversation.is_deleted.is_(False),
        )
        .order_by(Conversation.updated_at.desc())
    )
    return [serialise_conversation(conversation) for conversation in result.scalars().all()]


@router.post("/conversations", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    request: ConversationCreateRequest,
    current_user: User = Depends(get_current_user_with_completed_portfolio),
    db: AsyncSession = Depends(get_db),
):
    """Create a blank, isolated chat. It never imports another chat's state."""
    title = (request.title or "New conversation").strip() or "New conversation"
    conversation = Conversation(
        user_id=current_user.id,
        conversation_type="career_coach",
        title=title,
        state_json=career_bot_service.DEFAULT_CONVERSATION_STATE.copy(),
        summary="",
    )
    db.add(conversation)
    await db.commit()
    await db.refresh(conversation)
    return serialise_conversation(conversation)


@router.patch("/conversations/{conversation_id}", response_model=ConversationResponse)
async def rename_conversation(
    conversation_id: str,
    request: ConversationRenameRequest,
    current_user: User = Depends(get_current_user_with_completed_portfolio),
    db: AsyncSession = Depends(get_db),
):
    conversation = await get_owned_conversation(conversation_id, current_user, db)
    title = request.title.strip()
    if not title:
        raise HTTPException(status_code=400, detail="Conversation title cannot be empty")
    conversation.title = title
    conversation.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(conversation)
    return serialise_conversation(conversation)


@router.delete("/conversations/{conversation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_conversation(
    conversation_id: str,
    current_user: User = Depends(get_current_user_with_completed_portfolio),
    db: AsyncSession = Depends(get_db),
):
    """Permanently remove one conversation, its state, and every message in it."""
    conversation = await get_owned_conversation(conversation_id, current_user, db)
    message_result = await db.execute(
        select(ChatMessage).where(ChatMessage.conversation_id == conversation.id)
    )
    for message in message_result.scalars().all():
        await db.delete(message)
    await db.delete(conversation)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/conversations/{conversation_id}/messages", response_model=ChatHistoryResponse)
async def get_conversation_messages(
    conversation_id: str,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user_with_completed_portfolio),
    db: AsyncSession = Depends(get_db),
):
    await get_owned_conversation(conversation_id, current_user, db)
    limit = min(max(limit, 1), 100)
    offset = max(offset, 0)
    message_query = (
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.asc())
    )
    total_result = await db.execute(
        select(func.count(ChatMessage.id)).where(ChatMessage.conversation_id == conversation_id)
    )
    page_result = await db.execute(message_query.offset(offset).limit(limit))
    page = page_result.scalars().all()
    return {
        "messages": [
            {
                "id": message.id,
                "role": message.role,
                "content": message.content,
                "created_at": message.created_at.isoformat(),
                "ai_service": message.ai_service,
            }
            for message in page
        ],
        "total_count": total_result.scalar_one(),
    }


@router.post(
    "/conversations/{conversation_id}/messages", response_model=ChatMessageResponse
)
async def send_conversation_message(
    conversation_id: str,
    request: ChatMessageRequest,
    current_user: User = Depends(get_current_user_with_completed_portfolio),
    db: AsyncSession = Depends(get_db),
):
    """Send a message using only the selected conversation's history and state."""
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    conversation = await get_owned_conversation(conversation_id, current_user, db)
    try:
        return await career_bot_service.send_message(message, current_user, conversation, db)
    except RuntimeError as error:
        logger.error("Career Coach failed for user %s: %s", current_user.username, error)
        raise HTTPException(status_code=503, detail="Career Coach is temporarily unavailable") from error
