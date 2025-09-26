#!/bin/bash

echo "🚀 Starting RankForge FastAPI Backend..."
echo "📍 API will be available at: http://127.0.0.1:8000"
echo "📖 API docs will be available at: http://127.0.0.1:8000/docs"
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is available
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

# Install requirements if they don't exist
echo "📦 Installing Python dependencies..."
pip3 install -r requirements.txt

echo ""
echo "🎯 Starting FastAPI server..."
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the FastAPI server
python3 fastapi-backend.py
