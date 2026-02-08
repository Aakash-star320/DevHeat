# Resume-to-Portfolio Generator - Backend API

FastAPI backend for autonomous resume and portfolio generation. Built for hackathon with clean architecture and production-ready code.

## Features

### File Upload Endpoints
- **LinkedIn Profile Parser** (`/upload/linkedin`) - Extracts structured sections from LinkedIn PDFs
- **Resume Text Extractor** (`/upload/resume`) - Extracts raw text from resume files

### Data Fetching Endpoints
- **Codeforces Stats** (`/codeforces/{username}`) - Fetches competitive programming statistics
- **GitHub Analyzer** (`/github/analyze`) - Analyzes repository metadata, structure, and README
- **LeetCode Stats** (`/leetcode/{username}`) - Fetches problem-solving statistics via GraphQL

### Utility Endpoints
- **Portfolio Slug Generator** (`/portfolio`) - Generates unique URL-safe portfolio slugs

### File Support
- PDF (text-based, no OCR)
- DOCX (Microsoft Word)
- 5MB file size limit

### Validation
- File type checking (extension + MIME type)
- Size validation
- Proper error responses with detailed messages

## Project Structure

```
Devheat/
├── app/
│   ├── main.py                    # FastAPI app initialization
│   ├── config.py                  # Configuration & constants
│   ├── routers/
│   │   ├── linkedin_router.py     # LinkedIn profile upload
│   │   ├── resume_router.py       # Resume upload
│   │   ├── codeforces_router.py   # Codeforces API integration
│   │   ├── github_router.py       # GitHub GraphQL analyzer
│   │   ├── leetcode_router.py     # LeetCode GraphQL stats
│   │   └── portfolio_router.py    # Portfolio slug generator
│   ├── services/
│   │   ├── github_service.py      # GitHub API logic
│   │   └── leetcode_service.py    # LeetCode GraphQL logic
│   ├── models/
│   │   └── responses.py           # Pydantic models
│   └── utils/
│       ├── validators.py          # File validation
│       ├── file_parser.py         # Text extraction
│       └── slug.py                # Slug generation
├── .env                           # Environment variables (GitHub token)
├── requirements.txt
└── README.md
```

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd C:\Users\ankit\OneDrive\Desktop\Devheat
python -m venv venv
```

### 2. Activate Virtual Environment

```bash
# Windows
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the Server

```bash
uvicorn app.main:app --reload
```

The API will be available at: `http://localhost:8000`

### 5. Access Documentation

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Health Check

```bash
GET /
GET /health
```

Returns API status and available endpoints.

---

### 📄 Upload LinkedIn Profile

```bash
POST /upload/linkedin
```

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (PDF or DOCX)

**Response:**
```json
{
  "summary": "...",
  "experience_raw": "...",
  "education_raw": "...",
  "skills_raw": "..."
}
```

---

### 📄 Upload Resume

```bash
POST /upload/resume
```

**Request:**
- Content-Type: `multipart/form-data`
- Body: `file` (PDF or DOCX)

**Response:**
```json
{
  "resume_text": "full extracted text..."
}
```

---

### 🏆 Get Codeforces Statistics

```bash
GET /codeforces/{username}
```

**Example:** `/codeforces/tourist`

**Response:**
```json
{
  "username": "tourist",
  "current_rating": 3858,
  "max_rating": 4229,
  "rank": "legendary grandmaster",
  "contest_count": 156,
  "problems_solved": 2847
}
```

---

### 💻 Analyze GitHub Repositories

```bash
POST /github/analyze
```

**Request:**
```json
{
  "repos": [
    "https://github.com/octocat/Hello-World",
    "https://github.com/torvalds/linux"
  ]
}
```

**Response:**
```json
{
  "repos": [
    {
      "name": "Hello-World",
      "description": "My first repository",
      "primary_language": "Python",
      "last_updated": "2024-01-15T10:30:00Z",
      "readme_text": "# Hello World...",
      "readme_length": 1250,
      "structure": {
        "files": 42,
        "folders": 15,
        "max_depth": 5,
        "top_dirs": ["src", "tests", "docs"],
        "largest_file_kb": 125.5,
        "has_tests": true
      }
    }
  ]
}
```

**Requirements:**
- Set `GITHUB_TOKEN` in `.env` file
- Accepts 1-5 repository URLs

---

### 🧩 Get LeetCode Statistics

```bash
GET /leetcode/{username}
```

**Example:** `/leetcode/lee215`

**Response:**
```json
{
  "username": "lee215",
  "total_solved": 2500,
  "easy_solved": 800,
  "medium_solved": 1200,
  "hard_solved": 500,
  "profile_url": "https://leetcode.com/lee215"
}
```

---

### 🔗 Generate Portfolio Slug

```bash
POST /portfolio
```

**Request:**
```json
{
  "name": "John Doe"
}
```

**Response:**
```json
{
  "portfolio_url": "/portfolio/john-doe-29fa2b"
}
```

Generates unique URL-safe slugs with random 6-character UUID suffix.

---

## Testing with cURL

### LinkedIn Upload

```bash
curl -X POST "http://localhost:8000/upload/linkedin" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/linkedin.pdf"
```

### GitHub Analyzer

```bash
curl -X POST "http://localhost:8000/github/analyze" \
  -H "Content-Type: application/json" \
  -d '{"repos": ["https://github.com/octocat/Hello-World"]}'
```

### LeetCode Stats

```bash
curl -X GET "http://localhost:8000/leetcode/tourist"
```

### Portfolio Slug

```bash
curl -X POST "http://localhost:8000/portfolio" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe"}'
```

## Error Handling

### 400 Bad Request
- Invalid file type
- File too large
- Empty file
- .doc format (not supported)

### 500 Internal Server Error
- PDF/DOCX parsing failure
- Unexpected errors

## Development

### Run with Auto-Reload

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Run in Production Mode

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Notes

- **Stateless API** - No database integration
- **External APIs** - Integrates with Codeforces, GitHub, and LeetCode public APIs
- **Authentication** - GitHub analyzer requires Personal Access Token in `.env`
- **Text-based PDFs only** - No OCR support
- **CORS enabled** - All origins allowed (update for production)

## Tech Stack

- **FastAPI** - Modern async web framework
- **httpx** - Async HTTP client for API calls
- **pdfplumber** - PDF text extraction
- **python-docx** - DOCX text extraction
- **python-dotenv** - Environment variable management
- **Pydantic** - Data validation and serialization
- **Uvicorn** - ASGI server

## Environment Variables

Create a `.env` file in the project root:

```env
GITHUB_TOKEN=your_github_personal_access_token_here
```

**To get a GitHub token:**
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `public_repo` scope
4. Copy and paste into `.env`

## License

Built for hackathon use.

