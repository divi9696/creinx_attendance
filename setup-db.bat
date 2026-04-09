@echo off
REM Setup Database - Creinx Attendance System
echo.
echo ========================================
echo  CREINX ATTENDANCE - DATABASE SETUP
echo ========================================
echo.
echo Setting up MySQL database...
echo.

cd /d "%~dp0"
node setup.js

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================
    echo SUCCESS! Database setup complete
    echo ========================================
    echo.
    echo Next steps:
    echo 1. Run: start-backend.bat (in new window)
    echo 2. Run: start-frontend.bat (in another new window)
    echo 3. Open: http://localhost:3000
    echo.
    echo Login credentials:
    echo   Admin: admin@company.com / admin123
    echo   Employee: john@company.com / emp123
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR! Database setup failed
    echo ========================================
    echo.
    echo Please check:
    echo 1. MySQL is running
    echo 2. .env file has correct DB_PASSWORD
    echo 3. MySQL user 'root' exists
    echo.
)

pause
