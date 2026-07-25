"""Authenticated resume-only JD readiness endpoint."""
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.database import Portfolio, User
from app.routers.auth_router import get_current_user
from app.services.jd_match_service import (
    PROMPT_INJECTION_MESSAGE,
    SuspiciousJobDescriptionError,
    analyse_jd,
)


router = APIRouter(prefix="/jd-match", tags=["JD Readiness"])


class JDMatchRequest(BaseModel):
    job_description: str = Field(min_length=80, max_length=30000)


class JDMatchResponse(BaseModel):
    score: int
    section_scores: Dict[str, Optional[int]]
    weights: Dict[str, int]
    analysis: Dict[str, Any]
    gaps: List[Dict[str, Any]]
    strengths: List[Dict[str, Any]]
    tips: List[str]
    model_used: str


@router.post("/analyze", response_model=JDMatchResponse)
async def analyze_job_description(
    request: JDMatchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Portfolio)
        .where(
            Portfolio.user_id == current_user.id,
            Portfolio.status == "completed",
            Portfolio.resume_text.is_not(None),
        )
        .order_by(Portfolio.created_at.desc())
        .limit(1)
    )
    portfolio = result.scalars().first()
    resume_text = (portfolio.resume_text or "").strip() if portfolio else ""
    if not resume_text:
        raise HTTPException(status_code=403, detail="Create a completed portfolio with a resume before checking JD readiness.")
    try:
        return await analyse_jd(resume_text, request.job_description.strip())
    except SuspiciousJobDescriptionError as error:
        raise HTTPException(status_code=400, detail=PROMPT_INJECTION_MESSAGE) from error
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
