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

### Authentication & User Management
- **GitHub OAuth Integration** - Secure sign-in with GitHub account
- **User Profiles** - Persistent user data with avatar and email
- **Session Management** - JWT-based authentication with secure token handling
- **My Portfolios** - Dashboard to view and manage all your portfolios

### Portfolio Generation
- **AI Content Generation** - Professional summaries, project highlights, and skill assessments using Google Gemini
- **Multi-Source Aggregation** - Combines LinkedIn, Resume, GitHub, Codeforces, and LeetCode data
- **Code Quality Analysis** - Analyzes GitHub repositories for complexity, documentation, and best practices
- **Public/Private Output** - Public portfolio JSON + private coaching insights
- **User-Linked Portfolios** - All portfolios are tied to your GitHub account

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
- **Context-Based State Management** - React Context for global authentication state

---

## Tech Stack

### Backend
- **FastAPI** (0.115.6) - Modern async web framework
- **Uvicorn** (0.34.0) - ASGI server
- **SQLAlchemy** (2.0.36+) - Async ORM with PostgreSQL/SQLite support
- **Alembic** (1.13.1) - Database migrations
- **Pydantic** - Data validation and serialization
- **PyJWT** - JSON Web Token implementation for authentication
- **python-jose** - JWT token creation and verification
- **Google Gemini** (0.7.2) - AI content generation
- **httpx** (0.28.1) - Async HTTP client (GitHub OAuth & API calls)
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
- **GitHub OAuth** - User authentication via OAuth 2.0
- **GitHub API** - Repository metadata and analysis
- **Codeforces API** - Competitive programming statistics
- **LeetCode GraphQL** - Problem-solving statistics
- **Google Gemini AI** - Content generation and refinement

---

## Project Structure

