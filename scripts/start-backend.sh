#!/bin/bash

echo "🚀 Starting RankForge Backend..."
echo "📦 Installing dependencies..."

# Install Python dependencies
pip install -r requirements.txt

echo "🔥 Starting FastAPI server..."
python fastapi-backend.py
