# SmartFolio Frontend

React-based frontend for SmartFolio - AI-Powered Portfolio Generator.

## Tech Stack

- **React** 19.1.1
- **Vite** 7.1.7
- **Tailwind CSS** 4.1.14
- **Framer Motion** 12.23.22
- **React Router DOM** 7.9.3
- **Lenis** 1.3.11 - Smooth scrolling
- **Axios** 1.13.5
- **Lucide React** 0.545.0

## Quick Start

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Configuration

Create a `.env` file to override the default API URL:

```env
VITE_API_URL=http://localhost:8000
```

## Pages

- **Landing Page** (`/`) - Home page with features showcase
- **Generate Portfolio** (`/generate`) - Portfolio creation form with dynamic loading
- **Refine Portfolio** (`/refine/:slug`) - AI refinement and coaching insights
- **View Portfolio** (`/portfolio/:slug`) - Public portfolio display

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── navbar.jsx           # Navigation bar
│   │   ├── footer.jsx           # Footer
│   │   └── lenis-scroll.jsx     # Smooth scroll wrapper
│   ├── pages/
│   │   ├── LandingPage.jsx      # Home page
│   │   ├── GeneratePortfolio.jsx # Generation form
│   │   ├── RefinePortfolio.jsx   # Refinement UI
│   │   └── ViewPortfolio.jsx     # Portfolio display
│   ├── services/
│   │   ├── api.js                # Axios configuration
│   │   └── portfolioService.js   # API methods
│   ├── App.jsx                   # Routes
│   └── main.jsx                  # Entry point
├── public/
│   └── favicon.png
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Features

- **Responsive Design** - Works on all devices
- **Smooth Animations** - Framer Motion transitions
- **Dynamic Loading** - Rotating messages during generation
- **Coaching Insights** - Color-coded feedback sections
- **Version Management** - Track portfolio changes
- **Modern UI** - Tailwind CSS styling with dark theme

## API Integration

The frontend connects to the FastAPI backend for all operations:

- Portfolio generation
- Data fetching (GitHub, Codeforces, LeetCode)
- AI refinement
- Coaching insights
- Version management

## Development

### Linting

```bash
npm run lint
```

### Type Checking

Not configured. This project uses vanilla JavaScript with JSX.

## Deployment

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variable: `VITE_API_URL`
4. Deploy

### Netlify

1. Build the project: `npm run build`
2. Deploy the `dist/` folder
3. Configure environment variables in Netlify dashboard

### GitHub Pages

```bash
npm run deploy
```

This uses `gh-pages` to deploy the `dist/` folder.

## Complete Documentation

For complete project documentation including:
- Backend setup
- API endpoints
- Database schema
- Architecture details
- Deployment guides

See the [main README](../README.md) in the project root.

## License

Built for hackathon use. Part of the SmartFolio project.

---

**Part of SmartFolio** - AI-Powered Portfolio Generator
