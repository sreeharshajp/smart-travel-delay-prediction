#!/bin/bash

# Quick start script for local development

echo "🚀 Starting Smart Travel Delay Prediction System..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install requirements if needed
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Start backend in background
echo "🖥️  Starting backend server..."
cd backend
python app.py &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 3

# Start frontend
echo "🌐 Starting frontend server..."
cd frontend
python -m http.server 8000 &
FRONTEND_PID=$!
cd ..

echo "✅ Both servers are running!"
echo ""
echo "🌍 Frontend: http://localhost:8000"
echo "🔧 Backend:  http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Trap Ctrl+C and cleanup
trap cleanup SIGINT

# Wait for user to stop
wait