```
DevHeat/
├── app/                                     # Backend application
│   ├── main.py                              # FastAPI app with lifecycle events
│   ├── config.py                            # Configuration (API keys, constants)
│   ├── database.py                          # Database session management
│   ├── routers/
│   │   ├── auth_router.py                   # GitHub OAuth authentication
│   │   ├── linkedin_router.py               # LinkedIn profile upload
│   │   ├── resume_router.py                 # Resume upload
│   │   ├── codeforces_router.py             # Codeforces API integration
│   │   ├── github_router.py                 # GitHub analyzer
│   │   ├── leetcode_router.py               # LeetCode GraphQL stats
│   │   ├── portfolio_router.py              # Slug generation
│   │   ├── portfolio_generation_router.py   # Main orchestrator
│   │   ├── portfolio_retrieval_router.py    # GET endpoints
│   │   ├── portfolio_editing_router.py      # PATCH/POST endpoints
│   │   └── portfolio_refinement_router.py   # AI refinement endpoints
│   ├── services/
│   │   ├── github_service.py                # GitHub API logic
│   │   ├── leetcode_service.py              # LeetCode GraphQL logic
│   │   ├── ai_service.py                    # Gemini API integration
│   │   ├── ai_refinement_service.py         # AI-powered portfolio refinement
│   │   ├── code_quality_service.py          # Heuristic analysis
│   │   └── portfolio_builder_service.py     # JSON construction
│   ├── models/
│   │   ├── responses.py                     # Pydantic response models
│   │   ├── database.py                      # SQLAlchemy ORM models (User, Portfolio, PortfolioVersion)
│   │   ├── schemas.py                       # DB Pydantic schemas
│   │   └── portfolio_schemas.py             # Portfolio request/response
│   └── utils/
│       ├── auth.py                          # JWT token creation and verification
│       ├── validators.py                    # File validation
│       ├── file_parser.py                   # Text extraction
│       └── slug.py                          # Slug generation
│
├── frontend/                                # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── navbar.jsx                   # Navigation with GitHub auth & user menu
│   │   │   ├── footer.jsx                   # Footer with links and newsletter
│   │   │   ├── lenis-scroll.jsx             # Smooth scroll wrapper
│   │   │   ├── section-title.jsx            # Reusable section titles
│   │   │   └── tilt-image.jsx               # 3D tilt effect for images
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx              # Home page with features showcase
│   │   │   ├── AuthCallback.jsx             # GitHub OAuth callback handler
│   │   │   ├── GeneratePortfolio.jsx        # Portfolio generation form
│   │   │   ├── MyPortfolios.jsx             # User's portfolio dashboard
│   │   │   ├── RefinePortfolio.jsx          # Refinement UI with coaching tab
│   │   │   └── ViewPortfolio.jsx            # Public portfolio display
│   │   ├── context/
│   │   │   └── AuthContext.jsx              # Global authentication state management
│   │   ├── hooks/
│   │   │   └── useAuth.js                   # Custom hook for accessing auth context
│   │   ├── services/
│   │   │   ├── api.js                       # Axios instance with auth interceptors
│   │   │   ├── authService.js               # Authentication API methods
│   │   │   └── portfolioService.js          # Portfolio API methods
│   │   ├── sections/
│   │   │   ├── hero-section.jsx             # Landing page hero
│   │   │   ├── about-our-apps.jsx           # Features showcase
│   │   │   ├── get-in-touch.jsx             # Contact section
│   │   │   ├── our-latest-creation.jsx      # Portfolio examples
│   │   │   ├── our-testimonials.jsx         # User testimonials
│   │   │   ├── subscribe-newsletter.jsx     # Newsletter signup
│   │   │   └── trusted-companies.jsx        # Company logos
│   │   ├── App.jsx                          # Main app with routing & AuthProvider
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
- **GitHub Account** (for OAuth authentication)
- **GitHub OAuth App** (create at https://github.com/settings/developers)
- **GitHub Personal Access Token** (optional, for repository analysis)
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
# GitHub OAuth (required for "Sign in with GitHub")
# Development (local testing)
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_REDIRECT_URI=http://localhost:8000/auth/callback
FRONTEND_URL=http://localhost:5173

# Production (fill when you deploy)
# PROD_GITHUB_CLIENT_ID=your_prod_client_id
# PROD_GITHUB_CLIENT_SECRET=your_prod_client_secret
# PROD_GITHUB_REDIRECT_URI=https://<your-backend-domain>/auth/callback
# PROD_FRONTEND_URL=https://<your-frontend-domain>

# GitHub API Token (for repository analysis - optional but recommended)
GITHUB_TOKEN=your_github_personal_access_token_here

# Google Gemini API Key (for AI content generation)
GEMINI_API_KEY=your_gemini_api_key_here

# Database URL (SQLite for development, PostgreSQL for production)
DATABASE_URL=sqlite+aiosqlite:///./portfolio.db
# For PostgreSQL: postgresql+psycopg://user:password@host/dbname

# JWT secret for issuing session tokens (change in production!)
JWT_SECRET=change-me-in-production-use-random-string

# Optional: Override default host/port
# HOST=0.0.0.0
# PORT=8000
```

**To set up GitHub OAuth:**
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: SmartFolio (or your app name)
   - **Homepage URL**: `http://localhost:5173` (dev) or your domain (prod)
   - **Authorization callback URL**: `http://localhost:8000/auth/callback` (dev) or `https://your-backend.com/auth/callback` (prod)
4. Click "Register application"
5. Copy **Client ID** and generate a **Client secret**
6. Paste both into your `.env` file

**To get a GitHub API token (for repo analysis):**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `public_repo`, `read:user`, `user:email`
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

#### 3.3 Configure Frontend Environment

Create `frontend/.env` file with the backend API URL:

```env
VITE_API_URL=http://localhost:8000
```

**Note**: This is required for the frontend to communicate with the backend API. The default value points to `http://localhost:8000` for development.

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
- Browse features, testimonials, and examples
- Click "Sign in with GitHub" in the navbar (required for portfolio generation)

### 2. GitHub Authentication
- Click "Sign in with GitHub" button
- Authorize SmartFolio to access your GitHub profile
- Get redirected back to the app with your account created
- Your avatar and username appear in the navbar

### 3. Generate Portfolio
- Click "Generate Portfolio" button (navbar or hero section)
- Fill in your basic information (name, portfolio focus)
- Upload documents (LinkedIn PDF, Resume)
- Add GitHub repository URLs (up to 5)
- Enter competitive programming usernames (Codeforces, LeetCode)
- Click "Generate Portfolio with AI"
- Watch dynamic loading messages (30-60 seconds)

