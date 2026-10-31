# ==============================================================================
#  AEROSWARM - Multi-Agent UAV Surveillance Platform PowerShell Launcher
# ==============================================================================

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "           AEROSWARM - MULTI-AGENT UAV SURVEILLANCE PLATFORM                  " -ForegroundColor Cyan
Write-Host "    Distributed Perception, Hungarian Task Allocation & 6-DOF Simulation      " -ForegroundColor DarkCyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Python & Node
Write-Host "[1/3] Checking dependencies..." -ForegroundColor Yellow
try {
    $pyVer = python --version 2>&1
    Write-Host "  -> $pyVer detected" -ForegroundColor Green
} catch {
    Write-Host "  [!] Python not found in PATH." -ForegroundColor Red
    exit 1
}

try {
    $nodeVer = node --version 2>&1
    Write-Host "  -> Node.js $nodeVer detected" -ForegroundColor Green
} catch {
    Write-Host "  [!] Node.js not found in PATH." -ForegroundColor Red
    exit 1
}

# 2. Launch Backend
Write-Host ""
Write-Host "[2/3] Launching FastAPI + WebSocket backend on http://127.0.0.1:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000"

Start-Sleep -Seconds 3

# 3. Launch Frontend
Write-Host "[3/3] Launching React Vite Mission Control on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Start-Sleep -Seconds 3

# Open Browser
Write-Host ""
Write-Host "[SUCCESS] AEROSWARM is fully operational. Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"
Write-Host "==============================================================================" -ForegroundColor Cyan

