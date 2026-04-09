@echo off
REM Start Backend Server - Creinx Attendance System
echo.
echo ========================================
echo  CREINX ATTENDANCE - BACKEND SERVER
echo ========================================
echo.
echo Starting backend server on port 5000...
echo.

cd /d "%~dp0"
node backend/server.js

pause
