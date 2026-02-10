"""Portfolio Generation Router - Main orchestrator endpoint"""
import asyncio
import json
import logging
import time
from typing import Optional
from datetime import datetime

from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.database import Portfolio
from app.models.portfolio_schemas import PortfolioGenerateResponse, PortfolioErrorResponse
from app.utils.slug import generate_portfolio_slug
from app.utils.validators import validate_file
from app.utils.file_parser import extract_text

# Import existing routers' logic (we'll reuse their parsing functions)
from app.routers.linkedin_router import parse_linkedin_sections
from app.services.github_service import analyze_repository
from app.services.leetcode_service import fetch_leetcode_stats
from app.routers.codeforces_router import get_codeforces_stats

# Import new services
from app.services.code_quality_service import analyze_portfolio_quality
from app.services.ai_service import prepare_ai_context, generate_portfolio_content, generate_coaching_insights
from app.services.portfolio_builder_service import build_public_portfolio_json, build_private_coaching_json

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/portfolio", tags=["Portfolio Generation"])


@router.post("/generate", response_model=PortfolioGenerateResponse)
async def generate_portfolio(
    name: str = Form(..., min_length=1, max_length=200),
    portfolio_focus: str = Form(default="general"),
    linkedin_file: Optional[UploadFile] = File(None),
    resume_file: Optional[UploadFile] = File(None),
    github_repos: Optional[str] = Form(None),  # JSON array of URLs
    codeforces_username: Optional[str] = Form(None),
    leetcode_username: Optional[str] = Form(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a complete portfolio from multiple data sources.

    This endpoint orchestrates:
    1. Data extraction from all sources
    2. Code quality analysis
    3. AI content generation
    4. Portfolio JSON construction
    5. Database persistence

    Args:
        name: Full name
        portfolio_focus: Focus area (fullstack, backend, ml, competitive, general)
        linkedin_file: LinkedIn profile PDF (optional)
        resume_file: Resume PDF (optional)
        github_repos: JSON array of GitHub repo URLs (optional)
        codeforces_username: Codeforces handle (optional)
        leetcode_username: LeetCode username (optional)
        db: Database session

    Returns:
        PortfolioGenerateResponse with portfolio ID, slug, and URLs
    """
    start_time = time.time()

    try:
        # 1. Generate unique slug
        slug = generate_portfolio_slug(name)
        logger.info(f"Generating portfolio for {name} with slug: {slug}")

        # 2. Create portfolio record in database (status="generating")
        portfolio = Portfolio(
            slug=slug,
            name=name,
            portfolio_focus=portfolio_focus,
            status="generating",
            generation_started_at=datetime.utcnow()
        )
        db.add(portfolio)
        await db.commit()
        await db.refresh(portfolio)

        # 3. Parse all data sources in parallel
        data_results = await _fetch_all_data_sources(
            linkedin_file=linkedin_file,
            resume_file=resume_file,
            github_repos=github_repos,
            codeforces_username=codeforces_username,
            leetcode_username=leetcode_username
        )

        # 4. Store raw data in portfolio record
        portfolio.has_linkedin = data_results["linkedin_data"] is not None
        portfolio.has_resume = data_results["resume_text"] is not None
        portfolio.has_github = data_results["github_data"] is not None
        portfolio.has_codeforces = data_results["codeforces_data"] is not None
        portfolio.has_leetcode = data_results["leetcode_data"] is not None

        portfolio.linkedin_data = data_results["linkedin_data"]
        portfolio.resume_text = data_results["resume_text"]
        portfolio.github_data = data_results["github_data"]
        portfolio.codeforces_data = data_results["codeforces_data"]
        portfolio.leetcode_data = data_results["leetcode_data"]

        await db.commit()

        # 5. Run code quality analysis on GitHub data
        code_quality_metrics = None
        if data_results["github_data"]:
            try:
                code_quality_metrics = analyze_portfolio_quality(data_results["github_data"])
                logger.info(f"Code quality analysis completed. Overall score: {code_quality_metrics.get('overall_score', 0)}")
            except Exception as e:
                logger.error(f"Code quality analysis failed: {e}")

        # 6. Prepare AI context
        ai_context_data = {
            "name": name,
            "portfolio_focus": portfolio_focus,
            "linkedin_data": data_results["linkedin_data"],
            "resume_text": data_results["resume_text"],
            "github_data": data_results["github_data"],
            "codeforces_data": data_results["codeforces_data"],
            "leetcode_data": data_results["leetcode_data"],
            "code_quality_metrics": code_quality_metrics
        }
        ai_context = prepare_ai_context(ai_context_data)

        # 7. Generate public portfolio content via AI
        try:
            public_content = await generate_portfolio_content(ai_context, portfolio_focus)
            logger.info("AI public portfolio content generated successfully")
        except Exception as e:
            logger.error(f"AI content generation failed: {e}")
            # Use template fallback
            public_content = {
                "professional_summary": f"{name} is a {portfolio_focus} developer.",
                "key_strengths": ["Technical skills", "Problem solving"],
                "project_highlights": [],
                "skills_summary": {"languages": [], "frameworks": [], "tools": []}
            }

        # 8. Generate private coaching insights via AI
        try:
            private_content = await generate_coaching_insights(ai_context, portfolio_focus)
            logger.info("AI coaching insights generated successfully")
        except Exception as e:
            logger.error(f"AI coaching generation failed: {e}")
            # Use template fallback
            private_content = {
                "skill_analysis": {"strengths": [], "gaps": []},
                "learning_path": {"immediate": [], "short_term": [], "long_term": []},
                "interview_prep": {"likely_questions": [], "talking_points": []},
                "market_positioning": {"target_roles": [], "competitive_advantages": [], "resume_improvements": []}
            }

        # 9. Build final JSON structures
        personal_info = {
            "name": name,
            "slug": slug,
            "portfolio_focus": portfolio_focus
        }

        public_portfolio_json = build_public_portfolio_json(
            personal_info=personal_info,
            ai_generated_content=public_content,
            data_sources=data_results,
            code_quality=code_quality_metrics
        )

        private_coaching_json = build_private_coaching_json(
            coaching_insights=private_content,
            personal_info=personal_info
        )

        # 10. Create PortfolioVersion (version 1, committed)
        from app.models.database import PortfolioVersion, VersionState, VersionCreatedBy
        
        portfolio_version = PortfolioVersion(
            portfolio_id=portfolio.id,
            version_number=1,
            version_state=VersionState.COMMITTED,
            public_portfolio_json=public_portfolio_json,
            private_coaching_json=private_coaching_json,
            changes_summary="Initial portfolio generation",
            created_by=VersionCreatedBy.AI
        )
        db.add(portfolio_version)
        await db.flush()  # Get the version ID
        
        # 11. Update portfolio with current version and metadata
        portfolio.current_version_id = portfolio_version.id
        portfolio.ai_generation_metadata = {
            "model": "gemini-1.5-flash",
            "generated_at": datetime.utcnow().isoformat(),
            "sources_used": _list_used_sources(data_results)
        }
        portfolio.status = "completed"
        portfolio.generation_completed_at = datetime.utcnow()

        await db.commit()

        # 11. Calculate generation time
        generation_time = time.time() - start_time

        # 12. Return response
        return PortfolioGenerateResponse(
            portfolio_id=portfolio.id,
            slug=slug,
            status="completed",
            public_portfolio_url=f"/portfolio/{slug}",
            private_coaching_url=f"/portfolio/{slug}/coaching",
            generation_time_seconds=round(generation_time, 2)
        )

    except Exception as e:
        logger.error(f"Portfolio generation failed: {e}", exc_info=True)

        # Update portfolio status to error if it was created
        if 'portfolio' in locals():
            portfolio.status = "error"
            portfolio.error_message = str(e)
            await db.commit()

        raise HTTPException(
            status_code=500,
            detail=f"Portfolio generation failed: {str(e)}"
        )


async def _fetch_all_data_sources(
    linkedin_file: Optional[UploadFile],
    resume_file: Optional[UploadFile],
    github_repos: Optional[str],
    codeforces_username: Optional[str],
    leetcode_username: Optional[str]
) -> dict:
    """
    Fetch data from all sources in parallel.

    Returns:
        Dictionary with all fetched data (None for sources not provided)
    """
    tasks = []
    task_names = []

    # LinkedIn parsing
    if linkedin_file:
        tasks.append(_parse_linkedin_file(linkedin_file))
        task_names.append("linkedin")
    else:
        tasks.append(_return_none())
        task_names.append("linkedin")

    # Resume parsing
    if resume_file:
        tasks.append(_parse_resume_file(resume_file))
        task_names.append("resume")
    else:
        tasks.append(_return_none())
        task_names.append("resume")

    # GitHub analysis
    if github_repos:
        tasks.append(_analyze_github_repos(github_repos))
        task_names.append("github")
    else:
        tasks.append(_return_none())
        task_names.append("github")

    # Codeforces
    if codeforces_username:
        tasks.append(_fetch_codeforces(codeforces_username))
        task_names.append("codeforces")
    else:
        tasks.append(_return_none())
        task_names.append("codeforces")

    # LeetCode
    if leetcode_username:
        tasks.append(_fetch_leetcode(leetcode_username))
        task_names.append("leetcode")
    else:
        tasks.append(_return_none())
        task_names.append("leetcode")

    # Execute all tasks in parallel
    results = await asyncio.gather(*tasks, return_exceptions=True)

    # Process results
    data = {}
    for name, result in zip(task_names, results):
        key = f"{name}_data" if name != "resume" else "resume_text"
        
        if isinstance(result, Exception):
            logger.warning(f"Failed to fetch {name}: {result}")
            data[key] = None
        else:
            # Convert result to serializable dict if it's a Pydantic model
            data[key] = _to_serializable(result)

    return data


def _to_serializable(obj):
    """Helper to convert Pydantic models to dictionaries recursively"""
    if obj is None:
        return None
        
    # Handle Pydantic models
    if hasattr(obj, "model_dump"):
        return obj.model_dump()
    if hasattr(obj, "dict"):
        return obj.dict()
        
    # Handle lists (like GitHub repos)
    if isinstance(obj, list):
        return [_to_serializable(item) for item in obj]
        
    # Handle dictionaries (might contain Pydantic models)
    if isinstance(obj, dict):
        return {k: _to_serializable(v) for k, v in obj.items()}
        
    return obj


async def _return_none():
    """Helper to return None asynchronously"""
    return None


async def _parse_linkedin_file(file: UploadFile):
    """Parse LinkedIn file"""
    try:
        validate_file(file)
        # Read file content as bytes
        file_bytes = await file.read()
        text = extract_text(file_bytes, file.filename)
        return parse_linkedin_sections(text)
    except Exception as e:
        logger.error(f"LinkedIn parsing failed: {e}")
        raise


async def _parse_resume_file(file: UploadFile):
    """Parse resume file"""
    try:
        validate_file(file)
        # Read file content as bytes
        file_bytes = await file.read()
        text = extract_text(file_bytes, file.filename)
        return text
    except Exception as e:
        logger.error(f"Resume parsing failed: {e}")
        raise


async def _analyze_github_repos(repos_json: str):
    """Analyze GitHub repositories"""
    try:
        if not repos_json or not repos_json.strip():
            return None
            
        repo_urls = json.loads(repos_json)
        if not isinstance(repo_urls, list):
            raise ValueError("github_repos must be a JSON array")

        # Analyze each repo
        results = []
        for url in repo_urls[:5]:  # Max 5 repos
            try:
                result = await analyze_repository(url)
                results.append(result)
            except Exception as e:
                logger.warning(f"Failed to analyze {url}: {e}")

        return results if results else None
    except Exception as e:
        logger.error(f"GitHub analysis failed: {e}")
        raise


async def _fetch_codeforces(username: str):
    """Fetch Codeforces stats"""
    try:
        return await get_codeforces_stats(username)
    except Exception as e:
        logger.error(f"Codeforces fetch failed: {e}")
        raise


async def _fetch_leetcode(username: str):
    """Fetch LeetCode stats"""
    try:
        return await fetch_leetcode_stats(username)
    except Exception as e:
        logger.error(f"LeetCode fetch failed: {e}")
        raise


def _list_used_sources(data_results: dict) -> list:
    """List which data sources were actually fetched"""
    sources = []
    if data_results.get("linkedin_data"):
        sources.append("linkedin")
    if data_results.get("resume_text"):
        sources.append("resume")
    if data_results.get("github_data"):
        sources.append("github")
    if data_results.get("codeforces_data"):
        sources.append("codeforces")
    if data_results.get("leetcode_data"):
        sources.append("leetcode")
    return sources
