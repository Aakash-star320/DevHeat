from fastapi import APIRouter, HTTPException
from app.models.responses import PortfolioRequest, PortfolioResponse, ErrorResponse
from app.utils.slug import generate_portfolio_slug
from app.config import logger

router = APIRouter(tags=["Portfolio"])


@router.post(
    "/",
    response_model=PortfolioResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"}
    },
    summary="Generate Portfolio Slug",
    description="Generates a unique URL-safe portfolio slug from a user's name"
)
async def generate_portfolio(request: PortfolioRequest) -> PortfolioResponse:
    """
    Generate a portfolio slug from a name.
    
    - **name**: User's name (required, non-empty)
    
    Returns a unique portfolio URL in format: `/portfolio/{slugified-name}-{random}`
    
    Example:
    - Input: "Aakash Singh"
    - Output: "/portfolio/aakash-singh-29fa2b"
    """
    logger.info(f"Generating portfolio slug for: {request.name}")
    
    try:
        # Generate slug
        slug = generate_portfolio_slug(request.name)
        
        # Build portfolio URL
        portfolio_url = f"/portfolio/{slug}"
        
        logger.info(f"Generated portfolio URL: {portfolio_url}")
        
        return PortfolioResponse(portfolio_url=portfolio_url)
    
    except Exception as e:
        logger.error(f"Error generating portfolio slug: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate portfolio slug: {str(e)}"
        )
