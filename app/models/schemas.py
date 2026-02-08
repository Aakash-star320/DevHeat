"""Pydantic schemas for database models (API validation)"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field


class PortfolioBase(BaseModel):
    """Base schema for Portfolio"""
    name: str = Field(..., min_length=1, max_length=200)
    portfolio_focus: str = Field(default="general")
    slug: Optional[str] = None


class PortfolioCreate(PortfolioBase):
    """Schema for creating a new portfolio"""
    pass


class PortfolioUpdate(BaseModel):
    """Schema for updating portfolio (all fields optional)"""
    name: Optional[str] = None
    portfolio_focus: Optional[str] = None
    status: Optional[str] = None
    public_portfolio_json: Optional[Dict[str, Any]] = None
    private_coaching_json: Optional[Dict[str, Any]] = None


class PortfolioInDB(PortfolioBase):
    """Schema for portfolio from database"""
    id: str
    status: str
    has_linkedin: bool
    has_resume: bool
    has_github: bool
    has_codeforces: bool
    has_leetcode: bool

    linkedin_data: Optional[Dict[str, Any]] = None
    resume_text: Optional[str] = None
    github_data: Optional[List[Dict[str, Any]]] = None
    codeforces_data: Optional[Dict[str, Any]] = None
    leetcode_data: Optional[Dict[str, Any]] = None

    public_portfolio_json: Optional[Dict[str, Any]] = None
    private_coaching_json: Optional[Dict[str, Any]] = None
    ai_generation_metadata: Optional[Dict[str, Any]] = None

    error_message: Optional[str] = None

    generation_started_at: Optional[datetime] = None
    generation_completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allows ORM models to be converted to Pydantic


class PortfolioPublic(BaseModel):
    """Public schema for portfolio (limited fields)"""
    id: str
    slug: str
    name: str
    portfolio_focus: str
    status: str
    public_portfolio_url: str
    created_at: datetime

    class Config:
        from_attributes = True


class PortfolioVersionBase(BaseModel):
    """Base schema for PortfolioVersion"""
    portfolio_id: str
    version_number: int
    public_portfolio_json: Dict[str, Any]
    private_coaching_json: Optional[Dict[str, Any]] = None
    changes_summary: Optional[str] = None
    created_by: str = Field(..., description="Options: ai, user_manual, ai_refinement")


class PortfolioVersionCreate(PortfolioVersionBase):
    """Schema for creating a new version"""
    pass


class PortfolioVersionInDB(PortfolioVersionBase):
    """Schema for version from database"""
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


class PortfolioStatusResponse(BaseModel):
    """Response schema for portfolio status check"""
    portfolio_id: str
    slug: str
    status: str
    generation_started_at: Optional[datetime] = None
    generation_completed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True
