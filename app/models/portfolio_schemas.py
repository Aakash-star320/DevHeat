"""Pydantic schemas for portfolio generation endpoints"""
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class PortfolioGenerateResponse(BaseModel):
    """Response model for portfolio generation endpoint"""
    portfolio_id: str = Field(description="Unique portfolio ID")
    slug: str = Field(description="URL-safe portfolio slug")
    status: str = Field(description="Generation status")
    public_portfolio_url: str = Field(description="URL to access public portfolio")
    private_coaching_url: str = Field(description="URL to access private coaching")
    generation_time_seconds: float = Field(description="Time taken to generate portfolio")

    class Config:
        json_schema_extra = {
            "example": {
                "portfolio_id": "550e8400-e29b-41d4-a716-446655440000",
                "slug": "john-doe-29fa2b",
                "status": "completed",
                "public_portfolio_url": "/portfolio/john-doe-29fa2b",
                "private_coaching_url": "/portfolio/john-doe-29fa2b/coaching",
                "generation_time_seconds": 12.5
            }
        }


class PortfolioRefineRequest(BaseModel):
    """Request model for AI-assisted portfolio refinement"""
    section: str = Field(
        description="Section to refine (e.g., 'professional_summary', 'project_highlights')"
    )
    instruction: str = Field(
        min_length=10,
        max_length=500,
        description="Instruction for refinement (e.g., 'make it more concise')"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "section": "professional_summary",
                "instruction": "make it more concise and emphasize backend skills"
            }
        }


class PortfolioRefineResponse(BaseModel):
    """Response model for portfolio refinement"""
    section: str = Field(description="Section that was refined")
    refined_content: str = Field(description="Refined content")
    version_created: bool = Field(description="Whether a new version was created")

    class Config:
        json_schema_extra = {
            "example": {
                "section": "professional_summary",
                "refined_content": "Experienced backend engineer with 5 years...",
                "version_created": True
            }
        }


class PortfolioEditRequest(BaseModel):
    """Request model for manual portfolio editing"""
    updates: Dict[str, Any] = Field(
        description="Dictionary of fields to update in public_portfolio_json"
    )
    changes_summary: Optional[str] = Field(
        default=None,
        description="Optional summary of changes made"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "updates": {
                    "professional_summary": "Updated summary text...",
                    "key_strengths": ["New strength 1", "New strength 2"]
                },
                "changes_summary": "Updated summary and key strengths"
            }
        }


class PortfolioVersionListResponse(BaseModel):
    """Response model for listing portfolio versions"""
    versions: List[Dict[str, Any]] = Field(description="List of portfolio versions")
    total_count: int = Field(description="Total number of versions")

    class Config:
        json_schema_extra = {
            "example": {
                "versions": [
                    {
                        "id": "version-id-1",
                        "version_number": 2,
                        "created_at": "2024-02-09T14:30:00Z",
                        "created_by": "user_manual",
                        "changes_summary": "Updated professional summary"
                    },
                    {
                        "id": "version-id-2",
                        "version_number": 1,
                        "created_at": "2024-02-09T12:00:00Z",
                        "created_by": "ai",
                        "changes_summary": "Initial AI-generated portfolio"
                    }
                ],
                "total_count": 2
            }
        }


class PortfolioErrorResponse(BaseModel):
    """Response model for portfolio generation errors"""
    error: str = Field(description="Error message")
    details: Optional[str] = Field(default=None, description="Detailed error information")
    failed_sources: Optional[List[str]] = Field(
        default=None,
        description="List of data sources that failed to fetch"
    )
    portfolio_id: Optional[str] = Field(
        default=None,
        description="Portfolio ID if partially created"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "error": "Portfolio generation failed",
                "details": "External API timeout",
                "failed_sources": ["github", "codeforces"],
                "portfolio_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }
