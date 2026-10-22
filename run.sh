#!/usr/bin/env bash

# MindPulse AI - Startup Script
# Starts both FastAPI Backend (port 8000) and Vite React Frontend (port 5173)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=========================================================="
echo " Starting MindPulse AI - Mental Health & Distress Analyzer"
echo "=========================================================="

# 1. Check Python virtual environment
PYTHON_BIN="$SCRIPT_DIR/.venv/bin/python"
if [ ! -f "$PYTHON_BIN" ]; then
    echo "Python virtual environment not found at .venv. Using system python3..."
    PYTHON_BIN="python3"
fi

# 2. Check environment file
if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "WARNING: .env file not found in $SCRIPT_DIR!"
fi

echo "Starting FastAPI Backend on http://localhost:8000..."
PYTHONPATH="$SCRIPT_DIR" "$PYTHON_BIN" -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

echo "Starting React Frontend on http://localhost:5173..."
cd "$SCRIPT_DIR/frontend"
npm run dev -- --host 0.0.0.0 &
FRONTEND_PID=$!

# Trap signals to shut down both processes gracefully
cleanup() {
    echo ""
    echo "Shutting down MindPulse AI services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "Services stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo ""
echo "=========================================================="
echo "MindPulse AI is running!"
echo "Frontend URL:  http://localhost:5173"
echo "Backend API:   http://localhost:8000"
echo "API Docs:      http://localhost:8000/docs"
echo "Press Ctrl+C to terminate both servers."
echo "=========================================================="

# Keep script running to monitor children
wait
