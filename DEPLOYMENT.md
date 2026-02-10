# Render Deployment Guide for DevHeat Portfolio Generator

## Prerequisites
- Render account (free tier works)
- GitHub repository with your code
- API keys ready (Gemini, GitHub)

## Deployment Steps

### 1. Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select the repository: `Aakash-star320/DevHeat`
5. Select branch: `dev-aakash` (or your deployment branch)

### 2. Configure Build Settings

**Basic Settings:**
- **Name**: `devheat-portfolio` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `dev-aakash`
- **Root Directory**: Leave empty (or `.` if required)
- **Runtime**: `Python 3`
- **Build Command**: `./build.sh`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Instance Type:**
- Free tier is sufficient for testing
- Upgrade to paid tier for production use

### 3. Environment Variables

Add these environment variables in Render dashboard:

#### Required Variables:

```
GEMINI_API_KEY=your_gemini_api_key_here
```
- Get from: https://aistudio.google.com/app/apikey
- Required for AI portfolio generation and refinement

```
DATABASE_URL=postgresql://user:password@host:5432/database
```
- **IMPORTANT**: For production, use PostgreSQL (not SQLite)
- Render provides free PostgreSQL: Create a new PostgreSQL database in Render
- Copy the **Internal Database URL** from your Render PostgreSQL instance
- Format: `postgresql://username:password@hostname:5432/database_name`

```
GITHUB_TOKEN=your_github_personal_access_token
```
- Get from: https://github.com/settings/tokens
- Required for GitHub repository analysis
- Scopes needed: `public_repo` (or `repo` for private repos)
- **Optional** but recommended for better rate limits

#### Optional Variables:

```
PYTHON_VERSION=3.11
```
- Specify Python version (default: 3.11)

```
PORT=8000
```
- Render automatically sets this, but you can override if needed

### 4. Create PostgreSQL Database (Recommended)

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Name: `devheat-db`
3. Database: `devheat_portfolio`
4. User: Auto-generated
5. Region: Same as your web service
6. Plan: Free tier for testing
7. Click **"Create Database"**
8. Copy the **Internal Database URL**
9. Paste it as `DATABASE_URL` in your web service environment variables

### 5. Deploy

1. Click **"Create Web Service"**
2. Render will automatically:
   - Clone your repository
   - Run `build.sh` (install deps, run migrations, build frontend)
   - Start the server with `uvicorn`
3. Monitor the deployment logs
4. Once deployed, you'll get a URL like: `https://devheat-portfolio.onrender.com`

### 6. Post-Deployment Verification

Test these endpoints:
- `https://your-app.onrender.com/` - Should show "DevHeat Portfolio API"
- `https://your-app.onrender.com/docs` - Swagger UI
- `https://your-app.onrender.com/health` - Health check (if you have one)

## Important Notes

### ⚠️ Current Issues to Fix Before Deployment:

1. **SQLite Not Suitable for Production**
   - SQLite file (`portfolios.db`) won't persist on Render's free tier
   - **MUST use PostgreSQL** for production
   - Update `DATABASE_URL` to PostgreSQL connection string

2. **Frontend Static Files**
   - The current setup uses Vite dev server
   - For production, frontend should be built and served as static files
   - The `build.sh` script handles this, but you need to update `app/main.py` to serve static files

3. **CORS Configuration**
   - Currently allows all origins (`*`)
   - Update `app/main.py` to restrict CORS to your Render domain:
     ```python
     origins = [
         "https://devheat-portfolio.onrender.com",
         "http://localhost:3000"  # for local development
     ]
     ```

4. **Environment Variables**
   - Never commit `.env` file to Git
   - All secrets must be set in Render dashboard

### 🔧 Files Created for Deployment:

- `Procfile` - Tells Render how to start the app
- `build.sh` - Build script for dependencies and frontend
- `DEPLOYMENT.md` - This guide

### 📝 Deployment Checklist:

- [ ] PostgreSQL database created in Render
- [ ] `DATABASE_URL` environment variable set (PostgreSQL URL)
- [ ] `GEMINI_API_KEY` environment variable set
- [ ] `GITHUB_TOKEN` environment variable set (optional)
- [ ] CORS origins updated in `app/main.py`
- [ ] Frontend build configured to output to correct directory
- [ ] Static file serving configured in `app/main.py`
- [ ] Database migrations run successfully
- [ ] Test deployment with sample portfolio generation

## Troubleshooting

### Build Fails
- Check build logs in Render dashboard
- Verify `requirements.txt` has all dependencies
- Ensure `build.sh` has execute permissions

### Database Connection Fails
- Verify `DATABASE_URL` is correct
- Check PostgreSQL database is running
- Ensure database is in same region as web service

### Frontend Not Loading
- Check if `frontend/dist` directory exists after build
- Verify static files are being served correctly
- Check browser console for errors

### API Key Errors
- Verify environment variables are set correctly
- Check API key validity
- Review application logs

## Cost Estimate (Render Free Tier)

- **Web Service**: Free (with limitations: sleeps after 15 min inactivity)
- **PostgreSQL**: Free (with limitations: 90 days, then deleted if inactive)
- **Bandwidth**: 100 GB/month free

For production, consider upgrading to paid tiers for:
- Always-on service (no sleep)
- Persistent database
- Better performance
- More bandwidth

## Next Steps After Deployment

1. Test all features thoroughly
2. Set up custom domain (optional)
3. Configure monitoring and alerts
4. Set up CI/CD for automatic deployments
5. Add health check endpoint
6. Implement rate limiting
7. Add authentication for private endpoints
