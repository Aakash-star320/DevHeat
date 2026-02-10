#!/usr/bin/env bash
# Build script for Render

set -o errexit

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Build frontend
cd frontend
npm install
npm run build
cd ..

echo "Build completed successfully!"
