import asyncio
import httpx
from fastapi import APIRouter, HTTPException
from app.models.responses import (
    GitHubAnalyzeRequest,
    GitHubAnalyzeResponse,
    GitHubRepoAnalysis,
    ErrorResponse
)
from app.services.github_service import analyze_repository, get_user_repositories
from app.config import logger
from app.routers.auth_router import get_current_user, User
from fastapi import Depends

router = APIRouter(prefix="/github", tags=["GitHub"])


@router.get(
    "/user-repos",
    summary="Get user's GitHub repositories",
    description="Fetches the authenticated user's repositories from GitHub"
)
async def get_my_repos(current_user: User = Depends(get_current_user)):
    """
    Get the authenticated user's GitHub repositories.
    """
    if not current_user.access_token:
        raise HTTPException(
            status_code=400,
            detail="User does not have a GitHub access token. Please sign in again."
        )

    try:
        repos = await get_user_repositories(current_user.access_token)
        return {"repos": repos}
    except Exception as e:
        logger.error(f"Error fetching user repositories: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch repositories from GitHub: {str(e)}"
        )


@router.post(
    "/analyze",
    response_model=GitHubAnalyzeResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid request"},
        404: {"model": ErrorResponse, "description": "Repository not found"},
        502: {"model": ErrorResponse, "description": "GitHub API unavailable"}
    },
    summary="Analyze GitHub Repositories",
    description="Analyzes 1-5 GitHub repositories and returns metadata, structure, and README content"
)
async def analyze_repositories(request: GitHubAnalyzeRequest) -> GitHubAnalyzeResponse:
    """
    Analyze GitHub repositories.
    
    - **repos**: List of 1-5 GitHub repository URLs
    
    Returns detailed analysis including:
    - Repository metadata (name, description, language, last updated)
    - Structure analysis (files, folders, depth, top directories)
    - README content (truncated to 10k characters)
    """
    logger.info(f"Analyzing {len(request.repos)} repositories")
    
    try:
        # Analyze all repositories concurrently
        tasks = [analyze_repository(repo_url) for repo_url in request.repos]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results and handle errors
        analyzed_repos = []
        
        for i, result in enumerate(results):
            repo_url = request.repos[i]
            
            if isinstance(result, Exception):
                # Handle specific exceptions
                if isinstance(result, httpx.HTTPStatusError):
                    status_code = result.response.status_code
                    
                    if status_code == 404:
                        logger.warning(f"Repository not found: {repo_url}")
                        raise HTTPException(
                            status_code=404,
                            detail=f"Repository not found: {repo_url}"
                        )
                    elif status_code == 403:
                        logger.error(f"GitHub API rate limit or permission denied: {repo_url}")
                        raise HTTPException(
                            status_code=502,
                            detail="GitHub API rate limit exceeded or access denied. Please check your token permissions."
                        )
                    else:
                        logger.error(f"GitHub API error {status_code}: {repo_url}")
                        raise HTTPException(
                            status_code=502,
                            detail=f"GitHub API returned error {status_code}"
                        )
                
                elif isinstance(result, httpx.RequestError):
                    logger.error(f"Network error for {repo_url}: {result}")
                    raise HTTPException(
                        status_code=502,
                        detail="GitHub API is currently unavailable. Please try again later."
                    )
                
                elif isinstance(result, ValueError):
                    # Invalid URL or missing token
                    logger.error(f"Validation error: {result}")
                    raise HTTPException(
                        status_code=400,
                        detail=str(result)
                    )
                
                else:
                    # Unexpected error
                    logger.error(f"Unexpected error analyzing {repo_url}: {result}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"An unexpected error occurred: {str(result)}"
                    )
            
            else:
                # Success - add to results
                analyzed_repos.append(result)
        
        logger.info(f"Successfully analyzed {len(analyzed_repos)} repositories")
        
        return GitHubAnalyzeResponse(repos=analyzed_repos)
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        logger.error(f"Unexpected error in analyze_repositories: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )
