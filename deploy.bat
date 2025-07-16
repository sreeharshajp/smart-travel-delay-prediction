@echo off
echo 🚀 Starting deployment setup...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    exit /b 1
)

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate

REM Install requirements
echo 📥 Installing Python dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo ⚙️  Creating .env file...
    copy .env.example .env
    echo 📝 Please edit .env file with your API keys!
)

echo ✅ Setup complete!
echo.
echo 📋 Next steps:
echo 1. Edit .env file with your API keys
echo 2. Start the backend: cd backend ^&^& python app.py
echo 3. Start the frontend: cd frontend ^&^& python -m http.server 8000
echo 4. Open browser: http://localhost:8000
echo.
echo 🌐 For GitHub deployment, commit all files and push to your repository

pause
