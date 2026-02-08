from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import linkedin_router, resume_router, codeforces_router, github_router, leetcode_router, portfolio_router
from app.config import logger

# Initialize FastAPI app
app = FastAPI(
    title="Resume-to-Portfolio Generator API",
    description="Backend API for autonomous resume and LinkedIn profile processing",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(linkedin_router.router)
app.include_router(resume_router.router)
app.include_router(codeforces_router.router)
app.include_router(github_router.router)
app.include_router(leetcode_router.router)
app.include_router(portfolio_router.router, prefix="/portfolio")

logger.info("FastAPI application initialized")


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
        "endpoints": {
            "linkedin": "/upload/linkedin",
            "resume": "/upload/resume",
            "codeforces": "/codeforces/{username}",
            "github": "/github/analyze",
            "leetcode": "/leetcode/{username}",
            "portfolio": "/portfolio"
        }
    }
