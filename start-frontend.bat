@echo off
REM Start Frontend Server - Creinx Attendance System
echo.
echo ========================================
echo  CREINX ATTENDANCE - FRONTEND SERVER
echo ========================================
echo.
echo Starting frontend server on port 3000...
echo.

cd /d "%~dp0\frontend"
npm start

pause
