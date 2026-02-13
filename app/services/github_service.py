import os
import re
import base64
import httpx
from typing import Tuple, Optional
from dotenv import load_dotenv
from app.models.responses import GitHubRepoAnalysis, RepositoryStructure
from app.config import logger

# Load environment variables
load_dotenv()

# GitHub API base URL
GITHUB_API_BASE = "https://api.github.com"


def load_github_token() -> Optional[str]:
    """
    Load GitHub token from environment variables.
    Returns None if not configured so the app can still work with public
    rate limits (60 requests/hour) and returns clearer guidance to the user.
    """
    token = os.getenv("GITHUB_TOKEN")
    if token and token.strip() and token != "your_github_personal_access_token_here":
        return token.strip()

    logger.warning(
        "GITHUB_TOKEN not set. Proceeding unauthenticated (limited to 60 requests/hour)."
    )
    return None


def parse_github_url(url: str) -> Tuple[str, str]:
    """
    Extract owner and repo name from GitHub URL.
    
    Args:
        url: GitHub repository URL
        
    Returns:
        Tuple of (owner, repo)
        
    Raises:
        ValueError: If URL format is invalid
    """
    # Remove trailing slash
    url = url.rstrip('/')
    
    # Pattern: https://github.com/owner/repo
    pattern = r'^https?://github\.com/([\w\-\.]+)/([\w\-\.]+)/?$'
    match = re.match(pattern, url)
    
    if not match:
        raise ValueError(f"Invalid GitHub URL format: {url}")
    
    owner, repo = match.groups()
    return owner, repo


async def get_repo_metadata(
    client: httpx.AsyncClient,
    owner: str,
    repo: str
) -> dict:
    """
    Fetch repository metadata from GitHub API.
    
    Args:
        client: HTTP client
        owner: Repository owner
        repo: Repository name
        
    Returns:
        Repository metadata dict
        
    Raises:
        httpx.HTTPStatusError: If API request fails
    """
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}"
    
    logger.info(f"Fetching metadata for {owner}/{repo}")
    
    response = await client.get(url)
    response.raise_for_status()
    
    return response.json()


async def get_repo_tree(
    client: httpx.AsyncClient,
    owner: str,
    repo: str,
    branch: str
) -> dict:
    """
    Fetch repository tree (recursive) from GitHub API.
    
    Args:
        client: HTTP client
        owner: Repository owner
        repo: Repository name
        branch: Branch name (usually 'main' or 'master')
        
    Returns:
        Tree data dict
        
    Raises:
        httpx.HTTPStatusError: If API request fails
    """
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
    
    logger.info(f"Fetching tree for {owner}/{repo} (branch: {branch})")
    
    response = await client.get(url)
    response.raise_for_status()
    
    return response.json()


def analyze_tree_structure(tree_data: dict) -> RepositoryStructure:
    """
    Analyze repository tree structure and compute metrics.
    
    Args:
        tree_data: Tree data from GitHub API
        
    Returns:
        RepositoryStructure with computed metrics
    """
    tree_items = tree_data.get("tree", [])
    
    files = 0
    folders = 0
    max_depth = 0
    top_level_dirs = set()
    largest_file_size = 0
    has_tests = False
    
    for item in tree_items:
        item_type = item.get("type")
        path = item.get("path", "")
        size = item.get("size", 0)
        
        # Count files and folders
        if item_type == "blob":
            files += 1
            largest_file_size = max(largest_file_size, size)
        elif item_type == "tree":
            folders += 1
        
        # Calculate depth
        if path:
            depth = path.count('/') + 1
            max_depth = max(max_depth, depth)
            
            # Extract top-level directory
            parts = path.split('/')
            if len(parts) > 1:
                top_level_dirs.add(parts[0])
            
            # Check for test files (case-insensitive)
            if "test" in path.lower():
                has_tests = True
    
    # Convert bytes to KB
    largest_file_kb = round(largest_file_size / 1024, 2) if largest_file_size > 0 else 0.0
    
    return RepositoryStructure(
        files=files,
        folders=folders,
        max_depth=max_depth,
        top_dirs=sorted(list(top_level_dirs)),
        largest_file_kb=largest_file_kb,
        has_tests=has_tests
    )


async def get_readme(
    client: httpx.AsyncClient,
    owner: str,
    repo: str
) -> Tuple[str, int]:
    """
    Fetch and process README content.
    
    Args:
        client: HTTP client
        owner: Repository owner
        repo: Repository name
        
    Returns:
        Tuple of (readme_text, readme_length)
    """
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/readme"
    
    logger.info(f"Fetching README for {owner}/{repo}")
    
    try:
        response = await client.get(url)
        response.raise_for_status()
        
        data = response.json()
        content_b64 = data.get("content", "")
        
        # Decode base64 content
        readme_bytes = base64.b64decode(content_b64)
        readme_text = readme_bytes.decode('utf-8', errors='ignore')
        
        # Truncate to 10,000 characters at nearest newline
        if len(readme_text) > 10000:
            # Find the last newline before 10,000 chars
            truncate_pos = readme_text.rfind('\n', 0, 10000)
            if truncate_pos == -1:
                # No newline found, just truncate at 10,000
                truncate_pos = 10000
            readme_text = readme_text[:truncate_pos]
        
        readme_length = len(readme_text)
        
        logger.info(f"README fetched: {readme_length} characters")
        
        return readme_text, readme_length
        
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404:
            # README not found
            logger.warning(f"No README found for {owner}/{repo}")
            return "", 0
        raise


async def analyze_repository(repo_url: str) -> GitHubRepoAnalysis:
    """
    Analyze a single GitHub repository.
    
    Args:
        repo_url: GitHub repository URL
        
    Returns:
        GitHubRepoAnalysis with all metrics
        
    Raises:
        ValueError: If URL is invalid or token is missing
        httpx.HTTPStatusError: If GitHub API returns error
    """
    # Load token (optional; unauthenticated requests are allowed but rate limited)
    token = load_github_token()
    
    # Parse URL
    owner, repo = parse_github_url(repo_url)
    
    # Setup HTTP client with authentication
    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    
    async with httpx.AsyncClient(headers=headers, timeout=30.0) as client:
        # Fetch metadata
        try:
            metadata = await get_repo_metadata(client, owner, repo)
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 403 and not token:
                # Clear guidance when hitting unauthenticated rate limit
                raise ValueError(
                    "GitHub rate limit hit for unauthenticated requests. "
                    "Add a personal access token in .env as GITHUB_TOKEN="
                )
            raise
        
        # Extract metadata fields
        name = metadata.get("name", "")
        description = metadata.get("description") or ""
        primary_language = metadata.get("language") or "Unknown"
        last_updated = metadata.get("updated_at", "")
        default_branch = metadata.get("default_branch", "main")
        
        # Fetch tree structure
        tree_data = await get_repo_tree(client, owner, repo, default_branch)
        structure = analyze_tree_structure(tree_data)
        
        # Fetch README
        readme_text, readme_length = await get_readme(client, owner, repo)
        
        logger.info(f"Analysis complete for {owner}/{repo}")
        
        return GitHubRepoAnalysis(
            name=name,
            description=description,
            primary_language=primary_language,
            last_updated=last_updated,
            github_url=f"https://github.com/{owner}/{repo}",
            readme_text=readme_text,
            readme_length=readme_length,
            structure=structure
        )
