import httpx
import asyncio
from fastapi import APIRouter, HTTPException
from typing import Optional, Set, Tuple
from app.models.responses import CodeforcesResponse, ErrorResponse
from app.config import logger

router = APIRouter(prefix="/codeforces", tags=["Codeforces"])

# Codeforces API base URL
CF_API_BASE = "https://codeforces.com/api"


async def get_user_info(username: str) -> dict:
    """Fetch user info from Codeforces API"""
    url = f"{CF_API_BASE}/user.info?handles={username}"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            
            if data.get("status") != "OK":
                logger.warning(f"CF API returned non-OK status for user {username}")
                return None
            
            # API returns list of users, we need first one
            users = data.get("result", [])
            return users[0] if users else None
            
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error fetching user info: {e}")
            raise
        except httpx.RequestError as e:
            logger.error(f"Network error: {e}")
            raise


async def get_rating_history(username: str) -> list:
    """Fetch contest rating history"""
    url = f"{CF_API_BASE}/user.rating?handle={username}"
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            
            if data.get("status") != "OK":
                return []
            
            return data.get("result", [])
            
        except httpx.HTTPStatusError:
            return []
        except httpx.RequestError as e:
            logger.error(f"Network error fetching rating: {e}")
            raise


async def get_user_submissions(username: str) -> list:
    """Fetch user's submission history"""
    url = f"{CF_API_BASE}/user.status?handle={username}"
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()
            
            if data.get("status") != "OK":
                return []
            
            return data.get("result", [])
            
        except httpx.HTTPStatusError:
            return []
        except httpx.RequestError as e:
            logger.error(f"Network error fetching submissions: {e}")
            raise


def count_solved_problems(submissions: list) -> int:
    """
    Count unique problems solved (verdict == OK).
    A problem is identified by (contestId, index) pair.
    """
    solved: Set[Tuple[int, str]] = set()
    
    for sub in submissions:
        verdict = sub.get("verdict")
        if verdict != "OK":
            continue
        
        problem = sub.get("problem", {})
        contest_id = problem.get("contestId")
        index = problem.get("index")
        
        # Some problems don't have contestId (practice problems)
        if contest_id and index:
            solved.add((contest_id, index))
    
    return len(solved)


@router.get(
    "/{username}",
    response_model=CodeforcesResponse,
    responses={
        404: {"model": ErrorResponse, "description": "User not found"},
        502: {"model": ErrorResponse, "description": "Codeforces API unavailable"}
    },
    summary="Get Codeforces User Statistics",
    description="Fetches user statistics from Codeforces including rating, rank, contests, and problems solved"
)
async def get_codeforces_stats(username: str) -> CodeforcesResponse:
    """
    Retrieve Codeforces user statistics.
    
    - **username**: Codeforces handle
    
    Returns user's current rating, max rating, rank, contest count, and problems solved.
    """
    logger.info(f"Fetching Codeforces stats for user: {username}")
    
    try:
        # Fetch all data concurrently
        user_info, rating_history, submissions = await asyncio.gather(
            get_user_info(username),
            get_rating_history(username),
            get_user_submissions(username),
            return_exceptions=False
        )
        
        # Check if user exists
        if not user_info:
            logger.warning(f"User not found: {username}")
            raise HTTPException(
                status_code=404,
                detail=f"Codeforces user '{username}' not found"
            )
        
        # Extract user data
        current_rating = user_info.get("rating")
        max_rating = user_info.get("maxRating")
        rank = user_info.get("rank")
        
        # Count contests
        contest_count = len(rating_history)
        
        # Count solved problems
        problems_solved = count_solved_problems(submissions)
        
        logger.info(f"Stats for {username}: rating={current_rating}, "
                   f"contests={contest_count}, solved={problems_solved}")
        
        return CodeforcesResponse(
            username=username,
            current_rating=current_rating,
            max_rating=max_rating,
            rank=rank,
            contest_count=contest_count,
            problems_solved=problems_solved
        )
    
    except httpx.RequestError as e:
        logger.error(f"Network error while fetching CF data: {e}")
        raise HTTPException(
            status_code=502,
            detail="Codeforces API is currently unavailable. Please try again later."
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )
