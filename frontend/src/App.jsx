import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PortfolioForm from './components/PortfolioForm'
import PortfolioRefinement from './components/PortfolioRefinement'
import './App.css'

function HomePage() {
  const [generatedPortfolio, setGeneratedPortfolio] = useState(null)

  const handlePortfolioGenerated = (data) => {
    setGeneratedPortfolio(data)
  }

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="logo">DevHeat</h1>
          <p className="tagline">AI-Powered Portfolio Generator</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {!generatedPortfolio ? (
            <>
              <div className="hero">
                <h2>Create Your Professional Portfolio</h2>
                <p>Upload your resume, LinkedIn, and GitHub projects. Let AI generate a beautiful portfolio for you!</p>
              </div>
              <PortfolioForm onSuccess={handlePortfolioGenerated} />
            </>
          ) : (
            <div className="success-section">
              <div className="success-card">
                <div className="success-icon">✓</div>
                <h2>Portfolio Generated Successfully!</h2>
                <p>Your portfolio has been created and is ready to share.</p>

                <div className="portfolio-links">
                  <div className="link-box">
                    <label>Portfolio Page (Share this!):</label>
                    <div className="link-group">
                      <input
                        type="text"
                        readOnly
                        value={`http://localhost:8000/portfolio/${generatedPortfolio.slug}/view`}
                        onClick={(e) => e.target.select()}
                      />
                      <button
                        onClick={() => window.open(`http://localhost:8000/portfolio/${generatedPortfolio.slug}/view`, '_blank')}
                        className="btn btn-primary"
                      >
                        View Portfolio
                      </button>
                    </div>
                  </div>

                  <div className="link-box">
                    <label>API Endpoint (JSON):</label>
                    <div className="link-group">
                      <input
                        type="text"
                        readOnly
                        value={`http://localhost:8000/portfolio/${generatedPortfolio.slug}`}
                        onClick={(e) => e.target.select()}
                      />
                      <button
                        onClick={() => window.open(`http://localhost:8000/portfolio/${generatedPortfolio.slug}`, '_blank')}
                        className="btn btn-secondary"
                      >
                        View JSON
                      </button>
                    </div>
                  </div>

                  <div className="link-box">
                    <label>Private Coaching:</label>
                    <div className="link-group">
                      <input
                        type="text"
                        readOnly
                        value={`http://localhost:8000/portfolio/${generatedPortfolio.slug}/coaching`}
                        onClick={(e) => e.target.select()}
                      />
                      <button
                        onClick={() => window.open(`http://localhost:8000/portfolio/${generatedPortfolio.slug}/coaching`, '_blank')}
                        className="btn btn-secondary"
                      >
                        View Coaching
                      </button>
                    </div>
                  </div>
                </div>

                <div className="generation-info">
                  <p><strong>Portfolio ID:</strong> {generatedPortfolio.portfolio_id}</p>
                  <p><strong>Status:</strong> {generatedPortfolio.status}</p>
                  <p><strong>Generation Time:</strong> {generatedPortfolio.generation_time_seconds}s</p>
                </div>

                <div className="action-buttons">
                  <button
                    onClick={() => window.location.href = `/refine/${generatedPortfolio.slug}`}
                    className="btn btn-primary btn-large"
                  >
                    Refine Portfolio with AI
                  </button>
                  <button
                    onClick={() => setGeneratedPortfolio(null)}
                    className="btn btn-outline"
                  >
                    Create Another Portfolio
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <p>Powered by FastAPI + React • AI-Generated Portfolios</p>
      </footer>
    </div>
  )
}

function RefinementPage() {
  // Extract slug from URL
  const slug = window.location.pathname.split('/').pop()

  return (
    <div className="app">
      <header className="header">
        <div className="container">
          <h1 className="logo">DevHeat</h1>
          <p className="tagline">AI-Powered Portfolio Generator</p>
        </div>
      </header>

      <main className="main">
        <PortfolioRefinement slug={slug} />
      </main>

      <footer className="footer">
        <p>Powered by FastAPI + React • AI-Generated Portfolios</p>
      </footer>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/refine/:slug" element={<RefinementPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
