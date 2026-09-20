@echo off
setlocal enabledelayedexpansion
title Ask My Notes - Local AI
echo ========================================================
echo   Ask My Notes - Portable 1-Click Launcher
echo ========================================================
echo.

cd /d "%~dp0"

IF NOT EXIST "node_modules" (
    echo [Info] Dependencies missing. Running npm install...
    call npm install
    echo.
)

echo [1/3] Starting QVAC Local AI Engine Server...
start "Ask My Notes Backend" cmd /c "node server/index.js"

timeout /t 2 /nobreak >nul

echo [2/3] Starting Frontend Web Interface...
start "Ask My Notes Frontend" cmd /c "npm run dev"

timeout /t 2 /nobreak >nul

echo [3/3] Opening http://localhost:3000 in your browser...
start http://localhost:3000

echo.
echo ========================================================
echo   Success! App running live at http://localhost:3000
echo ========================================================
