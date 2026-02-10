# Resume-to-Portfolio Generator - Backend API v2.0

FastAPI backend for autonomous resume and portfolio generation with AI-powered content generation, code quality analysis, and database persistence. Built for hackathon with production-ready architecture.

## Overview

This application generates professional portfolios by aggregating data from multiple sources including LinkedIn, resumes, GitHub repositories, Codeforces, and LeetCode profiles. It leverages AI to create polished content while maintaining ethical data usage practices.

## New in v2.0

- **AI-Powered Portfolio Generation** using Google Gemini
- **Database Persistence** (SQLite/PostgreSQL support)
- **Code Quality Analysis** (heuristic-based, language-agnostic)
- **Private Coaching Insights** (skill gaps, learning paths, interview prep)
- **Portfolio Refinement UI** with version management (React frontend)
- **AI-Assisted Refinement** with confirm/revert workflows
- **Version History** tracking with draft/committed states

---

## Features

### Portfolio Generation

- **AI Content Generator** - Generates professional summaries, project highlights, and skills using Gemini API
- **Code Quality Analyzer** - Analyzes GitHub repositories for complexity, documentation, and best practices
- **Multi-Source Aggregation** - Combines LinkedIn, Resume, GitHub, Codeforces, and LeetCode data
- **Public/Private Output** - Public portfolio JSON + private coaching insights

### File Upload Endpoints

- **LinkedIn Profile Parser** (`/upload/linkedin`) - Extracts structured sections from LinkedIn PDFs
- **Resume Text Extractor** (`/upload/resume`) - Extracts raw text from resume files

### Data Fetching Endpoints

- **Codeforces Stats** (`/codeforces/{username}`) - Competitive programming statistics
- **GitHub Analyzer** (`/github/analyze`) - Repository metadata, structure, and README analysis
- **LeetCode Stats** (`/leetcode/{username}`) - Problem-solving statistics via GraphQL

### Portfolio Endpoints

- **Generate Portfolio** (`POST /portfolio/generate`) - Main orchestrator endpoint
- **Retrieve Portfolio** (`GET /portfolio/{slug}`) - Get public portfolio JSON
- **Get Coaching** (`GET /portfolio/{slug}/coaching`) - Get private coaching insights
- **Check Status** (`GET /portfolio/{slug}/status`) - Poll generation status
- **Refine Portfolio** (`POST /portfolio/{slug}/refine`) - AI-assisted full portfolio refinement
- **Confirm Portfolio** (`POST /portfolio/{slug}/confirm`) - Commit draft version
- **Revert Portfolio** (`POST /portfolio/{slug}/revert`) - Revert to previous version
- **List Versions** (`GET /portfolio/{slug}/versions`) - Get all version history
- **Get Version** (`GET /portfolio/{slug}/versions/{version_id}`) - Get specific version content

### Frontend UI

- **Portfolio Generator** (`http://localhost:3000`) - Upload resume/LinkedIn/GitHub data
- **Refinement UI** (`http://localhost:3000/refine/{slug}`) - Version management interface with:
  - Two-pane layout (desktop) / dropdown (mobile)
  - Version selector with status badges (Current/Draft/Committed)
  - Read-only portfolio preview
  - AI refinement controls with conditional confirm button
  - Revert action bar for viewing older versions

### Database & Persistence

- **SQLite** (MVP) or **PostgreSQL** (production)
- **Async SQLAlchemy** ORM
- **Alembic** migrations
- **Portfolio versioning** for edit history

---

## Project Structure

