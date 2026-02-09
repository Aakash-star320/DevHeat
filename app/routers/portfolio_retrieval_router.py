"""Portfolio Retrieval Router - GET endpoints for accessing portfolios"""
import logging
from typing import Dict, Any
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.database import Portfolio
from app.models.schemas import PortfolioStatusResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/portfolio", tags=["Portfolio Retrieval"])

# Setup Jinja2 templates
templates = Jinja2Templates(directory="app/templates")


@router.get("/{slug}", response_model=Dict[str, Any])
async def get_public_portfolio(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve public portfolio by slug.

    This endpoint returns the publicly-accessible portfolio JSON
    suitable for displaying to recruiters and on portfolio websites.

    Args:
        slug: Unique portfolio slug (e.g., "john-doe-29fa2b")
        db: Database session

    Returns:
        Public portfolio JSON with AI-generated content and data sources
    """
    # Query portfolio by slug
    result = await db.execute(
        select(Portfolio).where(Portfolio.slug == slug)
    )
    portfolio = result.scalar_one_or_none()

    if not portfolio:
        raise HTTPException(
            status_code=404,
            detail=f"Portfolio not found with slug: {slug}"
        )

    # Check portfolio status
    if portfolio.status == "generating":
        raise HTTPException(
            status_code=202,
            detail="Portfolio is still being generated. Please check back in a moment.",
            headers={"Retry-After": "10"}
        )

    if portfolio.status == "error":
        raise HTTPException(
            status_code=500,
            detail=f"Portfolio generation failed: {portfolio.error_message}"
        )

    if portfolio.status == "draft":
        raise HTTPException(
            status_code=400,
            detail="Portfolio is in draft status and not yet generated"
        )

    # Return public portfolio JSON
    if not portfolio.public_portfolio_json:
        raise HTTPException(
            status_code=500,
            detail="Portfolio data is missing. Please regenerate."
        )

    logger.info(f"Retrieved public portfolio for slug: {slug}")
    return portfolio.public_portfolio_json


@router.get("/{slug}/coaching", response_model=Dict[str, Any])
async def get_private_coaching(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve private coaching insights by slug.

    This endpoint returns the private, user-only coaching JSON
    with honest feedback, skill gaps, and improvement suggestions.

    NOTE: In production, this should be protected with authentication.

    Args:
        slug: Unique portfolio slug
        db: Database session

    Returns:
        Private coaching JSON with skill analysis and recommendations
    """
    # Query portfolio by slug
    result = await db.execute(
        select(Portfolio).where(Portfolio.slug == slug)
    )
    portfolio = result.scalar_one_or_none()

    if not portfolio:
        raise HTTPException(
            status_code=404,
            detail=f"Portfolio not found with slug: {slug}"
        )

    # Check portfolio status
    if portfolio.status != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Portfolio is not completed yet (status: {portfolio.status})"
        )

    # Return private coaching JSON
    if not portfolio.private_coaching_json:
        raise HTTPException(
            status_code=500,
            detail="Coaching data is missing. Please regenerate portfolio."
        )

    logger.info(f"Retrieved private coaching for slug: {slug}")
    return portfolio.private_coaching_json


