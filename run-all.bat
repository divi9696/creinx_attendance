@echo off
REM Complete Setup and Startup - Creinx Attendance System
setlocal enabledelayedexpansion

echo.
echo ================================================
echo   CREINX ATTENDANCE SYSTEM - COMPLETE SETUP
echo ================================================
echo.

REM Check if MySQL password is set
findstr /R "DB_PASSWORD=" "%~dp0.env" >nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: .env file not found!
    goto error
)

REM Extract password from .env
for /f "tokens=2 delims==" %%a in ('findstr "DB_PASSWORD=" "%~dp0.env"') do (
    set DB_PASS=%%a
)

echo [Step 1/3] Setting up database...
cd /d "%~dp0"
node setup.js

if %ERRORLEVEL% neq 0 (
    echo Failed to setup database. Please check .env file.
    goto error
)

echo.
echo [Step 2/3] Starting backend server...
start "Backend Server" cmd /k "cd /d "%~dp0" && node backend/server.js"
timeout /t 2

echo.
echo [Step 3/3] Starting frontend server...
start "Frontend Server" cmd /k "cd /d "%~dp0\frontend" && npm start"
timeout /t 3

echo.
echo ================================================
echo   SETUP COMPLETE!
echo ================================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Login with:
echo   Admin: admin@company.com / admin123
echo   Employee: john@company.com / emp123
echo.
goto end

:error
echo.
echo ERROR OCCURRED - Press any key for details...
pause
:end
