@echo off
TITLE AEROSWARM - Multi-Agent UAV Surveillance Platform Launcher
COLOR 0B

echo ==============================================================================
echo                AEROSWARM - MULTI-AGENT UAV SURVEILLANCE PLATFORM             
echo         Autonomous Swarm Control, Distributed Perception & Telemetry          
echo ==============================================================================
echo.
echo [1/3] Checking environment prerequisites...

python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH! Please install Python 3.10+.
    pause
    exit /b 1
)

call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / NPM is not installed or not in PATH! Please install Node.js.
    pause
    exit /b 1
)

echo [OK] Python and Node.js detected.
echo.
echo [2/3] Starting FastAPI & WebSocket Backend (Port 8000)...
start "AEROSWARM Backend (Port 8000)" cmd /k "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

echo [3/3] Starting Vite Frontend Dashboard (Port 5173)...
start "AEROSWARM Dashboard (Port 5173)" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul

echo.
echo ==============================================================================
echo [SUCCESS] AEROSWARM Platform is online!
echo Opening browser at http://localhost:5173 ...
echo ==============================================================================
start http://localhost:5173

echo.
echo Keep the backend and frontend command windows open while running.
echo To terminate the system, simply close those windows.
echo.
pause