```
DevHeat/
├── app/
│   ├── main.py                              # FastAPI app with lifecycle events
│   ├── config.py                            # Configuration (API keys, constants)
│   ├── database.py                          # Database session management
│   ├── routers/
│   │   ├── linkedin_router.py               # LinkedIn profile upload
│   │   ├── resume_router.py                 # Resume upload
│   │   ├── codeforces_router.py             # Codeforces API integration
│   │   ├── github_router.py                 # GitHub analyzer
│   │   ├── leetcode_router.py               # LeetCode GraphQL stats
│   │   ├── portfolio_router.py              # Slug generation
│   │   ├── portfolio_generation_router.py   # Main orchestrator
│   │   ├── portfolio_retrieval_router.py    # GET endpoints
│   │   └── portfolio_editing_router.py      # PATCH/POST endpoints
│   ├── services/
│   │   ├── github_service.py                # GitHub API logic
│   │   ├── leetcode_service.py              # LeetCode GraphQL logic
│   │   ├── ai_service.py                    # Gemini API integration
│   │   ├── code_quality_service.py          # Heuristic analysis
│   │   └── portfolio_builder_service.py     # JSON construction
│   ├── models/
│   │   ├── responses.py                     # Pydantic response models
│   │   ├── database.py                      # SQLAlchemy ORM models
│   │   ├── schemas.py                       # DB Pydantic schemas
│   │   └── portfolio_schemas.py             # Portfolio request/response
│   └── utils/
│       ├── validators.py                    # File validation
│       ├── file_parser.py                   # Text extraction
│       └── slug.py                          # Slug generation
├── frontend/
│   ├── src/                                 # React source files
│   ├── package.json                         # Frontend dependencies
│   └── vite.config.js                       # Vite configuration
├── alembic/                                 # Database migrations
│   ├── versions/
│   │   └── 001_initial_schema.py
│   ├── env.py
│   └── script.py.mako
├── .env                                     # Environment variables
├── .gitignore                               # Git ignore patterns
├── alembic.ini                              # Alembic configuration
├── requirements.txt                         # Python dependencies
├── portfolio.db                             # SQLite database (auto-created)
└── README.md
```

---

## Setup Instructions

### 1. Clone Repository

```bash
git clone <repository-url>
cd DevHeat
```

### 2. Create Virtual Environment

```bash
python -m venv venv
```

### 3. Activate Virtual Environment

```bash
# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 4. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create a `.env` file in the project root:

```env
# GitHub API Token (for repository analysis)
GITHUB_TOKEN=your_github_personal_access_token_here

# Google Gemini API Key (for AI content generation)
GEMINI_API_KEY=your_gemini_api_key_here

# Database URL (SQLite for MVP, PostgreSQL for production)
DATABASE_URL=sqlite+aiosqlite:///./portfolio.db
```

**To get a GitHub token:**
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select `public_repo` scope
4. Copy and paste into `.env`

**To get a Gemini API key:**
1. Go to https://aistudio.google.com/app/apikey
2. Create API key
3. Copy and paste into `.env`

### 6. Run Database Migrations

```bash
alembic upgrade head
```

### 7. Run the Backend Server

```bash
uvicorn app.main:app --reload
```

The API will be available at: `http://localhost:8000`

### 8. Install and Run Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at: `http://localhost:3000`

### 9. Access Documentation

- **Frontend**: http://localhost:3000
- **Refinement UI**: http://localhost:3000/refine/{slug}
- **API Swagger UI**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc

---

## API Endpoints

### Health Check

```bash
GET /
GET /health
```

Returns API status and available endpoints.

---

## Portfolio Generation Workflow

### 1. Generate Portfolio

```bash
POST /portfolio/generate
```

**Request (multipart/form-data):**
```bash
curl -X POST "http://localhost:8000/portfolio/generate" \
  -F "name=John Doe" \
  -F "portfolio_focus=fullstack" \
  -F "linkedin_file=@linkedin.pdf" \
  -F "resume_file=@resume.pdf" \
  -F 'github_repos=["https://github.com/user/repo1", "https://github.com/user/repo2"]' \
  -F "codeforces_username=tourist" \
  -F "leetcode_username=johndoe"
```

**Parameters:**
- `name` (required): Full name
- `portfolio_focus` (optional): Focus area (`fullstack`, `backend`, `ml`, `competitive`, `general`)
- `linkedin_file` (optional): LinkedIn PDF
- `resume_file` (optional): Resume PDF
- `github_repos` (optional): JSON array of GitHub repo URLs (max 5)
- `codeforces_username` (optional): Codeforces handle
- `leetcode_username` (optional): LeetCode username

