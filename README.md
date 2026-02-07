# Resume-to-Portfolio Generator - Backend API

FastAPI backend for processing LinkedIn profiles and resumes. Built for hackathon with clean architecture and production-ready code.

## Features

- **Two Upload Endpoints**:
  - `/upload/linkedin` - Parses LinkedIn profiles into structured sections
  - `/upload/resume` - Extracts raw text from resumes

- **File Support**:
  - PDF (text-based, no OCR)
  - DOCX (Microsoft Word)
  - 5MB file size limit

- **Validation**:
  - File type checking (extension + MIME type)
  - Size validation
  - Proper error responses

## Project Structure

```
Devheat/
├── app/
│   ├── main.py              # FastAPI app initialization
│   ├── config.py            # Configuration & constants
│   ├── routers/
│   │   ├── linkedin_router.py
│   │   └── resume_router.py
│   ├── models/
│   │   └── responses.py     # Pydantic models
│   └── utils/
│       ├── validators.py    # File validation
│       └── file_parser.py   # Text extraction
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

### Upload LinkedIn Profile

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

### Upload Resume

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

## Testing with cURL

### LinkedIn Upload

```bash
curl -X POST "http://localhost:8000/upload/linkedin" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/linkedin.pdf"
```

### Resume Upload

```bash
curl -X POST "http://localhost:8000/upload/resume" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/resume.pdf"
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

- No database integration (stateless API)
- No AI/LLM processing
- Deterministic section parsing only
- Text-based PDFs only (no OCR)
- CORS enabled for all origins (update for production)

## Tech Stack

- **FastAPI** - Modern async web framework
- **pdfplumber** - PDF text extraction
- **python-docx** - DOCX text extraction
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## License

Built for hackathon use.
