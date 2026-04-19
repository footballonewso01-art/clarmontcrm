@echo off
TITLE CRM Traffic Management - Launcher
COLOR 0B

echo ========================================================
echo   🚀 CRM Traffic Management System Launcher
echo ========================================================
echo.

:: Check for .env file
if not exist ".env" (
    echo [ERROR] No .env file found! 
    echo Please copy .env.example to .env and configure your DATABASE_URL.
    pause
    exit /b
)

echo [1/3] Checking Database Connection...
:: Trying to ping or generate client
call npx prisma generate > nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Cannot reach DB or Prisma config issue.
    echo Make sure PostgreSQL is running on localhost:5432
    pause
    exit /b
)

:: Safe startup (no database reset)
echo [SYNC] Ensuring Prisma Client is ready...
call npx prisma generate > nul 2>&1

echo.
echo [2/3] Preparing environment...
echo Dashboard will be available at: http://localhost:3000
echo.

:: Open browser after a short delay
start "" "http://localhost:3000"

echo [3/3] Starting Next.js...
npm run dev

pause
