@echo off
title SIMS - School Information Management System Launcher
echo =====================================================================
echo  SE2030 - School Information Management System (SIMS)
echo  UC-06: Fee & Payment Management Module
echo =====================================================================
echo.

set PATH=C:\Program Files\nodejs;C:\Program Files\MySQL\MySQL Server 8.4\bin;%PATH%

echo [1/4] Checking MySQL Service (MySQL84)...
sc query MySQL84 | find "RUNNING" >nul
if %ERRORLEVEL% equ 0 (
    echo       MySQL84 service is RUNNING.
) else (
    echo       Starting MySQL84 service...
    net start MySQL84
)
echo.

echo [2/4] Ensuring Port 8080 is free...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8080" ^| findstr "LISTENING"') do (
    echo       Stopping previous process on port 8080 (PID: %%a)...
    taskkill /F /PID %%a >nul 2>&1
)
echo       Port 8080 is ready.
echo.

echo [3/4] Starting Spring Boot Backend on http://localhost:8080 ...
start "SIMS Backend (Spring Boot :8080)" cmd /k "cd server && mvnw.cmd spring-boot:run"
echo       Backend launcher spawned in separate window.
echo.

echo [4/4] Starting React Frontend on http://localhost:5173 ...
start "SIMS Frontend (Vite :5173)" cmd /k "cd client && npm.cmd run dev"
echo       Frontend launcher spawned in separate window.
echo.

echo =====================================================================
echo  System is starting up!
echo  - Backend API: http://localhost:8080
echo  - Web Portal:  http://localhost:5173
echo  - Database:    sim_system_db (MySQL localhost:3306)
echo =====================================================================
echo.
pause
