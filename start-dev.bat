@echo off
echo 🚀 Starting Wateen Watify Development Environment...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Kill any existing processes on port 5000 and 3000
echo 🔧 Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    taskkill /PID %%a /F >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    taskkill /PID %%a /F >nul 2>nul
)

echo ✅ Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d %~dp0 && npm run dev"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo ✅ Starting Frontend Server (Port 3000)...
start "Frontend Server" cmd /k "cd /d %~dp0frontend && set BROWSER=none && npm start"

echo.
echo ================================================================
echo 🎉 Development Environment Starting!
echo ================================================================
echo Backend API:  http://localhost:5000
echo Frontend App: http://localhost:3000
echo Health Check: http://localhost:5000/health
echo.
echo ⏳ Please wait a moment for both servers to fully start...
echo 🌐 Your browser should open automatically to http://localhost:3000
echo.
echo 🛑 To stop the servers, close both command windows or press Ctrl+C in each
echo ================================================================

pause 