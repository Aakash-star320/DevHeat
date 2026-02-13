"""AI Career Bot Service - OpenRouter + Gemini fallback"""
import logging
import httpx
import json
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.database import User, Portfolio, ChatMessage
from app.config import (
    OPENROUTER_API_KEY,
    OPENROUTER_BASE_URL,
    OPENROUTER_MODEL,
    OPENROUTER_SITE_URL,
    OPENROUTER_APP_NAME,
    GEMINI_API_KEY,
    logger
)
import google.generativeai as genai

# Configure Gemini as fallback
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


async def gather_user_context(user: User, db: AsyncSession) -> Dict[str, Any]:
    """
    Gather comprehensive user context from all available sources.

    Args:
        user: The current user
        db: Database session

    Returns:
        Dictionary with user_info, resume, github_repos, leetcode, codeforces, linkedin data
    """
    context = {
        "user_info": {
            "username": user.username,
            "email": user.email or "N/A",
            "github_profile": f"https://github.com/{user.username}"
        }
    }

    # Fetch user's most recent portfolio
    result = await db.execute(
        select(Portfolio)
        .where(Portfolio.user_id == user.id)
        .order_by(Portfolio.created_at.desc())
        .limit(1)
    )
    portfolio = result.scalars().first()

    if portfolio:
        context["resume_text"] = portfolio.resume_text or ""
        context["github_data"] = portfolio.github_data or []
        context["leetcode_data"] = portfolio.leetcode_data or {}
        context["codeforces_data"] = portfolio.codeforces_data or {}
        context["linkedin_data"] = portfolio.linkedin_data or {}
        context["portfolio_focus"] = portfolio.portfolio_focus or "general"
    else:
        context["resume_text"] = ""
        context["github_data"] = []
        context["leetcode_data"] = {}
        context["codeforces_data"] = {}
        context["linkedin_data"] = {}
        context["portfolio_focus"] = "general"

    # Real-time GitHub repo fetch using user's access token
    if user.access_token:
        try:
            from app.services.github_service import get_user_repositories
            repos = await get_user_repositories(user.access_token)
            context["latest_github_repos"] = repos[:10]  # Top 10 recent repos
        except Exception as e:
            logger.warning(f"Could not fetch real-time GitHub repos: {e}")
            context["latest_github_repos"] = []
    else:
        context["latest_github_repos"] = []

    return context


async def get_conversation_history(
    user_id: str,
    db: AsyncSession,
    limit: int = 10
) -> List[Dict[str, str]]:
    """
    Fetch recent conversation history for context.

    Args:
        user_id: User ID
        db: Database session
        limit: Maximum number of messages to retrieve

    Returns:
        List of {role, content} dicts in chronological order
    """
    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.user_id == user_id)
        .order_by(ChatMessage.created_at.desc())
        .limit(limit)
    )
    messages = result.scalars().all()

    # Reverse to chronological order (oldest first)
    return [
        {"role": msg.role, "content": msg.content}
        for msg in reversed(messages)
    ]


def build_career_bot_system_prompt(context: Dict[str, Any]) -> str:
    """
    Build comprehensive system prompt with user context.

    Args:
        context: User context dictionary

    Returns:
        System prompt string
    """
    # Prepare context summary (truncate to manage token costs)
    context_summary = json.dumps({
        "user_info": context.get("user_info", {}),
        "portfolio_focus": context.get("portfolio_focus", "general"),
        "has_resume": bool(context.get("resume_text")),
        "resume_snippet": context.get("resume_text", "")[:500],  # First 500 chars
        "github_repos_count": len(context.get("github_data", [])),
        "latest_repos_count": len(context.get("latest_github_repos", [])),
        "has_leetcode": bool(context.get("leetcode_data")),
        "has_codeforces": bool(context.get("codeforces_data")),
        "has_linkedin": bool(context.get("linkedin_data"))
    }, indent=2)

    return f"""You are an AI Career Coach helping a software developer with personalized career guidance.

USER PROFILE:
- GitHub Username: {context['user_info']['username']}
- Email: {context['user_info'].get('email', 'N/A')}
- Profile URL: {context['user_info']['github_profile']}

AVAILABLE DATA:
{context_summary}

YOUR ROLE:
- Provide personalized career advice based on the user's profile and data
- Answer questions about their skills, projects, and career path
- Suggest learning resources and next steps for career growth
- Help with interview preparation and job search strategies
- Be encouraging, supportive, but honest in your assessments

GUIDELINES:
- Reference specific data from their resume, GitHub repos, or coding stats when relevant
- If certain data is missing (e.g., no resume uploaded), politely suggest they add it for better advice
- Be concise and actionable in your responses
- Format responses in markdown for better readability
- Ask clarifying questions when needed to provide better advice
- Focus on practical, actionable career guidance

Remember: You're a supportive career coach, not just an information provider. Be empathetic and motivating!
"""


