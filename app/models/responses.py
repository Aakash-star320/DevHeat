from typing import Optional
from pydantic import BaseModel, Field


class LinkedInResponse(BaseModel):
    """Response model for LinkedIn profile parsing"""
    summary: str = Field(
        default="",
        description="Summary or About section content"
    )
    experience_raw: str = Field(
        default="",
        description="Work experience section content"
    )
    education_raw: str = Field(
        default="",
        description="Education section content"
    )
    skills_raw: str = Field(
        default="",
        description="Skills section content"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "summary": "Experienced software engineer with 5 years...",
                "experience_raw": "Senior Developer at Tech Corp\n2020-Present...",
                "education_raw": "BS Computer Science\nStanford University...",
                "skills_raw": "Python, JavaScript, React, FastAPI..."
            }
        }


class ResumeResponse(BaseModel):
    """Response model for resume text extraction"""
    resume_text: str = Field(
        description="Full extracted text from resume"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "resume_text": "John Doe\nSoftware Engineer\n\nExperience:\n..."
            }
        }


class ErrorResponse(BaseModel):
    """Standard error response format"""
    detail: str = Field(
        description="Error message describing what went wrong"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "detail": "File type not allowed. Accepted formats: .pdf, .docx"
            }
        }


class CodeforcesResponse(BaseModel):
    """Response model for Codeforces user statistics"""
    username: str = Field(description="Codeforces handle")
    current_rating: Optional[int] = Field(
        default=None,
        description="Current rating (null if unrated)"
    )
    max_rating: Optional[int] = Field(
        default=None,
        description="Maximum rating achieved"
    )
    rank: Optional[str] = Field(
        default=None,
        description="Current rank/title"
    )
    contest_count: int = Field(
        default=0,
        description="Number of contests participated"
    )
    problems_solved: int = Field(
        default=0,
        description="Unique problems solved"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "tourist",
                "current_rating": 3858,
                "max_rating": 4229,
                "rank": "legendary grandmaster",
                "contest_count": 156,
                "problems_solved": 2847
            }
        }
