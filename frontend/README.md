# DevHeat Frontend - Portfolio Generator

React frontend for the DevHeat Portfolio Generator system.

## Features

- Upload LinkedIn PDF and Resume
- Enter GitHub repository URLs
- Add Codeforces and LeetCode usernames
- Generate AI-powered portfolios
- Get shareable portfolio links
- View generated portfolios

## Setup Instructions

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will run on **http://localhost:3000**

### 3. Make Sure Backend is Running

The backend should be running on **http://localhost:8000**

```bash
# In the main DevHeat directory
uvicorn app.main:app --reload
```

## Usage

1. **Open the App**: Visit http://localhost:3000
2. **Fill the Form**:
   - Enter your full name (required)
   - Select portfolio focus (fullstack, backend, ML, etc.)
   - Upload LinkedIn PDF (optional)
   - Upload Resume PDF/DOCX (optional)
   - Add GitHub repo URLs (comma-separated, optional)
   - Add Codeforces username (optional)
   - Add LeetCode username (optional)
3. **Generate Portfolio**: Click "Generate Portfolio"
4. **Wait**: Generation takes 10-30 seconds
5. **View Links**: Get your portfolio link to share!

## Portfolio Links

After generation, you get 3 links:

1. **Portfolio Page (HTML)**: `http://localhost:8000/portfolio/{slug}/view`
   - Beautiful HTML page to share with recruiters
   - Fully responsive design

2. **API Endpoint (JSON)**: `http://localhost:8000/portfolio/{slug}`
   - JSON data for programmatic access

3. **Private Coaching**: `http://localhost:8000/portfolio/{slug}/coaching`
   - Personal improvement suggestions
   - Skill gaps and learning paths

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Axios** - HTTP client for API calls

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── PortfolioForm.jsx
│   │   └── PortfolioForm.css
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## API Integration

The frontend calls these backend endpoints:

- `POST /portfolio/generate` - Create new portfolio
  - Sends multipart/form-data with files and text fields
  - Returns portfolio ID and slug

## Environment

Default API URL: `http://localhost:8000`

To change, edit `API_URL` in `src/components/PortfolioForm.jsx`

## Production Build

```bash
npm run build
```

Outputs to `dist/` folder. Serve with any static host.

## Troubleshooting

### CORS Errors

If you see CORS errors, make sure:
1. Backend is running on http://localhost:8000
2. Backend has CORS middleware enabled (already configured)

### File Upload Fails

Check file formats:
- LinkedIn: PDF or DOCX
- Resume: PDF or DOCX
- Max size: 5MB

### Backend Not Responding

1. Make sure backend is running: `uvicorn app.main:app --reload`
2. Check backend is on http://localhost:8000
3. Visit http://localhost:8000/docs to verify backend is up

## Development

### Adding New Features

1. Backend changes: Edit `/app/routers/`
2. Frontend changes: Edit `/frontend/src/`
3. Restart dev servers to see changes

### Debugging

- Frontend console: Open browser DevTools (F12)
- Backend logs: Check terminal running uvicorn
- Network tab: See API requests/responses

## License

Built for hackathon use.
