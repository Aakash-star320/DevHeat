"""Career Bot API Router"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from app.routers.auth_router import get_current_user
from app.models.database import User, ChatMessage
from app.services import career_bot_service
from app.config import logger

router = APIRouter(prefix="/career-bot", tags=["Career Bot"])


# Request/Response Models
class ChatMessageRequest(BaseModel):
    """Request model for sending a chat message"""
    message: str


class ChatMessageResponse(BaseModel):
    """Response model for chat message"""
    user_message: str
    assistant_message: str
    ai_service: str
    model_used: str
    timestamp: str


class ChatHistoryItem(BaseModel):
    """Individual chat message in history"""
    role: str
    content: str
    created_at: str
    ai_service: Optional[str] = None


class ChatHistoryResponse(BaseModel):
    """Response model for chat history"""
    messages: List[ChatHistoryItem]
    total_count: int


@router.post(
    "/chat",
    response_model=ChatMessageResponse,
    summary="Send message to AI career bot",
    description="Send a message and receive AI-powered career guidance",
    responses={
        200: {"description": "Successful response from AI"},
        400: {"description": "Empty message or validation error"},
        401: {"description": "Unauthorized - login required"},
        500: {"description": "AI service unavailable"}
    }
)
async def send_chat_message(
    request: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send a message to the AI career bot and get personalized advice.

    The bot has access to:
    - Your GitHub profile and repositories
    - Your uploaded resume
    - LeetCode and Codeforces stats (if provided)
    - Previous conversation history

    **Example request:**
    ```json
    {
        "message": "What skills should I focus on for a backend developer role?"
    }
    ```
    """
    if not request.message or not request.message.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message cannot be empty"
        )

    try:
        response = await career_bot_service.send_message(
            user_message=request.message.strip(),
            user=current_user,
            db=db
        )
        return response
    except Exception as e:
        logger.error(f"Error in chat endpoint for user {current_user.username}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process message: {str(e)}"
        )


@router.get(
    "/history",
    response_model=ChatHistoryResponse,
    summary="Get conversation history",
    description="Retrieve your chat history with the career bot",
    responses={
        200: {"description": "Chat history retrieved successfully"},
        401: {"description": "Unauthorized - login required"}
    }
)
async def get_chat_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get your conversation history with pagination.

    **Parameters:**
    - **limit**: Maximum number of messages to return (default: 50, max: 100)
    - **offset**: Number of messages to skip for pagination (default: 0)

    **Example:**
    - Get first 50 messages: `GET /career-bot/history`
    - Get next 50 messages: `GET /career-bot/history?offset=50&limit=50`
    """
    # Validate parameters
    if limit > 100:
        limit = 100
    if offset < 0:
        offset = 0

    # Get total count
    count_result = await db.execute(
        select(func.count(ChatMessage.id))
        .where(ChatMessage.user_id == current_user.id)
    )
    total_count = count_result.scalar()

    # Get paginated messages
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.created_at.asc())
        .offset(offset)
        .limit(limit)
    )
    messages = result.scalars().all()

    return {
        "messages": [
            {
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
                "ai_service": msg.ai_service
            }
            for msg in messages
        ],
        "total_count": total_count
    }


@router.delete(
    "/history",
    summary="Clear conversation history",
    description="Delete all your chat messages",
    responses={
        200: {"description": "History cleared successfully"},
        401: {"description": "Unauthorized - login required"}
    }
)
async def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Clear your entire conversation history with the career bot.

    **Warning:** This action cannot be undone. All your chat messages will be permanently deleted.

    **Returns:**
    ```json
    {
        "message": "Deleted N messages",
        "count": N
    }
    ```
    """
    # Fetch all messages for the user
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == current_user.id)
    )
    messages = result.scalars().all()

    # Delete all messages
    count = len(messages)
    for msg in messages:
        await db.delete(msg)

    await db.commit()

    logger.info(f"User {current_user.username} cleared {count} chat messages")

    return {
        "message": f"Deleted {count} messages",
        "count": count
    }