**Response:**
```json
{
  "portfolio_id": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "john-doe-29fa2b",
  "status": "completed",
  "public_portfolio_url": "/portfolio/john-doe-29fa2b",
  "private_coaching_url": "/portfolio/john-doe-29fa2b/coaching",
  "generation_time_seconds": 12.5
}
```

---

### 2. Retrieve Public Portfolio

```bash
GET /portfolio/{slug}
```

**Example:**
```bash
curl -X GET "http://localhost:8000/portfolio/john-doe-29fa2b"
```

**Response:** Complete public portfolio JSON with:
- Personal info (name, slug, focus)
- AI-generated content (professional summary, key strengths, project highlights, skills)
- Data sources (GitHub projects, competitive programming stats, skills)
- Code quality metrics
- Metadata (generated timestamp, sources used)

---

### 3. Retrieve Private Coaching

```bash
GET /portfolio/{slug}/coaching
```

**Example:**
```bash
curl -X GET "http://localhost:8000/portfolio/john-doe-29fa2b/coaching"
```

**Response:** Private coaching JSON with:
- Skill analysis (strengths, gaps)
- Learning path (immediate, short-term, long-term)
- Interview prep (likely questions, talking points)
- Market positioning (target roles, competitive advantages, resume improvements)

---

### 4. Check Generation Status

```bash
GET /portfolio/{slug}/status
```

**Example:**
```bash
curl -X GET "http://localhost:8000/portfolio/john-doe-29fa2b/status"
```

**Response:**
```json
{
  "portfolio_id": "...",
  "slug": "john-doe-29fa2b",
  "status": "completed",
  "generation_started_at": "2024-02-09T12:00:00Z",
  "generation_completed_at": "2024-02-09T12:00:12Z",
  "error_message": null
}
```

**Status Values:**
- `draft` - Portfolio created but not generated
- `generating` - Generation in progress
- `completed` - Successfully generated
- `error` - Generation failed

---

### 5. Edit Portfolio (Manual)

```bash
PATCH /portfolio/{slug}
```

**Request:**
```json
{
  "updates": {
    "professional_summary": "Updated summary text...",
    "key_strengths": ["New strength 1", "New strength 2"]
  },
  "changes_summary": "Updated summary and strengths"
}
```

**Response:**
```json
{
  "message": "Portfolio updated successfully",
  "slug": "john-doe-29fa2b",
  "version_created": true,
  "updated_portfolio": { ... }
}
```

---

### 6. Refine Portfolio (AI-Assisted)

```bash
POST /portfolio/{slug}/refine
```

**Request:**
```json
{
  "instruction": "Make the professional summary more concise and emphasize backend skills",
  "sections": ["all"]
}
```

**Response:**
```json
{
  "message": "Portfolio refined successfully",
  "version_id": "550e8400-e29b-41d4-a716-446655440001",
  "version_number": 2,
  "version_state": "draft",
  "changes_summary": "AI refinement: Make the professional summary more concise...",
  "portfolio_json": { ... }
}
```

**Notes:**
- Creates a new **draft** version
- Refinement applies to the entire portfolio based on instruction
- Must confirm the draft to make it the committed version

---

### 6a. Confirm Portfolio (Commit Draft)

```bash
POST /portfolio/{slug}/confirm
```

**Response:**
```json
{
  "message": "Portfolio confirmed successfully",
  "version_id": "550e8400-e29b-41d4-a716-446655440001",
  "version_number": 2,
  "version_state": "committed"
}
```

**Notes:**
- Commits the current draft version
- Deletes all other versions (only one committed version remains)
- Cannot be undone

---

### 6b. Revert Portfolio

```bash
POST /portfolio/{slug}/revert
```

