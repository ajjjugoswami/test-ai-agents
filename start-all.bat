@echo off
title JARVIS - Full Stack Launcher
echo ============================================
echo   JARVIS AI Agent - Starting All Services
echo ============================================
echo.

cd /d "%~dp0"

:: Start Backend
echo [1/4] Starting Backend...
cd ..\test-ai-agents-be
start "JARVIS-Backend" cmd /c "npm run start"
timeout /t 2 /nobreak >nul

:: Start Python Agent
echo [2/4] Starting Python Agent...
cd ..\ai-python-agents
start "JARVIS-Agent" cmd /c "python agent.py"
timeout /t 2 /nobreak >nul

:: Start Frontend Dev Server
echo [3/4] Starting Frontend...
cd ..\test-ai-agents
start "JARVIS-Frontend" cmd /c "npm run dev"
timeout /t 4 /nobreak >nul

:: Launch Floating Window
echo [4/4] Launching Floating Window...
call launch-jarvis.bat

echo.
echo ============================================
echo   All services started!
echo   Backend:  http://localhost:3001
echo   Frontend: http://localhost:5173
echo ============================================
echo.
echo Close this window when done. Services run in separate terminals.
pause
