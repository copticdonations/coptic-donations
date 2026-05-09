@echo off
echo Starting Coptic Donations...
echo.

REM Remove stale DB lock if present
if exist "backend\db\coptic.sqlite3.lock" (
    rmdir /s /q "backend\db\coptic.sqlite3.lock"
    echo Cleared stale DB lock.
)

REM Seed DB if needed (safe - skips if already seeded)
echo Seeding database...
cd backend
node db/seed.js
cd ..

REM Start backend in new window
echo Starting backend on http://localhost:3001 ...
start "Coptic Donations - Backend" cmd /k "cd backend && node server.js"

REM Wait a moment for backend to start
timeout /t 2 /nobreak > nul

REM Start frontend in new window
echo Starting frontend on http://localhost:3000 ...
start "Coptic Donations - Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo   Admin:    http://localhost:3000/admin
echo   Track:    http://localhost:3000/tracking/lookup
echo.
echo Sample tracking codes: CPT-2026-AA01, CPT-2026-BB02, CPT-2026-CC03
echo.
pause
