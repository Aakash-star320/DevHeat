from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from app.routers import (
    linkedin_router,
    resume_router,
    codeforces_router,
    github_router,
    leetcode_router,
    auth_router,
    portfolio_router,
    portfolio_generation_router,
    portfolio_retrieval_router,
    portfolio_editing_router,
    portfolio_refinement_router,
    auth_router,
    career_bot_router
)
from app.config import logger
from app.database import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for database connections"""
    # Startup: Initialize database
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialized successfully")

    yield

    # Shutdown: Close database connections
    logger.info("Closing database connections...")
    await close_db()
    logger.info("Database connections closed")


# Initialize FastAPI app
app = FastAPI(
    title="Resume-to-Portfolio Generator API",
    description="Backend API for autonomous resume and LinkedIn profile processing with AI-powered portfolio generation",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (CSS, JS, images)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Mount frontend build (for production)
# The frontend build will be in frontend/dist after running npm run build
import os
from fastapi.responses import FileResponse

if os.path.exists("frontend/dist"):
    app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="frontend-assets")

# Register routers
# Auth router
app.include_router(auth_router.router)

# Data extraction endpoints
app.include_router(linkedin_router.router)
app.include_router(resume_router.router)
app.include_router(codeforces_router.router)
app.include_router(github_router.router)
app.include_router(leetcode_router.router)
app.include_router(auth_router.router)

# Portfolio endpoints
app.include_router(portfolio_router.router, prefix="/portfolio")  # Slug generation
app.include_router(portfolio_generation_router.router)  # Portfolio generation orchestrator
app.include_router(portfolio_retrieval_router.router)  # GET endpoints (retrieve portfolios)
# app.include_router(portfolio_editing_router.router)  # PATCH/POST endpoints (edit/refine) - DEPRECATED: Use portfolio_refinement_router instead
app.include_router(portfolio_refinement_router.router)  # AI-assisted refinement

# AI Career Bot
app.include_router(career_bot_router.router)  # AI career coaching chatbot

logger.info("FastAPI application initialized with all routers")

# Root endpoint removed - frontend will be served at / by the catch-all route
# API health check is still available at /health


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring"""
    return {
        "status": "healthy",
        "version": "2.0.0",
        "endpoints": {
            "data_extraction": {
                "linkedin": "/upload/linkedin",
                "resume": "/upload/resume",
                "github": "/github/analyze",
                "codeforces": "/codeforces/{username}",
                "leetcode": "/leetcode/{username}"
            },
            "portfolio": {
                "generate": "/portfolio/generate",
                "retrieve": "/portfolio/{slug}",
                "view_html": "/portfolio/{slug}/view",
                "coaching": "/portfolio/{slug}/coaching",
                "status": "/portfolio/{slug}/status",
                "edit": "/portfolio/{slug}",
                "refine": "/portfolio/{slug}/refine",
                "confirm": "/portfolio/{slug}/confirm",
                "revert": "/portfolio/{slug}/revert",
                "versions": "/portfolio/{slug}/versions",
                "restore": "/portfolio/{slug}/versions/{version_id}/restore",
                "slug_generator": "/portfolio/"
            },
            "career_bot": {
                "chat": "/career-bot/chat",
                "history": "/career-bot/history",
                "clear_history": "/career-bot/history (DELETE)"
            }
        },
        "features": [
            "AI-powered portfolio generation",
            "Code quality analysis",
            "Multi-source data aggregation",
            "Private coaching insights",
            "AI career coaching chatbot"
        ]
    }


# Frontend routes (MUST be last - after all API routers)
if os.path.exists("frontend/dist"):
    @app.get("/refine/{slug}")
    async def serve_refine_page(slug: str):
        """Serve the refinement UI"""
        return FileResponse("frontend/dist/index.html")
    
    @app.get("/view/{slug}")
    async def serve_portfolio_view(slug: str):
        """Serve the public portfolio view UI"""
        return FileResponse("frontend/dist/index.html")
    
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend for all other routes (must be last)"""
        # Block API endpoints from being served as frontend
        api_prefixes = ("api/", "docs", "redoc", "openapi.json", "health", 
                       "upload/", "github/", "codeforces/", "leetcode/")
        
        if full_path.startswith(api_prefixes):
            return {"error": "Not found"}
        
        file_path = f"frontend/dist/{full_path}"
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse("frontend/dist/index.html")
