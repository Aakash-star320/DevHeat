import httpx
from app.models.responses import LeetCodeResponse
from app.config import logger

# LeetCode GraphQL API endpoint
LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

# GraphQL query to fetch user profile and submission statistics
GRAPHQL_QUERY = """
query getUserProfile($username: String!) {
  matchedUser(username: $username) {
    username
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
    }
  }
}
"""


async def fetch_leetcode_stats(username: str) -> LeetCodeResponse:
    """
    Fetch LeetCode user statistics using GraphQL API.
    
    Args:
        username: LeetCode username
        
    Returns:
        LeetCodeResponse with user statistics
        
    Raises:
        httpx.HTTPStatusError: If API request fails (404 if user not found)
        httpx.RequestError: If network error occurs
    """
    logger.info(f"Fetching LeetCode stats for user: {username}")
    
    # Prepare GraphQL request
    payload = {
        "query": GRAPHQL_QUERY,
        "variables": {
            "username": username
        }
    }
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            # Send POST request to LeetCode GraphQL endpoint
            response = await client.post(
                LEETCODE_GRAPHQL_URL,
                json=payload,
                headers={
                    "Content-Type": "application/json",
                    "Referer": "https://leetcode.com"
                }
            )
            response.raise_for_status()
            
            # Parse response
            data = response.json()
            
            # Check if user exists
            matched_user = data.get("data", {}).get("matchedUser")
            
            if matched_user is None:
                logger.warning(f"LeetCode user not found: {username}")
                # Raise HTTPStatusError with 404 to be caught by router
                raise httpx.HTTPStatusError(
                    message=f"User '{username}' not found on LeetCode",
                    request=response.request,
                    response=response
                )
            
            # Extract submission statistics
            submit_stats = matched_user.get("submitStats", {})
            ac_submission_num = submit_stats.get("acSubmissionNum", [])
            
            # Initialize counters
            total_solved = 0
            easy_solved = 0
            medium_solved = 0
            hard_solved = 0
            
            # Parse difficulty counts
            for stat in ac_submission_num:
                difficulty = stat.get("difficulty", "")
                count = stat.get("count", 0)
                
                if difficulty == "All":
                    total_solved = count
                elif difficulty == "Easy":
                    easy_solved = count
                elif difficulty == "Medium":
                    medium_solved = count
                elif difficulty == "Hard":
                    hard_solved = count
            
            # Build profile URL
            profile_url = f"https://leetcode.com/{username}"
            
            logger.info(f"Stats for {username}: total={total_solved}, "
                       f"easy={easy_solved}, medium={medium_solved}, hard={hard_solved}")
            
            return LeetCodeResponse(
                username=username,
                total_solved=total_solved,
                easy_solved=easy_solved,
                medium_solved=medium_solved,
                hard_solved=hard_solved,
                profile_url=profile_url
            )
            
        except httpx.HTTPStatusError:
            # Re-raise HTTP errors (including our custom 404)
            raise
        except httpx.RequestError as e:
            logger.error(f"Network error fetching LeetCode data: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error parsing LeetCode response: {e}")
            raise
