"""Code Quality Analysis Service - Heuristic-based, Language-Agnostic"""
import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


def analyze_repository_quality(repo_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze a single repository using heuristic signals.

    Language-agnostic analysis based on structure, not semantics.

    Args:
        repo_data: GitHub repository data with structure, README, etc.

    Returns:
        Quality analysis with scores and insights
    """
    structure = repo_data.get("structure", {})
    readme_length = repo_data.get("readme_length", 0)
    last_updated = repo_data.get("last_updated", "")

    # Calculate individual metric scores
    complexity_score = _calculate_complexity_score(structure)
    documentation_score = _calculate_documentation_score(readme_length, structure)
    best_practices_score = _calculate_best_practices_score(structure)
    activity_score = _calculate_activity_score(last_updated)

    # Overall score (weighted average)
    overall_score = int(
        (complexity_score * 0.25) +
        (documentation_score * 0.30) +
        (best_practices_score * 0.30) +
        (activity_score * 0.15)
    )

    # Generate strengths and improvements
    strengths = _identify_strengths(
        complexity_score,
        documentation_score,
        best_practices_score,
        activity_score,
        structure
    )
    improvements = _identify_improvements(
        complexity_score,
        documentation_score,
        best_practices_score,
        structure
    )

    return {
        "overall_score": overall_score,
        "metrics": {
            "complexity": {
                "score": complexity_score,
                "reasoning": _get_complexity_reasoning(structure)
            },
            "documentation": {
                "score": documentation_score,
                "reasoning": _get_documentation_reasoning(readme_length)
            },
            "best_practices": {
                "score": best_practices_score,
                "has_tests": structure.get("has_tests", False),
                "has_docs": "docs" in structure.get("top_dirs", []),
                "has_ci": ".github" in structure.get("top_dirs", [])
            },
            "activity": {
                "score": activity_score,
                "reasoning": _get_activity_reasoning(last_updated)
            }
        },
        "strengths": strengths,
        "improvements": improvements
    }


def analyze_portfolio_quality(github_repos: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Analyze code quality across all portfolio repositories.

    Args:
        github_repos: List of GitHub repository analysis results

    Returns:
        Aggregated quality analysis for entire portfolio
    """
    if not github_repos:
        return {
            "overall_score": 0,
            "repository_scores": [],
            "technology_diversity": {"score": 0, "languages": []},
            "aggregate_metrics": {},
            "portfolio_strengths": [],
            "portfolio_improvements": []
        }

    # Analyze each repository
    repo_analyses = []
    for repo in github_repos:
        analysis = analyze_repository_quality(repo)
        repo_analyses.append({
            "name": repo.get("name", ""),
            "overall_score": analysis["overall_score"],
            "metrics": analysis["metrics"],
            "strengths": analysis["strengths"],
            "improvements": analysis["improvements"]
        })

    # Calculate portfolio-wide metrics
    avg_score = sum(r["overall_score"] for r in repo_analyses) // len(repo_analyses)

    # Technology diversity
    tech_diversity = _calculate_technology_diversity(github_repos)

    # Aggregate strengths and improvements
    all_strengths = []
    all_improvements = []
    for analysis in repo_analyses:
        all_strengths.extend(analysis["strengths"])
        all_improvements.extend(analysis["improvements"])

    # Deduplicate and prioritize
    unique_strengths = list(set(all_strengths))[:5]
    unique_improvements = list(set(all_improvements))[:5]

    return {
        "overall_score": avg_score,
        "repository_scores": repo_analyses,
        "technology_diversity": tech_diversity,
        "aggregate_metrics": {
            "avg_complexity": sum(r["metrics"]["complexity"]["score"] for r in repo_analyses) // len(repo_analyses),
            "avg_documentation": sum(r["metrics"]["documentation"]["score"] for r in repo_analyses) // len(repo_analyses),
            "avg_best_practices": sum(r["metrics"]["best_practices"]["score"] for r in repo_analyses) // len(repo_analyses)
        },
        "portfolio_strengths": unique_strengths,
        "portfolio_improvements": unique_improvements
    }


def _calculate_complexity_score(structure: Dict[str, Any]) -> int:
    """
    Calculate project complexity score (0-100).

    Factors:
    - File count (more files = more complex)
    - Directory depth (deeper structure = more complex)
    - Has tests (+20 bonus)
    """
    files = structure.get("files", 0)
    max_depth = structure.get("max_depth", 0)
    has_tests = structure.get("has_tests", False)

    # Base score from files and depth
    file_score = min(50, files * 0.5)  # Cap at 50
    depth_score = min(30, max_depth * 5)  # Cap at 30

    # Test bonus
    test_bonus = 20 if has_tests else 0

    score = int(file_score + depth_score + test_bonus)
    return min(100, score)


def _calculate_documentation_score(readme_length: int, structure: Dict[str, Any]) -> int:
    """
    Calculate documentation quality score (0-100).

    Factors:
    - README length (longer = better, up to a point)
    - Has docs folder (+20 bonus)
    """
    if readme_length == 0:
        return 0

    # Score based on README length
    if readme_length < 500:
        readme_score = 30  # Minimal docs
    elif readme_length < 2000:
        readme_score = 60  # Good docs
    elif readme_length < 5000:
        readme_score = 80  # Excellent docs
    else:
        readme_score = 90  # Comprehensive docs

    # Docs folder bonus
    has_docs = "docs" in structure.get("top_dirs", [])
    docs_bonus = 10 if has_docs else 0

    score = readme_score + docs_bonus
    return min(100, score)


def _calculate_best_practices_score(structure: Dict[str, Any]) -> int:
    """
    Calculate best practices score (0-100).

    Factors:
    - Has tests (+40 points)
    - Has docs folder (+20 points)
    - Has CI/CD (.github folder) (+40 points)
    """
    score = 0

    if structure.get("has_tests", False):
        score += 40

    top_dirs = structure.get("top_dirs", [])
    if "docs" in top_dirs or "doc" in top_dirs:
        score += 20

    if ".github" in top_dirs or ".gitlab-ci.yml" in top_dirs:
        score += 40

    return min(100, score)


def _calculate_activity_score(last_updated: str) -> int:
    """
    Calculate project activity score (0-100) based on recency.

    More recent updates = higher score
    """
    if not last_updated:
        return 50  # Unknown, assume moderate

    try:
        updated_date = datetime.fromisoformat(last_updated.replace('Z', '+00:00'))
        days_ago = (datetime.now(updated_date.tzinfo) - updated_date).days

        if days_ago < 7:
            return 100  # Very active
        elif days_ago < 30:
            return 90  # Active
        elif days_ago < 90:
            return 75  # Moderate
        elif days_ago < 180:
            return 60  # Somewhat stale
        elif days_ago < 365:
            return 40  # Stale
        else:
            return 20  # Very stale
    except Exception:
        return 50  # Parse error, assume moderate


def _calculate_technology_diversity(repos: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Calculate technology diversity score based on unique languages"""
    languages = set()
    for repo in repos:
        lang = repo.get("primary_language", "")
        if lang:
            languages.add(lang)

    num_languages = len(languages)

    # Score based on diversity
    if num_languages == 0:
        score = 0
    elif num_languages == 1:
        score = 40  # Single language
    elif num_languages == 2:
        score = 70  # Bilingual
    elif num_languages == 3:
        score = 85  # Polyglot
    else:
        score = 100  # Very diverse

    return {
        "score": score,
        "languages": sorted(list(languages)),
        "count": num_languages
    }


def _identify_strengths(
    complexity: int,
    documentation: int,
    best_practices: int,
    activity: int,
    structure: Dict[str, Any]
) -> List[str]:
    """Identify project strengths based on scores"""
    strengths = []

    if documentation >= 80:
        strengths.append("Well documented")
    if best_practices >= 70:
        strengths.append("Follows best practices")
    if structure.get("has_tests"):
        strengths.append("Has test coverage")
    if activity >= 80:
        strengths.append("Active development")
    if complexity >= 70:
        strengths.append("Non-trivial project complexity")

    return strengths if strengths else ["Project has potential"]


def _identify_improvements(
    complexity: int,
    documentation: int,
    best_practices: int,
    structure: Dict[str, Any]
) -> List[str]:
    """Identify areas for improvement based on scores"""
    improvements = []

    if documentation < 50:
        improvements.append("Add comprehensive README")
    if not structure.get("has_tests"):
        improvements.append("Add test coverage")
    if ".github" not in structure.get("top_dirs", []):
        improvements.append("Set up CI/CD pipeline")
    if "docs" not in structure.get("top_dirs", []):
        improvements.append("Add dedicated documentation")
    if complexity < 40:
        improvements.append("Expand project scope")

    return improvements if improvements else ["Continue maintaining high quality"]


def _get_complexity_reasoning(structure: Dict[str, Any]) -> str:
    """Generate reasoning for complexity score"""
    files = structure.get("files", 0)
    depth = structure.get("max_depth", 0)
    has_tests = structure.get("has_tests", False)

    if files < 20:
        size = "Small"
    elif files < 50:
        size = "Medium"
    else:
        size = "Large"

    test_note = " with test coverage" if has_tests else ""

    return f"{size} project with {files} files, {depth} directory depth{test_note}"


def _get_documentation_reasoning(readme_length: int) -> str:
    """Generate reasoning for documentation score"""
    if readme_length == 0:
        return "No README found"
    elif readme_length < 500:
        return f"Basic README ({readme_length} chars)"
    elif readme_length < 2000:
        return f"Good README documentation ({readme_length} chars)"
    elif readme_length < 5000:
        return f"Excellent README documentation ({readme_length} chars)"
    else:
        return f"Comprehensive documentation ({readme_length} chars)"


def _get_activity_reasoning(last_updated: str) -> str:
    """Generate reasoning for activity score"""
    if not last_updated:
        return "Update date unknown"

    try:
        updated_date = datetime.fromisoformat(last_updated.replace('Z', '+00:00'))
        days_ago = (datetime.now(updated_date.tzinfo) - updated_date).days

        if days_ago < 7:
            return f"Very active (updated {days_ago} days ago)"
        elif days_ago < 30:
            return f"Active (updated {days_ago} days ago)"
        elif days_ago < 90:
            return f"Moderate activity (updated {days_ago} days ago)"
        elif days_ago < 365:
            return f"Somewhat stale (updated {days_ago} days ago)"
        else:
            years = days_ago // 365
            return f"Stale (updated {years} year{'s' if years > 1 else ''} ago)"
    except Exception:
        return "Unable to parse update date"
