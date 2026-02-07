from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import Dict
from app.models.responses import LinkedInResponse, ErrorResponse
from app.utils.validators import check_file_validity, FileValidationError
from app.utils.file_parser import extract_text
from app.config import LINKEDIN_SECTIONS, logger

router = APIRouter(prefix="/upload", tags=["LinkedIn"])


def parse_linkedin_sections(text: str) -> Dict[str, str]:
    """
    Splits LinkedIn text into sections using keyword matching.
    Handles LinkedIn's PDF format where summary content appears before the Summary header.
    
    Args:
        text: Full extracted text from LinkedIn PDF/DOCX
    
    Returns:
        Dictionary with summary, experience_raw, education_raw, skills_raw
    """
    lines = text.split('\n')
    
    # Find section header positions
    section_positions = {
        "skills": -1,
        "summary_header": -1,
        "experience": -1,
        "education": -1
    }
    
    for i, line in enumerate(lines):
        line_lower = line.strip().lower()
        
        if line_lower in ["top skills", "skills", "technical skills", "core competencies"] and section_positions["skills"] == -1:
            section_positions["skills"] = i
            logger.info(f"Found Skills header at line {i}")
        elif line_lower in ["summary", "about"] and section_positions["summary_header"] == -1:
            section_positions["summary_header"] = i
            logger.info(f"Found Summary header at line {i}")
        elif line_lower in ["experience", "work experience", "professional experience"] and section_positions["experience"] == -1:
            section_positions["experience"] = i
            logger.info(f"Found Experience header at line {i}")
        elif line_lower in ["education", "academic background"] and section_positions["education"] == -1:
            section_positions["education"] = i
            logger.info(f"Found Education header at line {i}")
    
    # Initialize sections
    sections = {
        "summary": "",
        "experience_raw": "",
        "education_raw": "",
        "skills_raw": ""
    }
    
    # Extract Skills section (from "Top Skills" to "Summary" or "Experience")
    if section_positions["skills"] != -1:
        start = section_positions["skills"] + 1
        # End at Summary header OR Experience header (whichever comes first)
        end_candidates = [pos for pos in [section_positions["summary_header"], section_positions["experience"]] if pos > start]
        end = min(end_candidates) if end_candidates else len(lines)
        
        skills_lines = []
        consecutive_long_lines = 0
        
        for line in lines[start:end]:
            stripped = line.strip()
            
            if not stripped:
                skills_lines.append(line)
                continue
            
            # Skills are typically short (1-5 words), summaries are longer paragraphs
            # If we see 2+ consecutive lines with 10+ words, it's likely summary content
            word_count = len(stripped.split())
            
            if word_count > 10:
                consecutive_long_lines += 1
                if consecutive_long_lines >= 2:
                    # We've hit summary content, stop here
                    break
            else:
                consecutive_long_lines = 0
                skills_lines.append(line)
        
        sections["skills_raw"] = '\n'.join(skills_lines).strip()
    
    # Extract Summary section
    # Summary content is between end of skills and "Experience" header
    if section_positions["skills"] != -1 and section_positions["experience"] != -1:
        start = section_positions["skills"] + 1
        
        # Find where skills end (where we stopped adding to skills_lines)
        # This is where we first encounter paragraph-style content
        summary_start = start
        consecutive_long_lines = 0
        
        for i in range(start, section_positions["experience"]):
            stripped = lines[i].strip()
            if not stripped:
                continue
                
            word_count = len(stripped.split())
            if word_count > 10:
                consecutive_long_lines += 1
                if consecutive_long_lines >= 2:
                    # Found start of narrative content
                    # Back up to where long lines started
                    summary_start = i - 1
                    break
            else:
                consecutive_long_lines = 0
        
        end = section_positions["experience"]
        sections["summary"] = '\n'.join(lines[summary_start:end]).strip()
    elif section_positions["experience"] != -1 and section_positions["skills"] == -1:
        # No skills section found, everything before Experience is summary
        sections["summary"] = '\n'.join(lines[:section_positions["experience"]]).strip()
    
    # Extract Experience section
    if section_positions["experience"] != -1:
        start = section_positions["experience"] + 1
        end = section_positions["education"] if section_positions["education"] != -1 else len(lines)
        sections["experience_raw"] = '\n'.join(lines[start:end]).strip()
    
    # Extract Education section
    if section_positions["education"] != -1:
        start = section_positions["education"] + 1
        sections["education_raw"] = '\n'.join(lines[start:]).strip()
    
    # Log results
    for key, value in sections.items():
        if value:
            logger.info(f"Section '{key}': {len(value)} characters")
        else:
            logger.warning(f"Section '{key}': empty")
    
    return sections


@router.post(
    "/linkedin",
    response_model=LinkedInResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid file"},
        500: {"model": ErrorResponse, "description": "Processing error"}
    },
    summary="Upload LinkedIn Profile",
    description="Extracts and parses LinkedIn profile from PDF or DOCX file into structured sections"
)
async def upload_linkedin(file: UploadFile = File(...)) -> LinkedInResponse:
    """
    Processes LinkedIn profile upload and extracts sections.
    
    - **file**: PDF or DOCX file containing LinkedIn profile
    
    Returns structured data with summary, experience, education, and skills sections.
    """
    try:
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        logger.info(f"Processing LinkedIn file: {file.filename} ({file_size} bytes)")
        
        # Validate file
        try:
            check_file_validity(
                filename=file.filename,
                content_type=file.content_type,
                file_size=file_size
            )
        except FileValidationError as e:
            logger.warning(f"Validation failed for {file.filename}: {str(e)}")
            raise HTTPException(status_code=400, detail=str(e))
        
        # Extract text
        try:
            extracted_text = extract_text(file_content, file.filename)
            logger.info(f"Extracted {len(extracted_text)} characters from {file.filename}")
        except Exception as e:
            logger.error(f"Text extraction failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to extract text from file: {str(e)}"
            )
        
        # Parse into sections
        sections = parse_linkedin_sections(extracted_text)
        
        logger.info(f"Parsed LinkedIn sections - Summary: {len(sections['summary'])} chars, "
                   f"Experience: {len(sections['experience_raw'])} chars, "
                   f"Education: {len(sections['education_raw'])} chars, "
                   f"Skills: {len(sections['skills_raw'])} chars")
        
        return LinkedInResponse(**sections)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing LinkedIn file: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"An unexpected error occurred: {str(e)}"
        )