async def chat_with_openrouter(
    messages: List[Dict[str, str]],
    system_prompt: str
) -> Tuple[str, str]:
    """
    Send chat to OpenRouter API.

    Args:
        messages: List of conversation messages
        system_prompt: System prompt for context

    Returns:
        Tuple of (response_text, model_used)

    Raises:
        Exception: On API failure
    """
    if not OPENROUTER_API_KEY:
        raise ValueError("OpenRouter API key not configured")

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "HTTP-Referer": OPENROUTER_SITE_URL,
        "X-Title": OPENROUTER_APP_NAME,
        "Content-Type": "application/json"
    }

    # Build messages with system prompt
    full_messages = [{"role": "system", "content": system_prompt}] + messages

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": full_messages,
        "temperature": 0.7,
        "max_tokens": 2000
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers=headers,
            json=payload
        )
        response.raise_for_status()

        data = response.json()
        content = data["choices"][0]["message"]["content"]
        model = data.get("model", OPENROUTER_MODEL)

        return content, model


async def chat_with_gemini(
    messages: List[Dict[str, str]],
    system_prompt: str
) -> Tuple[str, str]:
    """
    Fallback to Gemini API.

    Args:
        messages: List of conversation messages
        system_prompt: System prompt for context

    Returns:
        Tuple of (response_text, model_used)

    Raises:
        Exception: On API failure
    """
    if not GEMINI_API_KEY:
        raise ValueError("Gemini API key not configured")

    model = genai.GenerativeModel("gemini-flash-latest")

    # Gemini doesn't support system messages directly, prepend to conversation
    conversation_text = f"{system_prompt}\n\n"
    for msg in messages:
        role_label = "USER" if msg["role"] == "user" else "ASSISTANT"
        conversation_text += f"{role_label}: {msg['content']}\n\n"

    conversation_text += "ASSISTANT: "

    response = model.generate_content(
        conversation_text,
        generation_config=genai.types.GenerationConfig(
            temperature=0.7,
            max_output_tokens=2000
        )
    )

    return response.text, "gemini-flash-latest"


async def send_message(
    user_message: str,
    user: User,
    db: AsyncSession
) -> Dict[str, Any]:
    """
    Main function: Process user message and return AI response.

    Args:
        user_message: The user's input message
        user: Current user
        db: Database session

    Returns:
        Dictionary with user_message, assistant_message, ai_service, model_used, timestamp

    Raises:
        Exception: If both OpenRouter and Gemini fail
    """
    # 1. Gather context
    logger.info(f"Gathering context for user {user.username}")
    context = await gather_user_context(user, db)
    system_prompt = build_career_bot_system_prompt(context)

    # 2. Get conversation history
    history = await get_conversation_history(user.id, db, limit=10)

    # 3. Add current user message
    history.append({"role": "user", "content": user_message})

    # 4. Try OpenRouter first, fallback to Gemini
    ai_service = None
    model_used = None
    assistant_response = None

    try:
        logger.info("Attempting OpenRouter API call")
        assistant_response, model_used = await chat_with_openrouter(history, system_prompt)
        ai_service = "openrouter"
        logger.info(f"OpenRouter response successful with model: {model_used}")
    except Exception as e:
        logger.warning(f"OpenRouter failed: {e}. Falling back to Gemini.")
        try:
            logger.info("Attempting Gemini API call")
            assistant_response, model_used = await chat_with_gemini(history, system_prompt)
            ai_service = "gemini"
            logger.info("Gemini fallback successful")
        except Exception as gemini_error:
            logger.error(f"Both OpenRouter and Gemini failed: {gemini_error}")
            raise Exception("AI service unavailable. Please try again later.")

    # 5. Save messages to database
    user_msg = ChatMessage(
        user_id=user.id,
        role="user",
        content=user_message
    )
    assistant_msg = ChatMessage(
        user_id=user.id,
        role="assistant",
        content=assistant_response,
        ai_service=ai_service,
        model_used=model_used
    )

    db.add(user_msg)
    db.add(assistant_msg)
    await db.commit()

    logger.info(f"Chat message saved successfully (service: {ai_service})")

    return {
        "user_message": user_message,
        "assistant_message": assistant_response,
        "ai_service": ai_service,
        "model_used": model_used,
        "timestamp": assistant_msg.created_at.isoformat()
    }