### 4. Refine Portfolio
- View your AI-generated portfolio content
- Switch to "Personalized Insights" tab to see AI-powered feedback:
  - Skill Analysis (Strengths & Gaps)
  - Learning Path (Immediate, Short-term, Long-term goals)
  - Interview Preparation (Questions & Talking Points)
  - Market Positioning (Target Roles & Competitive Advantages)
- Use AI refinement to improve specific sections
- Confirm current version to save changes
- View version history and revert if needed

### 5. My Portfolios Dashboard
- Access "My Portfolios" from the user menu (top right avatar)
- View all portfolios you've created
- Quick links to refine or view each portfolio
- Track creation dates and portfolio slugs

### 6. View Public Portfolio
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

SmartFolio uses **GitHub OAuth** for user authentication and **JWT tokens** for API authorization.

#### Login with GitHub

```bash
GET /auth/login
```

Redirects to GitHub OAuth authorization page. After user authorizes, GitHub redirects to `/auth/callback`.

#### OAuth Callback

```bash
GET /auth/callback?code={authorization_code}
```

Handles GitHub OAuth callback:
1. Exchanges authorization code for GitHub access token
2. Fetches user info from GitHub API
3. Creates or updates user in database
4. Generates JWT token
5. Redirects to frontend with token: `{FRONTEND_URL}/auth/callback?token={jwt_token}`

#### Get Current User

```bash
GET /auth/me
Authorization: Bearer {jwt_token}
```

Returns authenticated user information.

**Response:**
```json
{
  "id": "user-uuid",
  "username": "octocat",
  "email": "octocat@github.com",
  "avatar_url": "https://avatars.githubusercontent.com/u/123456"
}
```

**Protected Routes:**
- `POST /portfolio/generate` - Requires authentication
- `GET /portfolio/{slug}/coaching` - Requires authentication
- `POST /portfolio/{slug}/refine` - Requires authentication
- All other portfolio management endpoints

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
  -F "name=Alex Rivera" \
  -F "portfolio_focus=fullstack" \
  -F "linkedin_file=@linkedin.pdf" \
  -F "resume_file=@resume.pdf" \
  -F 'github_repos=["https://github.com/user/repo1"]' \
  -F "codeforces_username=tourist" \
  -F "leetcode_username=arivera"
