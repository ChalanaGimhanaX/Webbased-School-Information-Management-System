@echo off
title SIMS - Stop Local Services
color 0C

echo ========================================================
echo   Stopping SIMS Local Development Servers
echo ========================================================
echo.

echo [1/2] Stopping process on port 8080 (Spring Boot)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
    echo       Terminated PID %%a on port 8080.
)

echo [2/2] Stopping process on port 5173 (Vite Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
    echo       Terminated PID %%a on port 5173.
)

echo.
echo ========================================================
echo   All SIMS local services have been stopped.
echo ========================================================
pause
