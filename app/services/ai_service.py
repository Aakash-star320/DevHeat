"""AI Service for portfolio content generation using Google Gemini"""
import logging
import json
from typing import Dict, Any, Optional, List
from pathlib import Path
from datetime import datetime
import google.generativeai as genai
from app.config import GEMINI_API_KEY

logger = logging.getLogger(__name__)

# Configure Gemini API
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    logger.warning("GEMINI_API_KEY not set. AI features will be disabled.")

# Use Gemini Flash Latest for best compatibility and free tier
MODEL_NAME = "gemini-flash-latest"


def prepare_ai_context(portfolio_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Prepare sanitized context for AI from portfolio data.

    ETHICAL CONSTRAINT: Only metadata, README text, and statistics are sent.
    NEVER sends source code, file contents (except README), or code snippets.

    Args:
        portfolio_data: Dictionary with all portfolio data sources

    Returns:
        Sanitized context dictionary for AI consumption
    """
    context = {
        "name": portfolio_data.get("name", ""),
        "portfolio_focus": portfolio_data.get("portfolio_focus", "general"),
    }

    # LinkedIn data (summary, experience, education, skills)
    if portfolio_data.get("linkedin_data"):
        linkedin = portfolio_data["linkedin_data"]
        context["linkedin"] = {
            "summary": linkedin.get("summary", ""),
            "experience": linkedin.get("experience_raw", "")[:2000],  # Limit length
            "education": linkedin.get("education_raw", "")[:1000],
            "skills": linkedin.get("skills_raw", "")[:500]
        }

    # Resume text
    if portfolio_data.get("resume_text"):
        context["resume_highlights"] = portfolio_data["resume_text"]

    # GitHub data (metadata + README only, NO source code)
    if portfolio_data.get("github_data"):
        github_projects = []
        for repo in portfolio_data["github_data"]:
            project = {
                "name": repo.get("name", ""),
                "description": repo.get("description", ""),
                "language": repo.get("primary_language", ""),
                "readme_summary": repo.get("readme_text", "")[:1000],  # First 1000 chars only
                "structure": {
                    "files": repo.get("structure", {}).get("files", 0),
                    "has_tests": repo.get("structure", {}).get("has_tests", False),
                    "top_dirs": repo.get("structure", {}).get("top_dirs", [])
                }
            }
            github_projects.append(project)
        context["github_projects"] = github_projects

    # Competitive programming stats
    if portfolio_data.get("codeforces_data"):
        cf = portfolio_data["codeforces_data"]
        context["codeforces"] = {
            "rating": cf.get("current_rating"),
            "max_rating": cf.get("max_rating"),
            "rank": cf.get("rank"),
            "problems_solved": cf.get("problems_solved", 0)
        }

    if portfolio_data.get("leetcode_data"):
        lc = portfolio_data["leetcode_data"]
        context["leetcode"] = {
            "total_solved": lc.get("total_solved", 0),
            "easy": lc.get("easy_solved", 0),
            "medium": lc.get("medium_solved", 0),
            "hard": lc.get("hard_solved", 0)
        }

    # Code quality metrics (if available)
    if portfolio_data.get("code_quality_metrics"):
        context["code_quality"] = portfolio_data["code_quality_metrics"]

    return context


async def generate_portfolio_content(
    context: Dict[str, Any],
    portfolio_focus: str = "general"
) -> Dict[str, Any]:
    """
    Generate public portfolio content using Gemini AI.

    Args:
        context: Sanitized portfolio context from prepare_ai_context()
        portfolio_focus: Focus area (fullstack, backend, ml, competitive, general)

    Returns:
        Dictionary with AI-generated portfolio content:
        - professional_summary
        - key_strengths
        - project_highlights
        - skills_summary
    """
    if not GEMINI_API_KEY:
        logger.warning("Gemini API key not set. Returning template-based content.")
        return _generate_template_content(context, portfolio_focus)

    try:
        model = genai.GenerativeModel(MODEL_NAME)

        # Build prompt
        prompt = _build_portfolio_prompt(context, portfolio_focus)

        # Log prompt for debugging
        _log_prompt_to_file("portfolio_generation", prompt)

        # Generate content
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                top_p=0.9,
                max_output_tokens=4096
            )
        )

        # Log raw response for debugging
        _log_response_to_file("portfolio_generation", response.text)

        # Parse JSON response
        try:
            cleaned_json = _strip_markdown_json(response.text)
            content = json.loads(cleaned_json)
        except json.JSONDecodeError:
            logger.error("Failed to parse AI response as JSON even after cleaning.")
            raise

        logger.info(f"Successfully generated portfolio content for focus: {portfolio_focus}")
        return content

    except Exception as e:
        logger.error(f"Error generating portfolio content: {e}. Using template fallback.")
        _log_error_to_file("portfolio_generation", str(e))
        return _generate_template_content(context, portfolio_focus)


async def generate_coaching_insights(
    context: Dict[str, Any],
    portfolio_focus: str = "general"
) -> Dict[str, Any]:
    """
    Generate private coaching insights using Gemini AI.

    Args:
        context: Sanitized portfolio context from prepare_ai_context()
        portfolio_focus: Focus area

    Returns:
        Dictionary with private coaching insights:
        - skill_analysis (strengths, gaps)
        - learning_path (immediate, short_term, long_term)
        - interview_prep (likely_questions, talking_points)
        - market_positioning (target_roles, competitive_advantages, resume_improvements)
    """
    if not GEMINI_API_KEY:
        logger.warning("Gemini API key not set. Returning template-based coaching.")
        return _generate_template_coaching(context, portfolio_focus)

    try:
        model = genai.GenerativeModel(MODEL_NAME)

        # Build prompt
        prompt = _build_coaching_prompt(context, portfolio_focus)

        # Log prompt for debugging
        _log_prompt_to_file("coaching_insights", prompt)

        # Generate content
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.8,
                top_p=0.9,
                max_output_tokens=4096
            )
        )

        # Log raw response for debugging
        _log_response_to_file("coaching_insights", response.text)

        # Parse JSON response
        try:
            cleaned_json = _strip_markdown_json(response.text)
            content = json.loads(cleaned_json)
        except json.JSONDecodeError:
            logger.error("Failed to parse AI response as JSON even after cleaning.")
            raise

        logger.info(f"Successfully generated coaching insights for focus: {portfolio_focus}")
        return content

    except Exception as e:
        logger.error(f"Error generating coaching insights: {e}. Using template fallback.")
        _log_error_to_file("coaching_insights", str(e))
        return _generate_template_coaching(context, portfolio_focus)


async def refine_section(
    current_content: str,
    instruction: str,
    section_name: str = "content"
) -> str:
    """
    Refine a specific portfolio section based on user instruction.

    Args:
        current_content: Current section content
        instruction: User's refinement instruction
        section_name: Name of the section being refined

    Returns:
        Refined content string
    """
    if not GEMINI_API_KEY:
        logger.warning("Gemini API key not set. Returning original content.")
        return current_content

    try:
        model = genai.GenerativeModel(MODEL_NAME)

        prompt = f"""Refine this {section_name} based on the instruction.

CURRENT CONTENT:
{current_content}

INSTRUCTION: {instruction}

CONSTRAINTS:
- Maintain professional tone
- Be concise and impactful
- Keep factual accuracy
- ATS-friendly language

OUTPUT: Only the refined content, no explanations or metadata. Output as plain text, not JSON."""

        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.6,
                max_output_tokens=1024
            )
        )

        refined = response.text.strip()
        logger.info(f"Successfully refined {section_name}")
        return refined

    except Exception as e:
        logger.error(f"Error refining section: {e}. Returning original content.")
        return current_content


def _log_prompt_to_file(task_type: str, prompt: str):
    """Log the AI prompt to a debug file for transparency"""
    try:
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True)
        
        log_path = log_dir / f"last_{task_type}_prompt.txt"
        with open(log_path, "w", encoding="utf-8") as f:
            f.write(f"--- PROMPT FOR {task_type.upper()} ---\n")
            f.write(f"TIMESTAMP: {datetime.now().isoformat()}\n")
            f.write("-" * 30 + "\n")
            f.write(prompt)
            f.write("\n" + "-" * 30 + "\n")
        
        logger.info(f"AI prompt logged to {log_path}")
    except Exception as e:
        logger.warning(f"Failed to log AI prompt to file: {e}")


def _log_response_to_file(task_type: str, response_text: str):
    """Log the AI response for debugging"""
    try:
        log_path = Path("logs") / f"last_{task_type}_response.txt"
        with open(log_path, "w", encoding="utf-8") as f:
            f.write(response_text)
    except Exception:
        pass


def _log_error_to_file(task_type: str, error_msg: str):
    """Log processing errors"""
    try:
        log_path = Path("logs") / f"last_{task_type}_error.txt"
        with open(log_path, "w", encoding="utf-8") as f:
            f.write(error_msg)
    except Exception:
        pass


def _strip_markdown_json(text: str) -> str:
    """Strip markdown code blocks from JSON string if present"""
    text = text.strip()
    if text.startswith("```"):
        # Find first { and last }
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1:
            return text[start:end+1]
    return text


def _build_portfolio_prompt(context: Dict[str, Any], focus: str) -> str:
    """Build prompt for public portfolio content generation"""
    return f"""You are a professional portfolio writer. Generate compelling portfolio content in JSON format.

FOCUS: {focus} (emphasize skills and projects relevant to this area)

DATA SOURCES:
{json.dumps(context, indent=2)}

TASK: Generate a professional portfolio with these sections. Output ONLY valid JSON, no markdown formatting.

OUTPUT FORMAT (JSON):
{{
  "professional_summary": "3-4 sentence summary highlighting experience, skills, and focus area",
  "key_strengths": ["strength 1", "strength 2", "strength 3", "strength 4"],
  "work_experience": [
    {{
      "title": "job title",
      "company": "company name",
      "duration": "start - end date",
      "description_bullets": ["achievement 1", "achievement 2"]
    }}
  ],
  "project_highlights": [
    {{
      "name": "project name",
      "description": "compelling 2-3 sentence description of problem solved and impact",
      "technologies": ["tech1", "tech2"],
      "highlights": ["highlight 1", "highlight 2"]
    }}
  ],
  "achievements": ["achievement 1", "award 2", "contest rank 3"],
  "skills_summary": {{
    "languages": ["list of programming languages"],
    "frameworks": ["list of frameworks/libraries"],
    "tools": ["list of tools/platforms"]
  }},
  "contact_info": {{
    "email": "email address",
    "linkedin": "url",
    "github": "url"
  }}
}}

REQUIREMENTS:
- Professional, ATS-friendly tone
- Emphasize {focus}-relevant skills
- Use ONLY provided data, no fabrication
- Be concise and impactful
- Highlight competitive programming achievements if present
- Use action verbs and quantify when possible"""


def _build_coaching_prompt(context: Dict[str, Any], focus: str) -> str:
    """Build prompt for private coaching insights generation"""
    return f"""You are a career coach providing private, actionable feedback.

FOCUS: {focus}

DATA SOURCES:
{json.dumps(context, indent=2)}

TASK: Provide honest, constructive career guidance. Output ONLY valid JSON, no markdown formatting.

OUTPUT FORMAT (JSON):
{{
  "skill_analysis": {{
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "gaps": ["gap 1 with specific skills missing", "gap 2", "gap 3"]
  }},
  "learning_path": {{
    "immediate": ["actionable step 1", "actionable step 2"],
    "short_term": ["3-6 month goal 1", "3-6 month goal 2"],
    "long_term": ["career goal 1", "career goal 2"]
  }},
  "interview_prep": {{
    "likely_questions": ["interview question 1", "interview question 2", "interview question 3"],
    "talking_points": ["talking point 1 based on profile", "talking point 2"]
  }},
  "market_positioning": {{
    "target_roles": ["role 1", "role 2", "role 3"],
    "competitive_advantages": ["unique advantage 1", "unique advantage 2"],
    "resume_improvements": ["specific improvement 1", "specific improvement 2"]
  }}
}}

REQUIREMENTS:
- Be honest and constructive
- Provide specific, actionable advice
- Focus on {focus} career path
- Identify real skill gaps for target roles
- Suggest concrete next steps"""


def _generate_template_content(context: Dict[str, Any], focus: str) -> Dict[str, Any]:
    """Fallback template-based content generation when AI is unavailable"""
    name = context.get("name", "Professional")

    return {
        "professional_summary": f"{name} is a {focus} developer with experience in modern web technologies and software development.",
        "key_strengths": [
            "Strong technical foundation",
            "Problem-solving abilities",
            "Continuous learner",
            "Team collaboration"
        ],
        "project_highlights": [
            {
                "name": project.get("name", "Project"),
                "description": project.get("description", "Software development project"),
                "technologies": [project.get("language", "Programming")],
                "highlights": ["Built and deployed successfully"]
            }
            for project in context.get("github_projects", [])[:3]
        ],
        "skills_summary": {
            "languages": list(set(p.get("language", "") for p in context.get("github_projects", []) if p.get("language"))),
            "frameworks": [],
            "tools": ["Git", "GitHub"]
        }
    }


def _generate_template_coaching(context: Dict[str, Any], focus: str) -> Dict[str, Any]:
    """Fallback template-based coaching when AI is unavailable"""
    return {
        "skill_analysis": {
            "strengths": ["Technical skills in software development", "Project experience"],
            "gaps": [f"Consider expanding {focus}-specific skills", "Build more portfolio projects"]
        },
        "learning_path": {
            "immediate": ["Complete current projects", "Document work in portfolio"],
            "short_term": [f"Deep dive into {focus} technologies", "Contribute to open source"],
            "long_term": ["Build expertise in specialized domain", "Mentor others"]
        },
        "interview_prep": {
            "likely_questions": ["Tell me about your recent projects", "What challenges have you faced?"],
            "talking_points": ["Highlight project experience", "Discuss technical problem-solving"]
        },
        "market_positioning": {
            "target_roles": [f"{focus.title()} Developer", "Software Engineer"],
            "competitive_advantages": ["Diverse project portfolio", "Continuous learning mindset"],
            "resume_improvements": ["Quantify project impact", "Add specific technologies used"]
        }
    }
