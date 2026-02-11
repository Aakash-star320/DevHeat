# SmartFolio - AI-Powered Portfolio Generator

> Transform your professional data into stunning portfolios with personalized coaching insights

A full-stack application that generates professional portfolios by aggregating data from multiple sources including LinkedIn, resumes, GitHub repositories, Codeforces, and LeetCode profiles. Leverages AI to create polished content while maintaining ethical data usage practices.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [User Workflow](#user-workflow)
- [API Documentation](#api-documentation)
- [Frontend Pages](#frontend-pages)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Security Notes](#security-notes)

---

## Features

### Portfolio Generation
- **AI Content Generation** - Professional summaries, project highlights, and skill assessments using Google Gemini
- **Multi-Source Aggregation** - Combines LinkedIn, Resume, GitHub, Codeforces, and LeetCode data
- **Code Quality Analysis** - Analyzes GitHub repositories for complexity, documentation, and best practices
- **Public/Private Output** - Public portfolio JSON + private coaching insights

### AI-Powered Refinement
- **Intelligent Refinement** - AI-assisted portfolio editing with natural language instructions
- **Version Management** - Track all changes with draft/committed states
- **Confirm/Revert Workflow** - Review changes before committing
- **Version History** - Complete audit trail of all modifications

### Personalized Insights
- **AI-Powered Feedback** - Skill analysis, learning paths, and career guidance
- **Interview Preparation** - Likely questions and key talking points
- **Market Positioning** - Target roles, competitive advantages, and resume improvements
- **Auto-Loading** - Insights load automatically, no manual action required
- **Beautiful UI** - Color-coded sections with intuitive navigation

### Modern Frontend
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations** - Framer Motion animations and Lenis smooth scrolling
- **Dynamic Loading** - Rotating messages with time estimates during generation
- **Interactive UI** - Easy-to-use forms with real-time validation

---

## Tech Stack

### Backend
- **FastAPI** (0.115.6) - Modern async web framework
- **Uvicorn** (0.34.0) - ASGI server
- **SQLAlchemy** (2.0.36+) - Async ORM with PostgreSQL/SQLite support
- **Alembic** (1.13.1) - Database migrations
- **Pydantic** - Data validation and serialization
- **Google Gemini** (0.7.2) - AI content generation
- **httpx** (0.28.1) - Async HTTP client
- **pdfplumber** (0.11.4) - PDF text extraction
- **python-docx** (1.1.2) - DOCX text extraction

### Frontend
- **React** (19.1.1) - UI library with latest features
- **Vite** (7.1.7) - Lightning-fast build tool and dev server
- **React Router DOM** (7.9.3) - Client-side routing
- **Tailwind CSS** (4.1.14) - Utility-first CSS framework
- **Framer Motion** (12.23.22) - Production-ready animation library
- **Lenis** (1.3.11) - Smooth scrolling library
- **Axios** (1.13.5) - HTTP client for API calls
- **Lucide React** (0.545.0) - Beautiful icon library

### External Services
- **GitHub API** - Repository metadata and analysis
- **Codeforces API** - Competitive programming statistics
- **LeetCode GraphQL** - Problem-solving statistics

---

## Project Structure

```
DevHeat/
├── app/                                     # Backend application
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
│
├── frontend/                                # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── navbar.jsx                   # Navigation bar with SmartFolio branding
│   │   │   ├── footer.jsx                   # Footer with links and newsletter
│   │   │   └── lenis-scroll.jsx             # Smooth scroll wrapper
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx              # Home page with features showcase
│   │   │   ├── GeneratePortfolio.jsx        # Portfolio generation form
│   │   │   ├── RefinePortfolio.jsx          # Refinement UI with coaching tab
│   │   │   └── ViewPortfolio.jsx            # Public portfolio display
│   │   ├── services/
│   │   │   ├── api.js                       # Axios instance configuration
│   │   │   └── portfolioService.js          # API methods for portfolio operations
│   │   ├── App.jsx                          # Main app with routing
│   │   └── main.jsx                         # Entry point
│   ├── public/
│   │   └── favicon.png                      # Favicon
│   ├── index.html                           # HTML template
│   ├── package.json                         # Frontend dependencies
│   ├── vite.config.js                       # Vite configuration
│   └── tailwind.config.js                   # Tailwind CSS configuration
│
├── alembic/                                 # Database migrations
│   ├── versions/
│   │   └── 001_initial_schema.py
│   ├── env.py
│   └── script.py.mako
│
├── .env                                     # Environment variables (create this)
├── .gitignore                               # Git ignore patterns
├── alembic.ini                              # Alembic configuration
├── requirements.txt                         # Python dependencies
├── portfolio.db                             # SQLite database (auto-created)
└── README.md                                # This file
```

---

## Setup Instructions

### Prerequisites
- **Python** 3.8+
- **Node.js** 18+ and npm
- **Git**
- **GitHub Personal Access Token**
- **Google Gemini API Key**

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/DevHeat.git
cd DevHeat
```

### 2. Backend Setup

#### 2.1 Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

#### 2.2 Install Backend Dependencies

```bash
pip install -r requirements.txt
```

#### 2.3 Configure Environment Variables

Create a `.env` file in the project root:

```env
# GitHub API Token (for repository analysis)
GITHUB_TOKEN=your_github_personal_access_token_here

# Google Gemini API Key (for AI content generation)
GEMINI_API_KEY=your_gemini_api_key_here

# Database URL (SQLite for development, PostgreSQL for production)
DATABASE_URL=sqlite+aiosqlite:///./portfolio.db

# Optional: Override default host/port
# HOST=0.0.0.0
# PORT=8000
```

**To get a GitHub token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select `public_repo` scope
4. Copy and paste into `.env`

**To get a Gemini API key:**
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API key"
3. Copy and paste into `.env`

#### 2.4 Run Database Migrations

```bash
alembic upgrade head
```

#### 2.5 Start Backend Server

```bash
uvicorn app.main:app --reload
```

Backend will be available at: **http://localhost:8000**

### 3. Frontend Setup

#### 3.1 Navigate to Frontend Directory

```bash
cd frontend
```

#### 3.2 Install Frontend Dependencies

```bash
npm install
```

#### 3.3 Configure Frontend Environment (Optional)

Create `frontend/.env` file if you need to override the API URL:

```env
VITE_API_URL=http://localhost:8000
```

#### 3.4 Start Frontend Development Server

```bash
npm run dev
```

Frontend will be available at: **http://localhost:5173** (or the port Vite assigns)

### 4. Access the Application

- **Frontend**: http://localhost:5173
- **API Documentation**: http://localhost:8000/docs
- **API ReDoc**: http://localhost:8000/redoc

---

## User Workflow

### 1. Landing Page
- Visit the home page to learn about SmartFolio
- Click "Generate Portfolio" to start

### 2. Generate Portfolio
- Fill in your basic information (name, portfolio focus)
- Upload documents (LinkedIn PDF, Resume)
- Add GitHub repository URLs (up to 5)
- Enter competitive programming usernames (Codeforces, LeetCode)
- Click "Generate Portfolio with AI"
- Watch dynamic loading messages (30-60 seconds)

### 3. Refine Portfolio
- View your AI-generated portfolio content
- Switch to "Personalized Insights" tab to see AI-powered feedback:
  - Skill Analysis (Strengths & Gaps)
  - Learning Path (Immediate, Short-term, Long-term goals)
  - Interview Preparation (Questions & Talking Points)
  - Market Positioning (Target Roles & Competitive Advantages)
- Use AI refinement to improve specific sections
- Confirm current version to save changes
- View version history and revert if needed

### 4. View Public Portfolio
- Click "View Public Portfolio" to see the final result
- Share the portfolio URL with recruiters
- All data is beautifully presented with:
  - Professional summary
  - Work experience
  - Projects with technologies and highlights
  - Skills and achievements
  - GitHub projects
  - Competitive programming stats
  - Contact information

---

## API Documentation

### Base URL
```
http://localhost:8000
```

### Authentication
Currently no authentication required for public endpoints. Private coaching endpoint should be secured in production.

### Health Check

```bash
GET /
GET /health
```

Returns API status and version information.

---

### Portfolio Generation

#### Generate Portfolio

```bash
POST /portfolio/generate
```

**Request (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Full name |
| portfolio_focus | string | No | Focus area: `general`, `fullstack`, `backend`, `ml`, `competitive` |
| linkedin_file | file | No | LinkedIn PDF export |
| resume_file | file | No | Resume PDF/DOCX |
| github_repos | JSON array | No | GitHub repository URLs (max 5) |
| codeforces_username | string | No | Codeforces handle |
| leetcode_username | string | No | LeetCode username |

**Example:**

```bash
curl -X POST "http://localhost:8000/portfolio/generate" \
  -F "name=John Doe" \
  -F "portfolio_focus=fullstack" \
  -F "linkedin_file=@linkedin.pdf" \
  -F "resume_file=@resume.pdf" \
  -F 'github_repos=["https://github.com/user/repo1"]' \
  -F "codeforces_username=tourist" \
  -F "leetcode_username=johndoe"
```

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

#### Get Portfolio

```bash
GET /portfolio/{slug}
```

Returns complete public portfolio JSON.

**Response Structure:**

```json
{
  "personal_info": {
    "name": "John Doe",
    "slug": "john-doe-29fa2b",
    "portfolio_focus": "fullstack"
  },
  "ai_generated_content": {
    "professional_summary": "...",
    "key_strengths": ["..."],
    "project_highlights": [...],
    "skills": ["..."],
    "work_experience": [...],
    "achievements": ["..."],
    "skills_summary": {
      "languages": ["..."],
      "frameworks": ["..."],
      "tools": ["..."]
    },
    "contact_info": {
      "email": "...",
      "linkedin": "...",
      "github": "..."
    }
  },
  "data_sources": {
    "github_projects": [...],
    "competitive_programming": {
      "codeforces": {...},
      "leetcode": {...}
    }
  },
  "code_quality_metrics": {...},
  "metadata": {
    "generated_at": "2024-02-09T12:00:00Z",
    "data_sources_used": ["resume", "github", "leetcode"]
  }
}
```

---

#### Get Personalized Insights

```bash
GET /portfolio/{slug}/coaching
```

Returns personalized insights with AI-powered career guidance.

**Response Structure:**

```json
{
  "skill_analysis": {
    "strengths": [
      "Strong full-stack development experience",
      "Excellent problem-solving skills"
    ],
    "gaps": [
      "Limited experience with distributed systems",
      "Could improve system design knowledge"
    ]
  },
  "learning_path": {
    "immediate": ["Complete Docker tutorial", "Practice SQL optimization"],
    "short_term": ["Build microservices project", "Study system design"],
    "long_term": ["Master cloud architecture", "Lead technical projects"]
  },
  "interview_prep": {
    "likely_questions": [
      "Explain your approach to building scalable systems",
      "Describe a challenging bug you solved"
    ],
    "talking_points": [
      "Highlight full-stack project experience",
      "Emphasize problem-solving methodology"
    ]
  },
  "market_positioning": {
    "target_roles": ["Senior Full-Stack Engineer", "Backend Engineer"],
    "competitive_advantages": ["Strong algorithmic skills", "Full-stack expertise"],
    "resume_improvements": ["Quantify project impact", "Add system design projects"]
  }
}
```

---

#### Check Status

```bash
GET /portfolio/{slug}/status
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

### Portfolio Refinement

#### Refine Portfolio

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
  "version_id": "...",
  "version_number": 2,
  "version_state": "draft",
  "changes_summary": "AI refinement: Make the professional summary...",
  "portfolio_json": {...}
}
```

---

#### Confirm Draft

```bash
POST /portfolio/{slug}/confirm
```

Commits the current draft version and deletes other versions.

---

#### Revert to Version

```bash
POST /portfolio/{slug}/revert
```

**Request:**

```json
{
  "version_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

#### Get Version History

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
    }
  ],
  "total_count": 2
}
```

---

### Data Extraction Endpoints

#### Upload LinkedIn Profile

```bash
POST /upload/linkedin
```

Extracts structured sections from LinkedIn PDF export.

---

#### Upload Resume

```bash
POST /upload/resume
```

Extracts raw text from resume PDF/DOCX.

---

#### Get Codeforces Stats

```bash
GET /codeforces/{username}
```

Returns competitive programming statistics.

---

#### Analyze GitHub Repositories

```bash
POST /github/analyze
```

**Request:**

```json
{
  "repos": [
    "https://github.com/user/repo1",
    "https://github.com/user/repo2"
  ]
}
```

Returns repository metadata, structure analysis, and quality metrics.

---

#### Get LeetCode Stats

```bash
GET /leetcode/{username}
```

Returns problem-solving statistics via GraphQL.

---

## Frontend Pages

### 1. Landing Page (`/`)
- Hero section with gradient background
- Features showcase
- Testimonials
- Call-to-action buttons

### 2. Generate Portfolio (`/generate`)
- Multi-section form with animations
- Dynamic loading states
- Time estimates (30-60 seconds)
- Rotating messages during generation:
  - "Analyzing your professional profile..."
  - "Fetching GitHub repositories..."
  - "Generating AI-powered insights..."
  - And more!

### 3. Refine Portfolio (`/refine/:slug`)
- Two-tab interface: Portfolio | Personalized Insights
- Portfolio tab:
  - Professional summary
  - Key strengths
  - Project highlights
  - Skills
- Personalized Insights tab (auto-loads):
  - Skill Analysis - Strengths (Green) & Gaps (Yellow)
  - Learning Path (Blue) - Immediate, Short-term, Long-term
  - Interview Prep (Purple) - Questions & Talking Points
  - Market Positioning (Indigo) - Roles & Advantages
- AI refinement controls
- Version management (clean UI without internal states)
- Confirm current version / Revert actions

### 4. View Portfolio (`/portfolio/:slug`)
- Beautiful public portfolio display
- Responsive grid layout
- Sections:
  - Professional Summary
  - Work Experience
  - Featured Projects
  - Achievements
  - Skills & Technologies
  - GitHub Projects
  - Competitive Programming Stats
  - Contact Information

---

## Architecture

### Backend Architecture

#### Ethical AI Usage
- AI receives ONLY: metadata, README text, statistics
- AI NEVER receives: source code, file contents (except README), code snippets
- All inputs are sanitized in `prepare_ai_context()`

#### Language-Agnostic Analysis
- Code quality based on structure, not semantics
- Works for any programming language
- Heuristic-based scoring (complexity, documentation, best practices)

#### Separation of Concerns
- **Public Portfolio**: Recruiter-facing, polished content
- **Private Coaching**: User-only, honest feedback and improvement suggestions

#### Graceful Degradation
- Missing data sources handled gracefully
- External API failures don't break generation
- AI failures fall back to template-based content

### Frontend Architecture

#### Component Structure
- **Navbar**: Sticky navigation with smooth animations
- **Footer**: Links, newsletter subscription, copyright
- **LenisScroll**: Smooth scrolling wrapper
- **Pages**: Separate components for each route

#### State Management
- React hooks (useState, useEffect)
- Local state for form data
- API calls via Axios

#### Routing
- React Router DOM v7
- Client-side navigation
- Dynamic routes for portfolio slugs

#### Styling
- Tailwind CSS utility classes
- Custom color schemes
- Responsive breakpoints
- Dark theme by default

#### Animations
- Framer Motion for page transitions
- Spring animations for buttons
- Smooth scroll with Lenis

---

## Database Schema

### Portfolios Table

```sql
CREATE TABLE portfolios (
  id UUID PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  portfolio_focus VARCHAR(50),
  status VARCHAR(20) NOT NULL,

  -- Data source flags
  has_linkedin BOOLEAN DEFAULT FALSE,
  has_resume BOOLEAN DEFAULT FALSE,
  has_github BOOLEAN DEFAULT FALSE,
  has_codeforces BOOLEAN DEFAULT FALSE,
  has_leetcode BOOLEAN DEFAULT FALSE,

  -- Raw input data (JSON)
  linkedin_data JSONB,
  resume_text TEXT,
  github_data JSONB,
  codeforces_data JSONB,
  leetcode_data JSONB,

  -- Generated output (JSON)
  public_portfolio_json JSONB,
  private_coaching_json JSONB,
  ai_generation_metadata JSONB,

  -- Timestamps
  generation_started_at TIMESTAMP,
  generation_completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portfolios_slug ON portfolios(slug);
CREATE INDEX idx_portfolios_status ON portfolios(status);
```

### Portfolio Versions Table

```sql
CREATE TABLE portfolio_versions (
  id UUID PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  version_state VARCHAR(20) NOT NULL,
  public_portfolio_json JSONB NOT NULL,
  private_coaching_json JSONB,
  changes_summary TEXT,
  created_by VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(portfolio_id, version_number)
);

CREATE INDEX idx_versions_portfolio_id ON portfolio_versions(portfolio_id);
CREATE INDEX idx_versions_state ON portfolio_versions(version_state);
```

---

## Deployment

### Development

**Backend:**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Production

#### Backend Deployment

```bash
# Update DATABASE_URL to PostgreSQL
export DATABASE_URL=postgresql+asyncpg://user:pass@localhost/portfolio

# Run migrations
alembic upgrade head

# Start with multiple workers
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

#### Frontend Deployment

```bash
cd frontend

# Build for production
npm run build

# Deploy dist/ folder to hosting service (Vercel, Netlify, etc.)
```

#### Environment Variables for Production

**Backend (.env):**
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
GITHUB_TOKEN=your_token
GEMINI_API_KEY=your_key
CORS_ORIGINS=https://yourdomain.com
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://api.yourdomain.com
```

---

## Security Notes

### Current Limitations (Development)
- **CORS**: Allows all origins (`*`) - restrict for production
- **Authentication**: Not implemented - add JWT/OAuth for production
- **API Keys**: Stored in `.env` file - use secrets manager for production
- **Rate Limiting**: Relies on external API limits - add middleware for production
- **Input Validation**: Basic validation - enhance for production

### Production Recommendations
1. **Add Authentication**: JWT tokens for private coaching endpoint
2. **Configure CORS**: Whitelist specific domains
3. **Add Rate Limiting**: Prevent abuse
4. **Use HTTPS**: Enable SSL/TLS
5. **Secrets Management**: Use AWS Secrets Manager, Azure Key Vault, etc.
6. **Input Sanitization**: Add comprehensive validation
7. **Error Handling**: Don't expose internal errors to clients
8. **Logging**: Add structured logging with sensitive data redaction

---

## Performance

### API Rate Limits

**Gemini API (Free Tier):**
- 15 requests per minute
- 1M tokens per minute
- 1500 requests per day

**GitHub API (Authenticated):**
- 5000 requests per hour

**Codeforces & LeetCode:**
- Public APIs, no authentication required
- Best effort rate limiting

### Optimization Tips
- Use caching for external API responses
- Implement request queuing for AI generation
- Add database indexes for frequently queried fields
- Use CDN for frontend assets
- Enable gzip compression
- Implement lazy loading for images

---

## Contributing

This project was built for a hackathon. If you'd like to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Troubleshooting

### Backend Issues

**Database Migration Errors:**
```bash
# Reset database
alembic downgrade base
alembic upgrade head
```

**Port Already in Use:**
```bash
# Change port
uvicorn app.main:app --port 8001
```

**API Key Errors:**
- Verify `.env` file exists in project root
- Check API key validity
- Ensure no extra spaces in `.env` file

### Frontend Issues

**Build Errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API Connection Issues:**
- Check `VITE_API_URL` in frontend/.env
- Verify backend is running
- Check CORS configuration

**Styling Issues:**
```bash
# Rebuild Tailwind CSS
npm run build
```

---

## License

Built for hackathon use. Feel free to use and modify as needed.

---

## Acknowledgments

- **FastAPI** - Excellent async web framework
- **React** - Powerful UI library
- **Google Gemini** - Free-tier AI API
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Beautiful animations
- **GitHub, Codeforces, LeetCode** - Public APIs for data aggregation
- **PrebuiltUI** - Original Agentix template design inspiration

---

## Contact

For questions or support, please open an issue on GitHub.

---

**Built with** ❤️ **for developers, by developers**