@router.get("/{slug}/status", response_model=PortfolioStatusResponse)
async def get_portfolio_status(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Check portfolio generation status.

    Useful for polling while portfolio is being generated.

    Args:
        slug: Unique portfolio slug
        db: Database session

    Returns:
        Portfolio status information with timestamps
    """
    # Query portfolio by slug
    result = await db.execute(
        select(Portfolio).where(Portfolio.slug == slug)
    )
    portfolio = result.scalar_one_or_none()

    if not portfolio:
        raise HTTPException(
            status_code=404,
            detail=f"Portfolio not found with slug: {slug}"
        )

    logger.info(f"Status check for portfolio: {slug} - {portfolio.status}")

    return PortfolioStatusResponse(
        portfolio_id=portfolio.id,
        slug=portfolio.slug,
        status=portfolio.status,
        generation_started_at=portfolio.generation_started_at,
        generation_completed_at=portfolio.generation_completed_at,
        error_message=portfolio.error_message
    )


@router.get("/{slug}/view", response_class=HTMLResponse)
async def view_portfolio_html(
    request: Request,
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Render portfolio as HTML page.

    This endpoint returns a beautiful, responsive HTML page
    for the portfolio instead of JSON data.

    Perfect for sharing portfolio links with recruiters!

    Args:
        request: FastAPI request object (needed for templates)
        slug: Unique portfolio slug
        db: Database session

    Returns:
        Rendered HTML page
    """
    # Query portfolio by slug
    result = await db.execute(
        select(Portfolio).where(Portfolio.slug == slug)
    )
    portfolio = result.scalar_one_or_none()

    if not portfolio:
        raise HTTPException(
            status_code=404,
            detail=f"Portfolio not found with slug: {slug}"
        )

    # Check portfolio status
    if portfolio.status == "generating":
        # Return a loading page
        return templates.TemplateResponse(
            "generating.html",
            {
                "request": request,
                "slug": slug,
                "message": "Portfolio is being generated. Please refresh in a moment."
            }
        )

    if portfolio.status == "error":
        raise HTTPException(
            status_code=500,
            detail=f"Portfolio generation failed: {portfolio.error_message}"
        )

    if portfolio.status != "completed" or not portfolio.public_portfolio_json:
        raise HTTPException(
            status_code=400,
            detail="Portfolio is not ready for viewing yet"
        )

    # Render portfolio HTML
    logger.info(f"Rendering HTML portfolio for slug: {slug}")

    return templates.TemplateResponse(
        "portfolio.html",
        {
            "request": request,
            "portfolio": portfolio.public_portfolio_json
        }
    )


@router.get("/debug/last-ai-generation", response_class=HTMLResponse)
async def get_last_debug_info(request: Request):
    """
    Debug endpoint to see the last AI prompt and response.
    
    This is useful for troubleshooting why certain data might be missing
    or why AI generation failed.
    """
    try:
        log_dir = Path("logs")
        prompt_path = log_dir / "last_portfolio_generation_prompt.txt"
        response_path = log_dir / "last_portfolio_generation_response.txt"
        error_path = log_dir / "last_portfolio_generation_error.txt"
        
        prompt = "No prompt logged yet."
        if prompt_path.exists():
            with open(prompt_path, "r", encoding="utf-8") as f:
                prompt = f.read()
                
        response = "No response logged yet."
        if response_path.exists():
            with open(response_path, "r", encoding="utf-8") as f:
                response = f.read()
                
        error = "No error logged."
        if error_path.exists():
            with open(error_path, "r", encoding="utf-8") as f:
                error = f.read()
                
        # Simple HTML response for easier reading
        html_content = f"""
        <html>
            <head>
                <title>AI Debug Info</title>
                <style>
                    body {{ font-family: sans-serif; padding: 20px; background: #f5f5f5; }}
                    pre {{ background: #fff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; overflow-x: auto; white-space: pre-wrap; }}
                    h2 {{ color: #333; }}
                    .error {{ color: #d32f2f; }}
                </style>
            </head>
            <body>
                <h1>Last AI Generation Debug Info</h1>
                
                <h2>1. Error (if any)</h2>
                <pre class="error">{error}</pre>
                
                <h2>2. Prompt Sent to Gemini</h2>
                <pre>{prompt}</pre>
                
                <h2>3. Raw Response from Gemini</h2>
                <pre>{response}</pre>
                
                <p><a href="/">Back to Home</a></p>
            </body>
        </html>
        """
        return HTMLResponse(content=html_content)
    except Exception as e:
        return HTMLResponse(content=f"<h1>Debug Error</h1><p>{str(e)}</p>")
