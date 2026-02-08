"""Portfolio Editing Router - PATCH/POST endpoints for editing portfolios"""
import logging
from typing import Dict, Any, List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.database import Portfolio, PortfolioVersion
from app.models.portfolio_schemas import (
    PortfolioEditRequest,
    PortfolioRefineRequest,
    PortfolioRefineResponse,
    PortfolioVersionListResponse
)
from app.services.ai_service import refine_section
from app.services.portfolio_builder_service import merge_portfolio_updates

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/portfolio", tags=["Portfolio Editing"])


@router.patch("/{slug}")
async def edit_portfolio(
    slug: str,
    edit_request: PortfolioEditRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Manually edit portfolio fields.

    Creates a new version in version history and updates the portfolio.

    Args:
        slug: Unique portfolio slug
        edit_request: Fields to update with optional changes summary
        db: Database session

    Returns:
        Updated portfolio JSON
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

    if not portfolio.public_portfolio_json:
        raise HTTPException(
            status_code=400,
            detail="Portfolio has no content to edit"
        )

    # Create version snapshot before editing
    await _create_version_snapshot(
        portfolio=portfolio,
        created_by="user_manual",
        changes_summary=edit_request.changes_summary or "Manual edit",
        db=db
    )

    # Merge updates into portfolio
    updated_portfolio = merge_portfolio_updates(
        current_portfolio=portfolio.public_portfolio_json,
        updates=edit_request.updates
    )

    # Update portfolio
    portfolio.public_portfolio_json = updated_portfolio
    portfolio.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(portfolio)

    logger.info(f"Portfolio {slug} manually edited")

    return {
        "message": "Portfolio updated successfully",
        "slug": slug,
        "version_created": True,
        "updated_portfolio": portfolio.public_portfolio_json
    }


@router.post("/{slug}/refine", response_model=PortfolioRefineResponse)
async def refine_portfolio_section(
    slug: str,
    refine_request: PortfolioRefineRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    AI-assisted refinement of a portfolio section.

    Uses AI to refine content based on user instruction.
    Creates a new version in version history.

    Args:
        slug: Unique portfolio slug
        refine_request: Section name and refinement instruction
        db: Database session

    Returns:
        Refined content and version information
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

    if not portfolio.public_portfolio_json:
        raise HTTPException(
            status_code=400,
            detail="Portfolio has no content to refine"
        )

    # Extract current content of the section
    section = refine_request.section
    ai_content = portfolio.public_portfolio_json.get("ai_generated_content", {})

    if section not in ai_content:
        raise HTTPException(
            status_code=400,
            detail=f"Section '{section}' not found in portfolio. Available sections: {list(ai_content.keys())}"
        )

    current_content = ai_content[section]

    # Convert to string for AI refinement
    if isinstance(current_content, (list, dict)):
        import json
        current_content_str = json.dumps(current_content, indent=2)
    else:
        current_content_str = str(current_content)

    # Call AI to refine the section
    try:
        refined_content_str = await refine_section(
            current_content=current_content_str,
            instruction=refine_request.instruction,
            section_name=section
        )

        # Try to parse back to original type
        if isinstance(ai_content[section], (list, dict)):
            import json
            try:
                refined_content = json.loads(refined_content_str)
            except json.JSONDecodeError:
                # If JSON parsing fails, use as string
                refined_content = refined_content_str
        else:
            refined_content = refined_content_str

    except Exception as e:
        logger.error(f"AI refinement failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"AI refinement failed: {str(e)}"
        )

    # Create version snapshot before updating
    await _create_version_snapshot(
        portfolio=portfolio,
        created_by="ai_refinement",
        changes_summary=f"AI refinement of {section}: {refine_request.instruction}",
        db=db
    )

    # Update the portfolio with refined content
    portfolio.public_portfolio_json["ai_generated_content"][section] = refined_content
    portfolio.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(portfolio)

    logger.info(f"Portfolio {slug} section '{section}' refined via AI")

    return PortfolioRefineResponse(
        section=section,
        refined_content=refined_content_str,
        version_created=True
    )


@router.get("/{slug}/versions", response_model=PortfolioVersionListResponse)
async def list_portfolio_versions(
    slug: str,
    limit: int = 10,
    db: AsyncSession = Depends(get_db)
):
    """
    List version history for a portfolio.

    Args:
        slug: Unique portfolio slug
        limit: Maximum number of versions to return (default 10)
        db: Database session

    Returns:
        List of portfolio versions with metadata
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

    # Query versions
    versions_result = await db.execute(
        select(PortfolioVersion)
        .where(PortfolioVersion.portfolio_id == portfolio.id)
        .order_by(PortfolioVersion.created_at.desc())
        .limit(limit)
    )
    versions = versions_result.scalars().all()

    # Format versions
    version_list = [
        {
            "id": v.id,
            "version_number": v.version_number,
            "created_at": v.created_at.isoformat() + "Z",
            "created_by": v.created_by,
            "changes_summary": v.changes_summary
        }
        for v in versions
    ]

    return PortfolioVersionListResponse(
        versions=version_list,
        total_count=len(version_list)
    )


@router.post("/{slug}/versions/{version_id}/restore")
async def restore_portfolio_version(
    slug: str,
    version_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Restore a specific portfolio version.

    This creates a new version with the restored content.

    Args:
        slug: Unique portfolio slug
        version_id: Version ID to restore
        db: Database session

    Returns:
        Confirmation with restored portfolio
    """
    # Query portfolio by slug
    portfolio_result = await db.execute(
        select(Portfolio).where(Portfolio.slug == slug)
    )
    portfolio = portfolio_result.scalar_one_or_none()

    if not portfolio:
        raise HTTPException(
            status_code=404,
            detail=f"Portfolio not found with slug: {slug}"
        )

    # Query version
    version_result = await db.execute(
        select(PortfolioVersion).where(PortfolioVersion.id == version_id)
    )
    version = version_result.scalar_one_or_none()

    if not version or version.portfolio_id != portfolio.id:
        raise HTTPException(
            status_code=404,
            detail="Version not found or does not belong to this portfolio"
        )

    # Create snapshot of current state before restoring
    await _create_version_snapshot(
        portfolio=portfolio,
        created_by="user_manual",
        changes_summary=f"Before restoring version {version.version_number}",
        db=db
    )

    # Restore the version
    portfolio.public_portfolio_json = version.public_portfolio_json
    portfolio.private_coaching_json = version.private_coaching_json
    portfolio.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(portfolio)

    logger.info(f"Portfolio {slug} restored to version {version.version_number}")

    return {
        "message": "Version restored successfully",
        "slug": slug,
        "restored_version": version.version_number,
        "new_version_created": True
    }


async def _create_version_snapshot(
    portfolio: Portfolio,
    created_by: str,
    changes_summary: str,
    db: AsyncSession
):
    """
    Create a version snapshot of the current portfolio state.

    Args:
        portfolio: Portfolio instance
        created_by: Who created this version (ai, user_manual, ai_refinement)
        changes_summary: Description of changes
        db: Database session
    """
    # Get current max version number
    version_count_result = await db.execute(
        select(PortfolioVersion)
        .where(PortfolioVersion.portfolio_id == portfolio.id)
    )
    versions = version_count_result.scalars().all()
    next_version_number = len(versions) + 1

    # Create new version
    version = PortfolioVersion(
        portfolio_id=portfolio.id,
        version_number=next_version_number,
        public_portfolio_json=portfolio.public_portfolio_json,
        private_coaching_json=portfolio.private_coaching_json,
        changes_summary=changes_summary,
        created_by=created_by
    )

    db.add(version)
    await db.commit()

    logger.info(f"Created version {next_version_number} for portfolio {portfolio.slug}")
