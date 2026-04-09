@echo off
title Creinx Attendance System

color 0A
echo.
echo ======================================================
echo  Creinx Attendance System - Startup Script
echo ======================================================
echo.

REM Change to project directory
cd /d "%~dp0"

REM Start Backend
echo [1/2] Starting Backend Server...
start /B "Creinx Backend" cmd /k "npm run dev"
timeout /t 3 /nobreak

REM Start Frontend
echo [2/2] Starting Frontend Server...
start /B "Creinx Frontend" cmd /k "cd frontend && npm start"
timeout /t 2 /nobreak

echo.
echo ======================================================
echo  SYSTEM STARTUP COMPLETE!
echo ======================================================
echo.
echo 📋 Frontend: http://localhost:3000
echo 🔌 Backend: http://localhost:5001/api
echo.
echo 🔐 Test Credentials:
echo    Admin: admin@company.com / admin123
echo    Employee: john@company.com / emp123
echo.
echo ⏹️  Close this window and the terminal windows to stop.
echo.
echo ======================================================
echo.

REM Keep window open
pause
