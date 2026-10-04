@echo off
title SIMS - School Information Management System Launcher
color 0A

echo ========================================================
echo   Starting SIMS (Wycherley International School)
echo ========================================================
echo.

:: 1. Verify / Set JAVA_HOME
if exist "C:\Users\Chalana\.jdks\jdk-21.0.12.1+1\bin\java.exe" (
    set "JAVA_HOME=C:\Users\Chalana\.jdks\jdk-21.0.12.1+1"
) else (
    echo [INFO] Using system JAVA_HOME: %JAVA_HOME%
)

:: 2. Ensure MySQL service is running
echo [1/3] Checking MySQL Service (MySQL80)...
sc query MySQL80 | find "RUNNING" >nul
if %ERRORLEVEL% equ 0 (
    echo       MySQL80 service is RUNNING.
) else (
    echo       Starting MySQL80 service...
    net start MySQL80 >nul 2>&1
)

:: 3. Start Backend in a dedicated window
echo [2/3] Launching Spring Boot Backend on http://localhost:8080...
start "SIMS Backend (Spring Boot :8080)" cmd /k "title SIMS Backend && cd /d "%~dp0server" && set PATH=%JAVA_HOME%\bin;%PATH% && mvnw.cmd spring-boot:run"

:: 4. Start Frontend in a dedicated window
echo [3/3] Launching React Vite Frontend on http://localhost:5173...
start "SIMS Frontend (React Vite :5173)" cmd /k "title SIMS Frontend && cd /d "%~dp0client" && npm run dev"

echo.
echo ========================================================
echo   Services are starting up!
echo ========================================================
echo   - Backend URL  : http://localhost:8080/api/v1
echo   - Frontend URL : http://localhost:5173
echo.
echo   Presentation Credentials:
echo   - Admin        : admin / admin123
echo   - Academic     : head_academic / academic123
echo   - Teacher      : teacher1 / teacher123
echo   - Student      : student1 / student123
echo   - Parent       : parent1 / parent123
echo ========================================================
echo.
echo Opening browser in 5 seconds...
timeout /t 5 /nobreak >nul
start http://localhost:5173
exit