**Request:**
```json
{
  "version_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Response:**
```json
{
  "message": "Portfolio reverted successfully",
  "version_id": "550e8400-e29b-41d4-a716-446655440000",
  "version_number": 1,
  "version_state": "committed"
}
```

**Notes:**
- Reverts to the specified version
- Deletes all other versions
- Cannot be undone

---

### 7. View Version History

```bash
GET /portfolio/{slug}/versions?limit=50
```

**Response:**
```json
{
  "versions": [
    {
      "id": "version-id-2",
      "version_number": 2,
      "version_state": "draft",
      "changes_summary": "AI refinement: Make it more concise",
      "created_at": "2024-02-09T14:30:00Z",
      "created_by": "ai_refinement"
    },
    {
      "id": "version-id-1",
      "version_number": 1,
      "version_state": "committed",
      "changes_summary": "Initial AI-generated portfolio",
      "created_at": "2024-02-09T12:00:00Z",
      "created_by": "ai"
    }
  ],
  "total_count": 2
}
```

**Version States:**
- `draft` - Unconfirmed refinement
- `committed` - Confirmed version

---

### 8. Get Specific Version Content

```bash
GET /portfolio/{slug}/versions/{version_id}
```

**Response:**
```json
{
  "id": "version-id-1",
  "version_number": 1,
  "version_state": "committed",
  "changes_summary": "Initial AI-generated portfolio",
  "created_at": "2024-02-09T12:00:00Z",
  "created_by": "ai",
  "portfolio_json": {
    "personal_info": { ... },
    "ai_generated_content": { ... },
    "data_sources": { ... }
  }
}
```

---

## Data Extraction Endpoints

### Upload LinkedIn Profile

```bash
POST /upload/linkedin
```

**Request:**
```bash
curl -X POST "http://localhost:8000/upload/linkedin" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@linkedin.pdf"
```

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

### Upload Resume

```bash
POST /upload/resume
```

**Request:**
```bash
curl -X POST "http://localhost:8000/upload/resume" \
  -F "file=@resume.pdf"
```

**Response:**
```json
{
  "resume_text": "full extracted text..."
}
```

---

### Get Codeforces Statistics

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

### Analyze GitHub Repositories

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

---

### Get LeetCode Statistics

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

## Testing

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Server

```bash
uvicorn app.main:app --reload
```

### Test Portfolio Generation (All Sources)

```bash
curl -X POST "http://localhost:8000/portfolio/generate" \
  -F "name=John Doe" \
  -F "portfolio_focus=fullstack" \
  -F "linkedin_file=@test_data/linkedin.pdf" \
  -F "resume_file=@test_data/resume.pdf" \
  -F 'github_repos=["https://github.com/octocat/Hello-World"]' \
  -F "codeforces_username=tourist" \
  -F "leetcode_username=lee215"
```

### Test Portfolio Retrieval

```bash
# Get public portfolio
curl -X GET "http://localhost:8000/portfolio/john-doe-29fa2b"

# Get private coaching
curl -X GET "http://localhost:8000/portfolio/john-doe-29fa2b/coaching"

# Check status
curl -X GET "http://localhost:8000/portfolio/john-doe-29fa2b/status"
```

### Test Portfolio Editing

```bash
# Manual edit
curl -X PATCH "http://localhost:8000/portfolio/john-doe-29fa2b" \
  -H "Content-Type: application/json" \
  -d '{"updates": {"professional_summary": "Updated text"}, "changes_summary": "Manual edit"}'

# AI refinement
curl -X POST "http://localhost:8000/portfolio/john-doe-29fa2b/refine" \
  -H "Content-Type: application/json" \
  -d '{"section": "professional_summary", "instruction": "make it more concise"}'
