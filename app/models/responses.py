from typing import Optional
from pydantic import BaseModel, Field, field_validator
from typing import List


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
                "resume_text": "Marcus Johnson\nSoftware Engineer\n\nExperience:\n..."
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


# GitHub Analyzer Models

class GitHubAnalyzeRequest(BaseModel):
    """Request model for GitHub repository analysis"""
    repos: List[str] = Field(
        min_length=1,
        max_length=5,
        description="List of GitHub repository URLs (1-5 repos)"
    )
    
    @field_validator('repos')
    @classmethod
    def validate_github_urls(cls, v: List[str]) -> List[str]:
        """Validate that all URLs are valid GitHub repository URLs"""
        import re
        github_pattern = re.compile(
            r'^https?://github\.com/[\w\-\.]+/[\w\-\.]+/?$'
        )
        
        for url in v:
            # Remove trailing slash for validation
            clean_url = url.rstrip('/')
            if not github_pattern.match(clean_url):
                raise ValueError(
                    f"Invalid GitHub URL: {url}. "
                    "Expected format: https://github.com/owner/repo"
                )
        
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "repos": [
                    "https://github.com/octocat/Hello-World",
                    "https://github.com/torvalds/linux"
                ]
            }
        }


class RepositoryStructure(BaseModel):
    """Repository structure analysis"""
    files: int = Field(description="Total number of files")
    folders: int = Field(description="Total number of folders")
    max_depth: int = Field(description="Maximum directory depth")
    top_dirs: List[str] = Field(description="Top-level directories")
    largest_file_kb: float = Field(description="Largest file size in KB")
    has_tests: bool = Field(description="Whether repository contains test files")
    
    class Config:
        json_schema_extra = {
            "example": {
                "files": 42,
                "folders": 15,
                "max_depth": 5,
                "top_dirs": ["src", "tests", "docs"],
                "largest_file_kb": 125.5,
                "has_tests": True
            }
        }


class GitHubRepoAnalysis(BaseModel):
    """Analysis result for a single GitHub repository"""
    name: str = Field(description="Repository name")
    description: str = Field(description="Repository description")
    primary_language: str = Field(description="Primary programming language")
    last_updated: str = Field(description="Last update timestamp")
    readme_text: str = Field(description="README content (truncated to 10k chars)")
    readme_length: int = Field(description="README character count")
    structure: RepositoryStructure = Field(description="Repository structure analysis")
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Hello-World",
                "description": "My first repository on GitHub!",
                "primary_language": "Python",
                "last_updated": "2024-01-15T10:30:00Z",
                "readme_text": "# Hello World\n\nThis is a sample project...",
                "readme_length": 1250,
                "structure": {
                    "files": 42,
                    "folders": 15,
                    "max_depth": 5,
                    "top_dirs": ["src", "tests", "docs"],
                    "largest_file_kb": 125.5,
                    "has_tests": True
                }
            }
        }


class GitHubAnalyzeResponse(BaseModel):
    """Response model for GitHub repository analysis"""
    repos: List[GitHubRepoAnalysis] = Field(
        description="List of analyzed repositories"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "repos": [
                    {
                        "name": "Hello-World",
                        "description": "My first repository on GitHub!",
                        "primary_language": "Python",
                        "last_updated": "2024-01-15T10:30:00Z",
                        "readme_text": "# Hello World\n\nThis is a sample project...",
                        "readme_length": 1250,
                        "structure": {
                            "files": 42,
                            "folders": 15,
                            "max_depth": 5,
                            "top_dirs": ["src", "tests", "docs"],
                            "largest_file_kb": 125.5,
                            "has_tests": True
                        }
                    }
                ]
            }
        }


class LeetCodeResponse(BaseModel):
    """Response model for LeetCode user statistics"""
    username: str = Field(description="LeetCode username")
    total_solved: int = Field(
        default=0,
        description="Total problems solved (all difficulties)"
    )
    easy_solved: int = Field(
        default=0,
        description="Easy problems solved"
    )
    medium_solved: int = Field(
        default=0,
        description="Medium problems solved"
    )
    hard_solved: int = Field(
        default=0,
        description="Hard problems solved"
    )
    profile_url: str = Field(
        description="LeetCode profile URL"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "john_doe",
                "total_solved": 450,
                "easy_solved": 200,
                "medium_solved": 180,
                "hard_solved": 70,
                "profile_url": "https://leetcode.com/john_doe"
            }
        }


class PortfolioRequest(BaseModel):
    """Request model for portfolio slug generation"""
    name: str = Field(
        min_length=1,
        description="User's name to generate portfolio slug from"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Marcus Johnson"
            }
        }


class PortfolioResponse(BaseModel):
    """Response model for portfolio slug generation"""
    portfolio_url: str = Field(
        description="Generated portfolio URL path"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "portfolio_url": "/portfolio/marcus-johnson-29fa2b"
            }
        }



