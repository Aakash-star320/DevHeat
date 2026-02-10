"""Portfolio Refinement Router - AI-assisted portfolio editing"""
import logging
from typing import List, Dict, Any
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.database import Portfolio, PortfolioVersion, VersionState, VersionCreatedBy

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/portfolio", tags=["portfolio-refinement"])


# Request/Response Models
class RefineRequest(BaseModel):
    """Request body for portfolio refinement"""
    instruction: str = Field(..., min_length=1, max_length=1000, description="User instruction for refinement")
    sections: List[str] = Field(
        default_factory=lambda: ["all"],
        description="Sections to modify. Use ['all'] to refine entire portfolio, or specify sections like ['summary', 'experience']"
    )


class VersionMetadata(BaseModel):
    """Version metadata in response"""
    id: str
    version_number: int
    version_state: str


class RefineResponse(BaseModel):
    """Response for portfolio refinement"""
    version: VersionMetadata
    sections_updated: List[str]
    portfolio_json: Dict[str, Any]


@router.post("/{slug}/refine", response_model=RefineResponse)
async def refine_portfolio(
    slug: str,
    request: RefineRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Refine a portfolio using AI based on user instruction.
    
    This endpoint:
    1. Fetches the latest version from the database
    2. Sends it to Gemini AI with refinement instructions
    3. Creates a new DRAFT version with the refined content
    4. Updates current_version_id to the new draft
    
    Args:
        slug: Portfolio slug
        request: Refinement instruction and sections to modify
        db: Database session
    
    Returns:
        RefineResponse with new version metadata and updated portfolio JSON
    """
    logger.info(f"Refining portfolio {slug} - sections: {request.sections}")
    
    # Step 1: Resolve portfolio by slug
    result = await db.execute(
        select(Portfolio).where(Portfolio.slug == slug)
    )
    portfolio = result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(
            status_code=404,
            detail=f"Portfolio not found with slug: {slug}"
        )
    
    # Step 2: Fetch the latest version (highest version_number)
    latest_version_result = await db.execute(
        select(PortfolioVersion)
        .where(PortfolioVersion.portfolio_id == portfolio.id)
        .order_by(desc(PortfolioVersion.version_number))
        .limit(1)
    )
    latest_version = latest_version_result.scalar_one_or_none()
    
    if not latest_version or not latest_version.public_portfolio_json:
        raise HTTPException(
            status_code=400,
            detail="No existing version found. Please generate a portfolio first."
        )
    
    logger.info(f"Latest version: {latest_version.version_number}, state: {latest_version.version_state}")
    
    # Step 3: Call AI service to refine the portfolio
    from app.services.ai_refinement_service import refine_portfolio_content
    
    try:
        refined_json = await refine_portfolio_content(
            current_portfolio_json=latest_version.public_portfolio_json,
            instruction=request.instruction,
            sections_to_modify=request.sections
        )
        logger.info("AI refinement completed successfully")
    except Exception as e:
        logger.error(f"AI refinement failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"AI refinement failed: {str(e)}"
        )
    
    # Step 4: Create new DRAFT version
    new_version_number = latest_version.version_number + 1
    
    new_version = PortfolioVersion(
        portfolio_id=portfolio.id,
        version_number=new_version_number,
        version_state=VersionState.DRAFT,
        public_portfolio_json=refined_json,
        private_coaching_json=latest_version.private_coaching_json,  # Keep coaching unchanged
        changes_summary=f"AI refinement: {request.instruction[:100]}",
        created_by=VersionCreatedBy.AI_REFINEMENT
    )
    
    db.add(new_version)
    await db.flush()  # Get the new version ID
    
    # Step 5: Update portfolio's current_version_id to the new draft
    portfolio.current_version_id = new_version.id
    portfolio.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(new_version)
    
    logger.info(f"Created draft version {new_version_number} for portfolio {slug}")
    
    # Step 6: Return response
    return RefineResponse(
        version=VersionMetadata(
            id=new_version.id,
            version_number=new_version.version_number,
            version_state=new_version.version_state.value
        ),
        sections_updated=request.sections,
        portfolio_json=refined_json
    )


class ConfirmResponse(BaseModel):
    """Response for portfolio confirmation"""
    status: str
    version: VersionMetadata


@router.post("/{slug}/confirm", response_model=ConfirmResponse)
async def confirm_portfolio(
    slug: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Confirm and finalize the current portfolio version.
    
    This endpoint:
    1. Fetches the latest version from the database
    2. Creates a new COMMITTED version from it
    3. Deletes ALL other versions (drafts and old commits)
    4. Updates current_version_id to the new committed version
    
    All operations are performed in a single transaction.
    
    Args:
        slug: Portfolio slug
        db: Database session
    
    Returns:
        ConfirmResponse with status and new committed version metadata
    """
    logger.info(f"Confirming portfolio {slug}")
    
    # Step 1: Resolve portfolio by slug
    result = await db.execute(
        select(Portfolio).where(Portfolio.slug == slug)
    )
    portfolio = result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(
            status_code=404,
            detail=f"Portfolio not found with slug: {slug}"
        )
    
    # Step 2: Fetch the latest version (highest version_number)
    latest_version_result = await db.execute(
        select(PortfolioVersion)
        .where(PortfolioVersion.portfolio_id == portfolio.id)
        .order_by(desc(PortfolioVersion.version_number))
        .limit(1)
    )
    latest_version = latest_version_result.scalar_one_or_none()
    
    if not latest_version or not latest_version.public_portfolio_json:
        raise HTTPException(
            status_code=400,
            detail="No existing version found. Please generate a portfolio first."
        )
    
    logger.info(f"Latest version: {latest_version.version_number}, state: {latest_version.version_state}")
    
    # Step 3: Create NEW committed version (copy from latest)
    new_version_number = latest_version.version_number + 1
    
    committed_version = PortfolioVersion(
        portfolio_id=portfolio.id,
        version_number=new_version_number,
        version_state=VersionState.COMMITTED,
        public_portfolio_json=latest_version.public_portfolio_json,
        private_coaching_json=latest_version.private_coaching_json,
        changes_summary="Portfolio confirmed and finalized",
        created_by=VersionCreatedBy.USER_MANUAL
    )
    
    db.add(committed_version)
    await db.flush()  # Get the new version ID
    
    # Step 4: Update portfolio
    portfolio.current_version_id = committed_version.id
    portfolio.status = "completed"
    portfolio.updated_at = datetime.utcnow()
    
    # Step 5: Delete ALL other versions (keep only the new committed version)
    from sqlalchemy import delete
    
    await db.execute(
        delete(PortfolioVersion)
        .where(PortfolioVersion.portfolio_id == portfolio.id)
        .where(PortfolioVersion.id != committed_version.id)
    )
    
    # Commit the transaction
    await db.commit()
    await db.refresh(committed_version)
    
    logger.info(f"Confirmed portfolio {slug} - created committed version {new_version_number}, deleted all other versions")
    
    # Step 6: Return response
    return ConfirmResponse(
        status="confirmed",
        version=VersionMetadata(
            id=committed_version.id,
            version_number=committed_version.version_number,
            version_state=committed_version.version_state.value
        )
    )


class RevertRequest(BaseModel):
    """Request body for portfolio revert"""
    version_id: str = Field(..., description="UUID of the version to revert to")


class RevertResponse(BaseModel):
    """Response for portfolio revert"""
    status: str
    version: VersionMetadata


@router.post("/{slug}/revert", response_model=RevertResponse)
async def revert_portfolio(
    slug: str,
    request: RevertRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Revert portfolio to a specific version.
    
    This endpoint:
    1. Resolves the portfolio using the slug
    2. Fetches the selected portfolio version using version_id
    3. Creates a NEW committed version (copy of selected version)
    4. Updates current_version_id to the new committed version
    5. Deletes ALL other versions (drafts and old commits)
    
    All operations are performed in a single transaction.
    
    Args:
        slug: Portfolio slug
        request: Contains version_id to revert to
        db: Database session
    
    Returns:
        RevertResponse with status and new committed version metadata
    """
    logger.info(f"Reverting portfolio {slug} to version {request.version_id}")
    
    # Step 1: Resolve portfolio by slug
    result = await db.execute(
        select(Portfolio).where(Portfolio.slug == slug)
    )
    portfolio = result.scalar_one_or_none()
    
    if not portfolio:
        raise HTTPException(
            status_code=404,
            detail=f"Portfolio not found with slug: {slug}"
        )
    
    # Step 2: Fetch the selected version using version_id
    selected_version_result = await db.execute(
        select(PortfolioVersion)
        .where(PortfolioVersion.id == request.version_id)
        .where(PortfolioVersion.portfolio_id == portfolio.id)
    )
    selected_version = selected_version_result.scalar_one_or_none()
    
    if not selected_version:
        raise HTTPException(
            status_code=400,
            detail=f"Version not found or does not belong to portfolio: {request.version_id}"
        )
    
    logger.info(f"Selected version: {selected_version.version_number}, state: {selected_version.version_state}")
    
    # Step 3: Get max version number for creating new version
    max_version_result = await db.execute(
        select(PortfolioVersion.version_number)
        .where(PortfolioVersion.portfolio_id == portfolio.id)
        .order_by(desc(PortfolioVersion.version_number))
        .limit(1)
    )
    max_version_number = max_version_result.scalar_one_or_none() or 0
    new_version_number = max_version_number + 1
    
    # Step 4: Create NEW committed version (copy from selected version)
    committed_version = PortfolioVersion(
        portfolio_id=portfolio.id,
        version_number=new_version_number,
        version_state=VersionState.COMMITTED,
        public_portfolio_json=selected_version.public_portfolio_json,
        private_coaching_json=selected_version.private_coaching_json,
        changes_summary=f"Reverted to version {selected_version.version_number}",
        created_by=VersionCreatedBy.USER_MANUAL
    )
    
    db.add(committed_version)
    await db.flush()  # Get the new version ID
    
    # Step 5: Update portfolio
    portfolio.current_version_id = committed_version.id
    portfolio.status = "completed"
    portfolio.updated_at = datetime.utcnow()
    
    # Step 6: Delete ALL other versions (keep only the new committed version)
    from sqlalchemy import delete
    
    await db.execute(
        delete(PortfolioVersion)
        .where(PortfolioVersion.portfolio_id == portfolio.id)
        .where(PortfolioVersion.id != committed_version.id)
    )
    
    # Commit the transaction
    await db.commit()
    await db.refresh(committed_version)
    
    logger.info(f"Reverted portfolio {slug} to version {selected_version.version_number} - created committed version {new_version_number}, deleted all other versions")
    
    # Step 7: Return response
    return RevertResponse(
        status="reverted",
        version=VersionMetadata(
            id=committed_version.id,
            version_number=committed_version.version_number,
            version_state=committed_version.version_state.value
        )
    )
