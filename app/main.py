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
    portfolio_router,
    portfolio_generation_router,
    portfolio_retrieval_router,
    portfolio_editing_router
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

# Register routers
# Data extraction endpoints
app.include_router(linkedin_router.router)
app.include_router(resume_router.router)
app.include_router(codeforces_router.router)
app.include_router(github_router.router)
app.include_router(leetcode_router.router)

# Portfolio endpoints
app.include_router(portfolio_router.router, prefix="/portfolio")  # Slug generation
app.include_router(portfolio_generation_router.router)  # Portfolio generation orchestrator
app.include_router(portfolio_retrieval_router.router)  # GET endpoints (retrieve portfolios)
app.include_router(portfolio_editing_router.router)  # PATCH/POST endpoints (edit/refine)

logger.info("FastAPI application initialized with all routers")


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - API health check"""
    return {
        "status": "online",
        "service": "Resume-to-Portfolio Generator API",
        "version": "1.0.0"
    }


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
                "versions": "/portfolio/{slug}/versions",
                "restore": "/portfolio/{slug}/versions/{version_id}/restore",
                "slug_generator": "/portfolio/"
            }
        },
        "features": [
            "AI-powered portfolio generation",
            "Code quality analysis",
            "Multi-source data aggregation",
            "Private coaching insights"
        ]
    }
