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


async def refine_portfolio_content(
    current_portfolio_json: Dict[str, Any],
    instruction: str,
    sections_to_modify: List[str]
) -> Dict[str, Any]:
    """
    Refine specific sections of a portfolio using AI.
    
    This function sends the FULL portfolio JSON to Gemini with instructions
    to modify only the specified sections. The AI returns the complete
    updated portfolio JSON.
    
    Args:
        current_portfolio_json: Complete current portfolio JSON
        instruction: User's refinement instruction
        sections_to_modify: List of section names to modify (e.g., ["summary", "experience"])
    
    Returns:
        Complete refined portfolio JSON
    
    Raises:
        Exception: If AI generation fails or returns invalid JSON
    """
    if not GEMINI_API_KEY:
        raise Exception("GEMINI_API_KEY not configured")
    
    # Build the refinement prompt
    prompt = _build_refinement_prompt(
        current_portfolio_json=current_portfolio_json,
        instruction=instruction,
        sections_to_modify=sections_to_modify
    )
    
    # Log the prompt for debugging
    _log_prompt("refinement", prompt)
    
    try:
        # Call Gemini API
        model = genai.GenerativeModel(MODEL_NAME)
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=8192,
            )
        )
        
        # Extract and parse JSON response
        response_text = response.text.strip()
        
        # Log the response
        _log_response("refinement", response_text)
        
        # Remove markdown code blocks if present
        if response_text.startswith("```"):
            lines = response_text.split("\n")
            response_text = "\n".join(lines[1:-1])
        
        # Parse JSON
        refined_json = json.loads(response_text)
        
        logger.info(f"Successfully refined portfolio - sections: {sections_to_modify}")
        return refined_json
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse AI response as JSON: {e}")
        logger.error(f"Response text: {response_text[:500]}")
        raise Exception(f"AI returned invalid JSON: {str(e)}")
    except Exception as e:
        logger.error(f"AI refinement failed: {e}")
        raise


def _build_refinement_prompt(
    current_portfolio_json: Dict[str, Any],
    instruction: str,
    sections_to_modify: List[str]
) -> str:
    """Build the prompt for portfolio refinement"""
    
    # Map user-friendly section names to JSON paths
    section_mapping = {
        "summary": "ai_generated_content.professional_summary",
        "experience": "ai_generated_content.work_experience",
        "projects": "ai_generated_content.project_highlights",
        "skills": "ai_generated_content.skills_summary",
        "strengths": "ai_generated_content.key_strengths",
        "achievements": "ai_generated_content.achievements",
        "contact": "ai_generated_content.contact_info"
    }
    
    # Check if "all" is specified - refine entire ai_generated_content
    if "all" in sections_to_modify or len(sections_to_modify) == 0:
        sections_to_modify = list(section_mapping.keys())
        refine_all = True
    else:
        refine_all = False
    
    # Build list of JSON paths to modify
    json_paths = [section_mapping.get(section, section) for section in sections_to_modify]
    
    if refine_all:
        scope_instruction = "Apply the instruction to ALL sections of the portfolio (entire ai_generated_content)"
    else:
        scope_instruction = f"Apply the instruction ONLY to these sections: {', '.join(sections_to_modify)}"
    
    prompt = f"""You are a professional portfolio editor. Refine the portfolio based on the user's instruction.

USER INSTRUCTION: {instruction}

SCOPE: {scope_instruction}
(JSON paths to modify: {', '.join(json_paths)})

CURRENT PORTFOLIO JSON:
{json.dumps(current_portfolio_json, indent=2)}

TASK:
1. Read the current portfolio JSON carefully
2. Apply the user's instruction to the specified sections
3. {"Refine ALL content in ai_generated_content" if refine_all else "Keep unspecified sections exactly as they are"}
4. Return the COMPLETE updated portfolio JSON

CRITICAL REQUIREMENTS:
- Output ONLY valid JSON, no explanations or markdown
- Preserve the exact JSON structure
- {"Refine all ai_generated_content sections" if refine_all else "Only modify content within the specified sections"}
- Do NOT add or remove top-level keys
- Do NOT modify personal_info, data_sources, or metadata sections
- Ensure all required fields remain populated

OUTPUT FORMAT:
Return the complete portfolio JSON with the refined content.
"""
    
    return prompt


def _log_prompt(prompt_type: str, prompt: str):
    """Log AI prompt to file for debugging"""
    try:
        logs_dir = Path("logs")
        logs_dir.mkdir(exist_ok=True)
        
        log_file = logs_dir / f"last_{prompt_type}_prompt.txt"
        with open(log_file, "w", encoding="utf-8") as f:
            f.write(f"--- PROMPT FOR {prompt_type.upper()} ---\n")
            f.write(f"TIMESTAMP: {datetime.now().isoformat()}\n")
            f.write("-" * 30 + "\n")
            f.write(prompt)
            f.write("\n" + "-" * 30 + "\n")
    except Exception as e:
        logger.warning(f"Failed to log prompt: {e}")


def _log_response(response_type: str, response: str):
    """Log AI response to file for debugging"""
    try:
        logs_dir = Path("logs")
        logs_dir.mkdir(exist_ok=True)
        
        log_file = logs_dir / f"last_{response_type}_response.txt"
        with open(log_file, "w", encoding="utf-8") as f:
            f.write(response)
    except Exception as e:
        logger.warning(f"Failed to log response: {e}")
