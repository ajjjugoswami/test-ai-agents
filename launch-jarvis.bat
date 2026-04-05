@echo off
title JARVIS Floating Agent
echo ============================================
echo   JARVIS - Floating Agent Launcher
echo ============================================
echo.

:: Config
set FE_URL=http://localhost:5173
set WIDTH=420
set HEIGHT=720

:: Try Chrome first, then Edge
where chrome >nul 2>&1
if %errorlevel%==0 (
    echo Launching JARVIS as floating window (Chrome)...
    start "" chrome --app=%FE_URL% --window-size=%WIDTH%,%HEIGHT% --window-position=1450,50 --disable-extensions --user-data-dir="%TEMP%\jarvis-chrome"
    goto :done
)

where msedge >nul 2>&1
if %errorlevel%==0 (
    echo Launching JARVIS as floating window (Edge)...
    start "" msedge --app=%FE_URL% --window-size=%WIDTH%,%HEIGHT% --window-position=1450,50
    goto :done
)

echo No Chrome or Edge found. Opening in default browser...
start %FE_URL%

:done
echo.
echo JARVIS floating window launched!
echo Close this terminal or press any key to exit.
pause >nul
