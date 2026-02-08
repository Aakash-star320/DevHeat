import httpx
from fastapi import APIRouter, HTTPException
from app.models.responses import LeetCodeResponse, ErrorResponse
from app.services.leetcode_service import fetch_leetcode_stats
from app.config import logger

router = APIRouter(prefix="/leetcode", tags=["LeetCode"])


@router.get(
    "/{username}",
    response_model=LeetCodeResponse,
    responses={
        404: {"model": ErrorResponse, "description": "User not found"},
        502: {"model": ErrorResponse, "description": "LeetCode API unavailable"}
    },
    summary="Get LeetCode User Statistics",
    description="Fetches user statistics from LeetCode including problems solved by difficulty"
)
async def get_leetcode_stats(username: str) -> LeetCodeResponse:
    """
    Retrieve LeetCode user statistics.
    
    - **username**: LeetCode username
    
    Returns user's problem-solving statistics:
    - Total problems solved
    - Easy, Medium, Hard breakdown
    - Profile URL
    """
    logger.info(f"Fetching LeetCode stats for user: {username}")
    
    try:
        # Fetch statistics from LeetCode
        stats = await fetch_leetcode_stats(username)
        return stats
    
    except httpx.HTTPStatusError as e:
        # Check if it's a user not found error
        if "not found" in str(e).lower():
            logger.warning(f"LeetCode user not found: {username}")
            raise HTTPException(
                status_code=404,
                detail=f"LeetCode user '{username}' not found"
            )
        else:
            logger.error(f"LeetCode API error: {e}")
            raise HTTPException(
                status_code=502,
                detail="LeetCode API returned an error. Please try again later."
            )
    
    except httpx.RequestError as e:
        logger.error(f"Network error while fetching LeetCode data: {e}")
        raise HTTPException(
            status_code=502,
            detail="LeetCode API is currently unavailable. Please try again later."
        )
    
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )
