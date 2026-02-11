"""Portfolio Builder Service - Constructs final JSON structures"""
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

logger = logging.getLogger(__name__)


def build_public_portfolio_json(
    personal_info: Dict[str, str],
    ai_generated_content: Dict[str, Any],
    data_sources: Dict[str, Any],
    code_quality: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Build the public portfolio JSON structure.

    This is the recruiter-facing, publicly accessible portfolio.

    Args:
        personal_info: Name, slug, focus
        ai_generated_content: AI-generated content (summary, strengths, etc.)
        data_sources: All data sources (GitHub, competitive programming, etc.)
        code_quality: Code quality analysis results

    Returns:
        Complete public portfolio JSON
    """
    portfolio = {
        "personal_info": {
            "name": personal_info.get("name", ""),
            "slug": personal_info.get("slug", ""),
            "focus": personal_info.get("portfolio_focus", "general")
        },
        "ai_generated_content": {
            "professional_summary": ai_generated_content.get("professional_summary", ""),
            "key_strengths": ai_generated_content.get("key_strengths", []),
            "work_experience": ai_generated_content.get("work_experience", []),
            "project_highlights": ai_generated_content.get("project_highlights", []),
            "achievements": ai_generated_content.get("achievements", []),
            "skills_summary": ai_generated_content.get("skills_summary", {}),
            "contact_info": ai_generated_content.get("contact_info", {})
        },
        "data_sources": _build_data_sources_section(data_sources, code_quality),
        "metadata": {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "data_sources_used": _list_used_sources(data_sources),
            "portfolio_focus": personal_info.get("portfolio_focus", "general")
        }
    }

    return portfolio


def build_private_coaching_json(
    coaching_insights: Dict[str, Any],
    personal_info: Dict[str, str]
) -> Dict[str, Any]:
    """
    Build the private coaching JSON structure.

    This is user-only, containing honest feedback and improvement suggestions.

    Args:
        coaching_insights: AI-generated coaching insights
        personal_info: Name, focus, etc.

    Returns:
        Complete private coaching JSON
    """
    coaching = {
        "skill_analysis": coaching_insights.get("skill_analysis", {}),
        "learning_path": coaching_insights.get("learning_path", {}),
        "interview_prep": coaching_insights.get("interview_prep", {}),
        "market_positioning": coaching_insights.get("market_positioning", {}),
        "metadata": {
            "generated_at": datetime.utcnow().isoformat() + "Z",
            "focus": personal_info.get("portfolio_focus", "general"),
            "ai_confidence": "high"  # Could be dynamic based on data quality
        }
    }

    return coaching


def _build_data_sources_section(
    data_sources: Dict[str, Any],
    code_quality: Optional[Dict[str, Any]]
) -> Dict[str, Any]:
    """Build the data sources section of public portfolio"""
    section = {}

    # GitHub projects
    if data_sources.get("github_data"):
        github_projects = []
        for repo in data_sources["github_data"]:
            # Find quality score for this repo if available
            quality_score = None
            if code_quality and "repository_scores" in code_quality:
                for repo_score in code_quality["repository_scores"]:
                    if repo_score["name"] == repo.get("name"):
                        quality_score = repo_score["overall_score"]
                        break

            project = {
                "name": repo.get("name", ""),
                "description": repo.get("description", ""),
                "language": repo.get("primary_language", ""),
                "github_url": repo.get("github_url", ""),
                "structure": {
                    "files": repo.get("structure", {}).get("files", 0),
                    "has_tests": repo.get("structure", {}).get("has_tests", False)
                }
            }

            if quality_score is not None:
                project["quality_score"] = quality_score
                # Add highlights if available
                if code_quality and "repository_scores" in code_quality:
                    for repo_score in code_quality["repository_scores"]:
                        if repo_score["name"] == repo.get("name"):
                            project["highlights"] = repo_score.get("strengths", [])
                            break

            github_projects.append(project)

        section["github_projects"] = github_projects

        # Add code quality summary
        if code_quality:
            section["code_quality_summary"] = {
                "overall_score": code_quality.get("overall_score", 0),
                "technology_diversity": code_quality.get("technology_diversity", {}),
                "portfolio_strengths": code_quality.get("portfolio_strengths", [])
            }

    # Competitive programming
    competitive = {}
    if data_sources.get("codeforces_data"):
        cf = data_sources["codeforces_data"]
        competitive["codeforces"] = {
            "username": cf.get("username", ""),
            "current_rating": cf.get("current_rating"),
            "max_rating": cf.get("max_rating"),
            "rank": cf.get("rank"),
            "contest_count": cf.get("contest_count", 0),
            "problems_solved": cf.get("problems_solved", 0)
        }

    if data_sources.get("leetcode_data"):
        lc = data_sources["leetcode_data"]
        competitive["leetcode"] = {
            "username": lc.get("username", ""),
            "total_solved": lc.get("total_solved", 0),
            "breakdown": {
                "easy": lc.get("easy_solved", 0),
                "medium": lc.get("medium_solved", 0),
                "hard": lc.get("hard_solved", 0)
            },
            "profile_url": lc.get("profile_url", "")
        }

    if competitive:
        section["competitive_programming"] = competitive

    # Skills extracted from LinkedIn
    if data_sources.get("linkedin_data"):
        linkedin = data_sources["linkedin_data"]
        skills_text = linkedin.get("skills_raw", "")
        if skills_text:
            # Simple skill extraction (split by comma/newline)
            skills_list = [s.strip() for s in skills_text.replace('\n', ',').split(',') if s.strip()]
            section["linkedin_skills"] = skills_list[:15]  # Top 15 skills

    return section


def _list_used_sources(data_sources: Dict[str, Any]) -> List[str]:
    """List which data sources were actually used"""
    sources = []
    if data_sources.get("linkedin_data"):
        sources.append("linkedin")
    if data_sources.get("resume_text"):
        sources.append("resume")
    if data_sources.get("github_data"):
        sources.append("github")
    if data_sources.get("codeforces_data"):
        sources.append("codeforces")
    if data_sources.get("leetcode_data"):
        sources.append("leetcode")
    return sources


def merge_portfolio_updates(
    current_portfolio: Dict[str, Any],
    updates: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Merge updates into current portfolio JSON.

    Used for manual editing - allows updating specific fields.

    Args:
        current_portfolio: Current portfolio JSON
        updates: Dictionary of fields to update

    Returns:
        Updated portfolio JSON
    """
    # Deep copy to avoid mutating original
    updated = _deep_copy_dict(current_portfolio)

    # Update AI-generated content fields
    if "ai_generated_content" in updated:
        for key, value in updates.items():
            if key in ["professional_summary", "key_strengths", "project_highlights", "skills_summary"]:
                updated["ai_generated_content"][key] = value

    # Update metadata
    if "metadata" in updated:
        updated["metadata"]["last_edited"] = datetime.utcnow().isoformat() + "Z"

    return updated


def _deep_copy_dict(d: Dict[str, Any]) -> Dict[str, Any]:
    """Simple deep copy for dictionaries (without using copy module)"""
    import json
    return json.loads(json.dumps(d))