```

**Response:**

```json
{
  "portfolio_id": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "alex-rivera-29fa2b",
  "status": "completed",
  "public_portfolio_url": "/portfolio/alex-rivera-29fa2b",
  "private_coaching_url": "/portfolio/alex-rivera-29fa2b/coaching",
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
    "name": "Alex Rivera",
    "slug": "alex-rivera-29fa2b",
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
- Hero section with gradient background and animations
- "Sign in with GitHub" button in navbar
- Features showcase with smooth scroll
- Testimonials and social proof
- Newsletter subscription
- Call-to-action buttons
- Footer with company links

### 2. Auth Callback (`/auth/callback`)
- Handles GitHub OAuth redirect
- Extracts JWT token from URL parameters
- Stores token in localStorage
- Fetches user data and updates AuthContext
- Loading spinner with "Completing sign in..." message
- Auto-redirects to home page

### 3. My Portfolios (`/my-portfolios`)
- Dashboard showing all user's portfolios
- Grid layout with portfolio cards
- Each card shows:
  - Portfolio name and slug
  - Creation date
  - Quick action buttons (Refine, View)
- "Create New Portfolio" button
- Requires authentication (redirects to login if not authenticated)

### 4. Generate Portfolio (`/generate`)
- Multi-section form with smooth animations
- Input fields:
  - Name and portfolio focus
  - LinkedIn PDF upload
  - Resume PDF/DOCX upload
  - GitHub repository URLs
  - Codeforces/LeetCode usernames
- Dynamic loading states with rotating messages:
  - "Analyzing your professional profile..."
  - "Fetching GitHub repositories..."
  - "Generating AI-powered insights..."
  - And more!
- Time estimates (30-60 seconds)
- Requires authentication

### 5. Refine Portfolio (`/refine/:slug`)
- Two-tab interface: Portfolio | Personalized Insights
- **Portfolio tab:**
  - Professional summary
  - Key strengths
  - Project highlights
  - Skills
  - Work experience
  - AI refinement input with natural language instructions
  - Confirm/Revert version controls
- **Personalized Insights tab** (auto-loads):
  - Skill Analysis - Strengths (Green) & Gaps (Yellow)
  - Learning Path (Blue) - Immediate, Short-term, Long-term
  - Interview Prep (Purple) - Questions & Talking Points
  - Market Positioning (Indigo) - Roles & Advantages
- Version management (clean UI without exposing internal states)
- "View Public Portfolio" link
- Requires authentication

### 6. View Portfolio (`/portfolio/:slug`)
- Beautiful public portfolio display (no auth required)
- Responsive grid layout
- Polished sections:
  - Professional Summary
  - Work Experience
  - Featured Projects with tech stacks
  - Achievements and awards
  - Skills & Technologies
  - GitHub Projects with stats
  - Competitive Programming Stats
  - Contact Information
- Shareable URL for recruiters
- Mobile-optimized design

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
- **Navbar**: Sticky navigation with GitHub auth, user menu dropdown, and smooth animations
- **Footer**: Links, newsletter subscription, copyright
- **LenisScroll**: Smooth scrolling wrapper for entire app
- **SectionTitle**: Reusable component for section headers
- **TiltImage**: 3D tilt effect for hero images
- **Pages**: Separate components for each route

#### State Management
- **React Context API**: Global authentication state via `AuthContext`
- **Custom Hooks**: `useAuth` hook for accessing auth state anywhere
- **Local State**: Component-level state with useState/useEffect
- **Session Persistence**: JWT tokens stored in localStorage
- **Automatic Session Restore**: On app load, checks for existing token and fetches user data

#### Authentication Flow
1. User clicks "Sign in with GitHub" → triggers `authService.login()`
2. Redirects to backend `/auth/login` → redirects to GitHub OAuth
3. GitHub redirects back to backend `/auth/callback` with code
4. Backend exchanges code for token, creates user, generates JWT
5. Backend redirects to frontend `/auth/callback?token={jwt}`
6. Frontend `AuthCallback` component extracts token, stores it, fetches user data
7. Updates `AuthContext` with user object
8. User is now authenticated across all pages

#### API Integration
- **Axios Instance**: Configured with base URL and auth interceptors
- **Request Interceptor**: Automatically adds `Authorization: Bearer {token}` header
- **Response Interceptor**: Handles 401 errors and logs API errors
- **Service Layer**: Separated services for auth and portfolio operations

#### Routing
- React Router DOM v7
- Client-side navigation with `<Link>` components
- Dynamic routes for portfolio slugs (`/portfolio/:slug`, `/refine/:slug`)
- Protected routes that require authentication
- Auth callback route for OAuth flow

#### Styling
- Tailwind CSS utility classes
- Custom color schemes (indigo/slate palette)
- Responsive breakpoints (sm, md, lg, xl)
- Dark theme by default with glassmorphism effects
- Gradient backgrounds and borders

#### Animations
- Framer Motion for page transitions and micro-interactions
- Spring animations for buttons and modals
- Smooth scroll with Lenis library
- Motion variants for staggered animations
- Active state transitions (scale, opacity)

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  github_id VARCHAR(100) UNIQUE NOT NULL,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  avatar_url VARCHAR(255),
  access_token VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_github_id ON users(github_id);
```

### Portfolios Table

```sql
CREATE TABLE portfolios (
  id UUID PRIMARY KEY,
  user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
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
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
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
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@host/db

# GitHub OAuth (Production)
GITHUB_CLIENT_ID=your_prod_github_client_id
GITHUB_CLIENT_SECRET=your_prod_github_client_secret
GITHUB_REDIRECT_URI=https://api.yourdomain.com/auth/callback
FRONTEND_URL=https://yourdomain.com

# API Keys
GITHUB_TOKEN=your_github_personal_access_token
GEMINI_API_KEY=your_gemini_api_key

# Security
JWT_SECRET=use-strong-random-secret-here-min-32-chars
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional
HOST=0.0.0.0
PORT=8000
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://api.yourdomain.com
```

**Important Production Notes:**
1. Create a **separate GitHub OAuth app** for production (don't use dev credentials)
2. Use a **crypto-secure random string** for `JWT_SECRET` (minimum 32 characters)
3. Set `GITHUB_REDIRECT_URI` to your production backend URL
4. Set `FRONTEND_URL` to your production frontend URL
5. Whitelist only your production domain(s) in `CORS_ORIGINS`
6. Never commit production `.env` files to version control

---

## Security Notes

### Current Implementation (Development)

✅ **Implemented:**
- **GitHub OAuth**: Secure user authentication via GitHub
- **JWT Tokens**: Session management with Bearer token authentication
- **Password-less Auth**: No passwords to manage or leak
- **User Isolation**: Portfolios linked to user accounts
- **Auth Interceptors**: Automatic token injection on API requests
- **Session Restore**: Validates token on app load
- **Token Expiration**: JWT tokens have expiration dates

⚠️ **Development Limitations:**
- **CORS**: Currently allows all origins (`*`) - must restrict for production
- **API Keys**: Stored in `.env` file - use secrets manager for production
- **JWT Secret**: Simple secret key - must use strong random key in production
- **Rate Limiting**: Relies on external API limits - add middleware for production
- **Input Validation**: Basic validation - enhance for production
- **Token Storage**: localStorage (vulnerable to XSS) - consider httpOnly cookies for production

### Production Recommendations

1. **Configure CORS Properly**
   ```python
   CORS_ORIGINS = ["https://yourdomain.com", "https://www.yourdomain.com"]
   ```

2. **Secure JWT Tokens**
   - Use strong random secret (32+ characters, generated with crypto-secure RNG)
   - Set appropriate expiration times (e.g., 7 days)
   - Consider refresh token rotation
   - Use httpOnly cookies instead of localStorage

3. **Secrets Management**
   - Use AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault
   - Never commit `.env` to version control (already in `.gitignore`)
   - Rotate secrets regularly

4. **Add Rate Limiting**
   - Use middleware like `slowapi` for FastAPI
   - Limit login attempts, portfolio generation requests
   - Implement IP-based and user-based limits

5. **Use HTTPS**
   - Enable SSL/TLS on backend and frontend
   - Use Let's Encrypt for free SSL certificates
   - Enforce HTTPS redirects

6. **Enhanced Input Validation**
   - Validate all file uploads (size, type, content)
   - Sanitize user inputs to prevent injection attacks
   - Validate portfolio slugs and IDs

7. **Error Handling**
   - Don't expose stack traces to clients in production
   - Log errors securely without sensitive data
   - Return generic error messages to users

8. **Logging & Monitoring**
   - Add structured logging with correlation IDs
   - Redact sensitive data (tokens, emails) from logs
   - Monitor failed authentication attempts
   - Set up alerts for suspicious activity

9. **API Security**
   - Add request signing for sensitive operations
   - Implement CSRF protection for state-changing requests
   - Add content security policy (CSP) headers

10. **GitHub OAuth Production Setup**
    - Create separate OAuth app for production
    - Use production callback URLs
    - Limit OAuth scopes to minimum required
    - Regularly rotate GitHub client secrets

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
- Check `VITE_API_URL` in `frontend/.env`
- Verify backend is running on port 8000
- Check CORS configuration in backend
- Open browser console to see network errors

**Styling Issues:**
```bash
# Rebuild Tailwind CSS
npm run build
```

### Authentication Issues

**GitHub Sign-In Not Working:**
1. Verify GitHub OAuth app is created at https://github.com/settings/developers
2. Check that callback URL matches: `http://localhost:8000/auth/callback`
3. Confirm `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set in `.env`
4. Ensure `FRONTEND_URL=http://localhost:5173` in `.env`
5. Check browser console for errors during OAuth redirect

**401 Unauthorized Errors:**
- Token may be expired or invalid
- Clear browser localStorage: `localStorage.removeItem('token')`
- Sign in again with GitHub
- Check that backend JWT_SECRET is set in `.env`

**User Session Not Persisting:**
- Check browser localStorage for `token` key
- Verify token is being sent in API requests (check Network tab)
- Ensure `AuthProvider` wraps your app in `App.jsx`
- Check that `useAuth` is being called within `AuthProvider`

**OAuth Redirect Loop:**
- Clear browser cache and cookies
- Verify `FRONTEND_URL` and `GITHUB_REDIRECT_URI` match your actual URLs
- Check that both backend and frontend are running on correct ports
- Look for console errors during redirect

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