```

---

## Architecture Principles

### Ethical AI Usage

- AI receives ONLY: metadata, README text, statistics
- AI NEVER receives: source code, file contents (except README), code snippets
- All inputs are sanitized in `prepare_ai_context()`

### Language-Agnostic Analysis

- Code quality based on structure, not semantics
- Works for any programming language
- Heuristic-based scoring (complexity, documentation, best practices)

### Separation of Concerns

- **Public Portfolio**: Recruiter-facing, polished content
- **Private Coaching**: User-only, honest feedback and improvement suggestions

### Graceful Degradation

- Missing data sources handled gracefully
- External API failures don't break generation
- AI failures fall back to template-based content

---

## Tech Stack

### Backend

- **FastAPI** (0.115.6) - Modern async web framework
- **Uvicorn** (0.34.0) - ASGI server
- **Pydantic** - Data validation and serialization
- **SQLAlchemy** (2.0.36+) - Async ORM
- **Alembic** (1.13.1) - Database migrations
- **aiosqlite** (0.19.0) - Async SQLite driver

### Frontend

- **React** (18.2.0) - UI library
- **React Router** (6.20.0) - Client-side routing
- **Vite** (5.0.0) - Build tool and dev server
- **Axios** (1.6.0) - HTTP client

### AI & External Services

- **Google Gemini** (google-generativeai 0.7.2) - AI content generation
- **httpx** (0.28.1) - Async HTTP client for external APIs

### File Processing

- **pdfplumber** (0.11.4) - PDF text extraction
- **python-docx** (1.1.2) - DOCX text extraction

### Utilities

- **python-dotenv** (1.0.1) - Environment variable management
- **Jinja2** (3.1.3) - Template engine

---

## Deployment

### Development

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Production

```bash
# Update DATABASE_URL to PostgreSQL
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/portfolio

# Run migrations
alembic upgrade head

# Start with multiple workers
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Database Schema

### Portfolios Table

```sql
- id: UUID (PK)
- slug: String (unique, indexed)
- name: String
- portfolio_focus: String (enum)
- status: String (enum: draft, generating, completed, error)

-- Data source flags
- has_linkedin, has_resume, has_github, has_codeforces, has_leetcode: Boolean

-- Raw input data (JSON)
- linkedin_data, resume_text, github_data, codeforces_data, leetcode_data

-- Generated output (JSON)
- public_portfolio_json, private_coaching_json, ai_generation_metadata

-- Timestamps
- generation_started_at, generation_completed_at, created_at, updated_at
```

### Portfolio Versions Table

```sql
- id: UUID (PK)
- portfolio_id: UUID (FK)
- version_number: Integer
- version_state: String (enum: draft, committed)
- public_portfolio_json, private_coaching_json: JSON
- changes_summary: Text
- created_by: String (enum: ai, user_manual, ai_refinement)
- created_at: DateTime
```

---

## Error Handling

### 400 Bad Request

- Invalid file type
- File too large (>5MB)
- Empty file
- Invalid GitHub URLs
- Missing required fields

### 404 Not Found

- Portfolio not found
- Version not found

### 202 Accepted

- Portfolio still generating (check status endpoint)

### 500 Internal Server Error

- AI generation failure (falls back to templates)
- External API failure (continues with available data)
- Database errors

---

## Performance

### Free Tier Limits

**Gemini API (Free Tier):**
- 15 requests per minute
- 1M tokens per minute
- 1500 requests per day

**GitHub API (Authenticated):**
- 5000 requests per hour

**Codeforces & LeetCode:**
- Public APIs, no authentication required

---

## Hackathon Features

- Ethical data usage (no scraping)
- Language-agnostic code analysis
- AI used strategically (not for code review)
- Free-tier friendly (Gemini, GitHub, public APIs)
- Deterministic demo (sample data support)
- Single deployment (dynamic portfolio routes)
- Version control for edits
- Public/private data separation

---

## Security Notes

- **CORS**: Currently allows all origins (`*`) - update for production
- **Authentication**: Not implemented for private coaching endpoint - add JWT for production
- **API Keys**: Stored in `.env` file - use secrets manager for production
- **Rate Limiting**: Relies on external API limits - add middleware for production

---

## License

Built for hackathon use.

---

## Acknowledgments

- **FastAPI** - Excellent async framework
- **Google Gemini** - Free-tier AI API
- **GitHub, Codeforces, LeetCode** - Public APIs
