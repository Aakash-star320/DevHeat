import { useState } from 'react'
import axios from 'axios'
import './PortfolioForm.css'

const API_URL = 'http://localhost:8000'

function PortfolioForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    portfolio_focus: 'fullstack',
    linkedin_file: null,
    resume_file: null,
    github_repos: '',
    codeforces_username: '',
    leetcode_username: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e) => {
    const { name, files } = e.target
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        [name]: files[0]
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Create FormData for file upload
      const data = new FormData()
      data.append('name', formData.name)
      data.append('portfolio_focus', formData.portfolio_focus)

      if (formData.linkedin_file) {
        data.append('linkedin_file', formData.linkedin_file)
      }

      if (formData.resume_file) {
        data.append('resume_file', formData.resume_file)
      }

      if (formData.github_repos.trim()) {
        // Convert comma-separated URLs to JSON array
        const repos = formData.github_repos
          .split(',')
          .map(url => url.trim())
          .filter(url => url)
        data.append('github_repos', JSON.stringify(repos))
      }

      if (formData.codeforces_username.trim()) {
        data.append('codeforces_username', formData.codeforces_username.trim())
      }

      if (formData.leetcode_username.trim()) {
        data.append('leetcode_username', formData.leetcode_username.trim())
      }

      // Send request to backend
      const response = await axios.post(`${API_URL}/portfolio/generate`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Portfolio generated:', response.data)
      onSuccess(response.data)

    } catch (err) {
      console.error('Error generating portfolio:', err)
      setError(err.response?.data?.detail || err.message || 'Failed to generate portfolio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="portfolio-form" onSubmit={handleSubmit}>
      <div className="form-card">
        <h3>Portfolio Information</h3>

        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">
            Full Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>

        {/* Portfolio Focus */}
        <div className="form-group">
          <label htmlFor="portfolio_focus">Portfolio Focus</label>
          <select
            id="portfolio_focus"
            name="portfolio_focus"
            value={formData.portfolio_focus}
            onChange={handleChange}
          >
            <option value="general">General</option>
            <option value="fullstack">Full Stack</option>
            <option value="backend">Backend</option>
            <option value="ml">Machine Learning</option>
            <option value="competitive">Competitive Programming</option>
          </select>
        </div>

        <h3>Upload Files</h3>

        {/* LinkedIn File */}
        <div className="form-group">
          <label htmlFor="linkedin_file">
            LinkedIn Profile (PDF)
            <span className="optional">Optional</span>
          </label>
          <input
            type="file"
            id="linkedin_file"
            name="linkedin_file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
          />
          {formData.linkedin_file && (
            <p className="file-name">Selected: {formData.linkedin_file.name}</p>
          )}
        </div>

        {/* Resume File */}
        <div className="form-group">
          <label htmlFor="resume_file">
            Resume (PDF/DOCX)
            <span className="optional">Optional</span>
          </label>
          <input
            type="file"
            id="resume_file"
            name="resume_file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
          />
          {formData.resume_file && (
            <p className="file-name">Selected: {formData.resume_file.name}</p>
          )}
        </div>

        <h3>Add Projects & Profiles</h3>

        {/* GitHub Repos */}
        <div className="form-group">
          <label htmlFor="github_repos">
            GitHub Repository URLs
            <span className="optional">Optional</span>
          </label>
          <textarea
            id="github_repos"
            name="github_repos"
            value={formData.github_repos}
            onChange={handleChange}
            placeholder="https://github.com/user/repo1, https://github.com/user/repo2"
            rows="3"
          />
          <p className="help-text">Enter up to 5 repo URLs, separated by commas</p>
        </div>

        {/* Codeforces Username */}
        <div className="form-group">
          <label htmlFor="codeforces_username">
            Codeforces Username
            <span className="optional">Optional</span>
          </label>
          <input
            type="text"
            id="codeforces_username"
            name="codeforces_username"
            value={formData.codeforces_username}
            onChange={handleChange}
            placeholder="tourist"
          />
        </div>

        {/* LeetCode Username */}
        <div className="form-group">
          <label htmlFor="leetcode_username">
            LeetCode Username
            <span className="optional">Optional</span>
          </label>
          <input
            type="text"
            id="leetcode_username"
            name="leetcode_username"
            value={formData.leetcode_username}
            onChange={handleChange}
            placeholder="your_username"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="btn btn-primary btn-submit"
          disabled={loading || !formData.name}
        >
          {loading ? 'Generating Portfolio...' : 'Generate Portfolio'}
        </button>

        {loading && (
          <div className="loading-info">
            <div className="spinner"></div>
            <p>Please wait while we generate your portfolio...</p>
            <p className="loading-note">This may take 10-30 seconds depending on the data sources.</p>
          </div>
        )}
      </div>
    </form>
  )
}

export default PortfolioForm
