"""Portfolio Retrieval Router - GET endpoints for accessing portfolios"""
import logging
from typing import Dict, Any
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.database import Portfolio, User
from app.models.schemas import PortfolioStatusResponse
from app.routers.auth_router import get_current_user

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
    # Query portfolio by slug with current_version eager loaded
    result = await db.execute(
        select(Portfolio)
        .options(selectinload(Portfolio.current_version))
        .where(Portfolio.slug == slug)
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

    # Return current version's public portfolio JSON
    if not portfolio.current_version or not portfolio.current_version.public_portfolio_json:
        raise HTTPException(
            status_code=500,
            detail="Portfolio data is missing. Please regenerate."
        )

    logger.info(f"Retrieved public portfolio for slug: {slug}")
    return portfolio.current_version.public_portfolio_json


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
    # Query portfolio by slug with current_version
    result = await db.execute(
        select(Portfolio)
        .options(selectinload(Portfolio.current_version))
        .where(Portfolio.slug == slug)
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
            detail=f"Portfolio is not ready. Current status: {portfolio.status}"
        )

    # Return current version's private coaching JSON
    if not portfolio.current_version or not portfolio.current_version.private_coaching_json:
        raise HTTPException(
            status_code=500,
            detail="Coaching insights are missing. Please regenerate."
        )

    logger.info(f"Retrieved private coaching for slug: {slug}")
    return portfolio.current_version.private_coaching_json


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
    # Query portfolio by slug with current_version
    result = await db.execute(
        select(Portfolio)
        .options(selectinload(Portfolio.current_version))
        .where(Portfolio.slug == slug)
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

    if portfolio.status != "completed" or not portfolio.current_version or not portfolio.current_version.public_portfolio_json:
        raise HTTPException(
            status_code=400,
            detail="Portfolio is not ready for viewing yet"
        )

    # Render portfolio HTML from current version
    logger.info(f"Rendering HTML portfolio for slug: {slug}")

    return templates.TemplateResponse(
        "portfolio.html",
        {
            "request": request,
            "portfolio": portfolio.current_version.public_portfolio_json
        }
    )


@router.get("/{slug}/versions")
async def list_portfolio_versions(
    slug: str,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """
    List all versions for a portfolio.
    
    Returns version metadata including version_state for UI rendering.
    
    Args:
        slug: Portfolio slug
        limit: Maximum number of versions to return (default 50)
        db: Database session
    
    Returns:
        List of versions with metadata
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
    
    # Query all versions for this portfolio
    from app.models.database import PortfolioVersion
    versions_result = await db.execute(
        select(PortfolioVersion)
        .where(PortfolioVersion.portfolio_id == portfolio.id)
        .order_by(PortfolioVersion.version_number.desc())
        .limit(limit)
    )
    versions = versions_result.scalars().all()
    
    # Format versions with all required fields
    version_list = [
        {
            "id": v.id,
            "version_number": v.version_number,
            "version_state": v.version_state.value,  # Include version_state for UI
            "changes_summary": v.changes_summary,
            "created_at": v.created_at.isoformat() + "Z",
            "created_by": v.created_by.value
        }
        for v in versions
    ]
    
    logger.info(f"Retrieved {len(version_list)} versions for portfolio {slug}")
    
    return {
        "versions": version_list,
        "total_count": len(version_list)
    }


@router.get("/me/all")
async def get_my_portfolios(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieve all portfolios belonging to the current user.
    """
    result = await db.execute(
        select(Portfolio)
        .where(Portfolio.user_id == current_user.id)
        .order_by(Portfolio.created_at.desc())
    )
    portfolios = result.scalars().all()

    return [
        {
            "id": p.id,
            "slug": p.slug,
            "name": p.name,
            "portfolio_focus": p.portfolio_focus,
            "status": p.status,
            "created_at": p.created_at.isoformat() + "Z"
        }
        for p in portfolios
    ]


@router.get("/{slug}/versions/{version_id}", response_model=Dict[str, Any])
async def get_portfolio_version(
    slug: str,
    version_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get a specific portfolio version by ID.
    
    This endpoint returns the full content of a specific version,
    including the portfolio JSON data.
    
    Args:
        slug: Portfolio slug
        version_id: UUID of the version to retrieve
        db: Database session
    
    Returns:
        Version metadata and portfolio JSON content
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
    
    # Query the specific version
    from app.models.database import PortfolioVersion
    version_result = await db.execute(
        select(PortfolioVersion)
        .where(PortfolioVersion.id == version_id)
        .where(PortfolioVersion.portfolio_id == portfolio.id)
    )
    version = version_result.scalar_one_or_none()
    
    if not version:
        raise HTTPException(
            status_code=404,
            detail=f"Version not found or does not belong to portfolio: {version_id}"
        )
    
    logger.info(f"Retrieved version {version.version_number} for portfolio {slug}")
    
    return {
        "id": version.id,
        "version_number": version.version_number,
        "version_state": version.version_state.value,
        "portfolio_json": version.public_portfolio_json,
        "changes_summary": version.changes_summary,
        "created_at": version.created_at.isoformat() + "Z",
        "created_by": version.created_by.value
    }



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
