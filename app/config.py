import logging
from typing import List, Dict

# File upload constraints
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB in bytes
ALLOWED_EXTENSIONS = [".pdf", ".docx"]
ALLOWED_MIME_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
]

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
