@echo off
echo 🚀 Starting Smart Travel Delay Prediction System...

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate

REM Install requirements if needed
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Start backend in background
echo 🖥️  Starting backend server...
cd backend
start /B python app.py
cd ..

REM Wait for backend to start
echo ⏳ Waiting for backend to start...
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🌐 Starting frontend server...
cd frontend
start /B python -m http.server 8000
cd ..

echo ✅ Both servers are running!
echo.
echo 🌍 Frontend: http://localhost:8000
echo 🔧 Backend:  http://localhost:5000
echo.
echo Press any key to stop servers...
pause >nul

echo 🛑 Stopping servers...
taskkill /F /IM python.exe >nul 2>&1
echo ✅ Servers stopped
