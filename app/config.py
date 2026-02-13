import logging
import os
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()
print(f"DEBUG: GEMINI_API_KEY from env: {os.getenv('GEMINI_API_KEY')}")
print(f"DEBUG: Current Source File: {__file__}")
print(f"DEBUG: Current Working Directory: {os.getcwd()}")

# File upload constraints
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes
ALLOWED_EXTENSIONS = [".pdf", ".docx"]
ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

# API Keys and Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./portfolio.db")

# GitHub OAuth Configuration
GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")
GITHUB_REDIRECT_URI = os.getenv("GITHUB_REDIRECT_URI", "http://localhost:8000/auth/callback")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 1 week

# Section keywords for LinkedIn parsing (case-insensitive matching)
LINKEDIN_SECTIONS: Dict[str, List[str]] = {
    "summary": ["summary", "about"],
    "experience": ["experience", "work experience", "professional experience"],
    "education": ["education", "academic background"],
    "skills": ["skills", "technical skills", "core competencies"]
}

# Logging setup
def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger(__name__)

logger = setup_logging()
