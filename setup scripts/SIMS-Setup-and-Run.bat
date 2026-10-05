@echo off
:: =====================================================================
::  SIMS - One-Click Setup and Launcher (Wycherley International School)
:: ---------------------------------------------------------------------
::  Works on a brand-new Windows 10/11 (64-bit) PC with NOTHING installed.
::  Everything is downloaded as PORTABLE software into ".runtime\" next
::  to this file - no admin rights, no installers, nothing added to the
::  system PATH. Delete the ".runtime" folder to remove it all.
::
::    Java 21 (Eclipse Temurin)  - runs the Spring Boot backend
::    Node.js 24                 - runs the React (Vite) frontend
::    MariaDB 11.4               - MySQL-compatible database server
::
::  Usage:
::    SIMS-Setup-and-Run.bat           setup (first time) + start everything
::    SIMS-Setup-and-Run.bat h2        use the built-in H2 file database instead
::    SIMS-Setup-and-Run.bat stop      stop backend, frontend and database
::    SIMS-Setup-and-Run.bat reset     stop + wipe the database (fresh demo data)
::    SIMS-Setup-and-Run.bat key       change the Gemini API key (AI Study Buddy)
:: =====================================================================
setlocal EnableExtensions DisableDelayedExpansion
title SIMS - One-Click Setup and Launcher
color 0B
cd /d "%~dp0"

:: ---------- Pinned versions / settings ----------
set "JDK_URL=https://api.adoptium.net/v3/binary/latest/21/ga/windows/x64/jdk/hotspot/normal/eclipse"
set "NODE_VERSION=v24.11.0"
set "MARIADB_VERSION=11.4.4"
set "REPO_ZIP_URL=https://github.com/ChalanaGimhanaX/Webbased-School-Information-Management-System/archive/refs/heads/main.zip"
set "DB_PORT=3307"
set "DB_NAME=sim_system_db"
set "DB_PASSWORD=sims_local_2026"
set "BACKEND_PORT=8080"
set "FRONTEND_PORT=5173"

set "BAT_DIR=%~dp0"
set "ROOT=%~dp0"
set "RT=%BAT_DIR%.runtime"
set "DL=%RT%\downloads"
set "TAR=%SystemRoot%\System32\tar.exe"
set "PS=powershell -NoProfile -ExecutionPolicy Bypass -Command"

set "ARG=%~1"
set "DB_MODE=mariadb"
if /i "%ARG%"=="h2" set "DB_MODE=h2"
if /i "%ARG%"=="help" goto :help
if /i "%ARG%"=="/?" goto :help
if /i "%ARG%"=="stop" goto :stop_all
if /i "%ARG%"=="reset" goto :reset
if /i "%ARG%"=="key" set "SIMS_FORCE_KEY=1"
if /i "%ARG%"=="key" if exist "%RT%\sims-config.cmd" del /q "%RT%\sims-config.cmd"

call :banner

:: ---------- Pre-flight ----------
if /i not "%PROCESSOR_ARCHITECTURE%"=="AMD64" if /i not "%PROCESSOR_ARCHITEW6432%"=="AMD64" (
    echo [WARN] This PC is not 64-bit x64 - %PROCESSOR_ARCHITECTURE%. Windows on ARM can usually emulate it, continuing...
)
if not exist "%RT%" mkdir "%RT%"
if not exist "%DL%" mkdir "%DL%"

call :ensure_project || goto :fail

echo.
echo [1/6] Java 21 runtime
call :ensure_jdk || goto :fail

echo.
echo [2/6] Node.js runtime
call :ensure_node || goto :fail

set "PATH=%JAVA_HOME%\bin;%NODE_HOME%;%PATH%"

echo.
echo [3/6] Database
if /i "%DB_MODE%"=="mariadb" call :ensure_mariadb
if /i "%DB_MODE%"=="mariadb" call :start_mariadb
if /i "%DB_MODE%"=="h2" call :use_h2

echo.
echo [4/6] AI Study Buddy key
if not exist "%RT%\sims-config.cmd" call :ask_gemini
call "%RT%\sims-config.cmd"
if defined GEMINI_API_KEY (echo       Gemini key loaded - AI Study Buddy enabled.) else (echo       No key - AI Study Buddy will show "not configured". Run with "key" to add one.)

echo.
echo [5/6] Frontend packages
call :ensure_npm || goto :fail

echo.
echo [6/6] Starting SIMS
call :free_port %BACKEND_PORT% || goto :fail
call :free_port %FRONTEND_PORT% || goto :fail

echo       Starting backend window  (Spring Boot :%BACKEND_PORT%) ...
start "SIMS Backend (Spring Boot :%BACKEND_PORT%) - close to stop" /d "%ROOT%server" cmd /k ""%ROOT%server\mvnw.cmd" spring-boot:run"
echo       Starting frontend window (React Vite :%FRONTEND_PORT%) ...
start "SIMS Frontend (Vite :%FRONTEND_PORT%) - close to stop" /d "%ROOT%client" cmd /k ""%NODE_HOME%\npm.cmd" run dev -- --port %FRONTEND_PORT% --strictPort"

echo.
echo       Waiting for the backend to finish starting.
echo       FIRST RUN downloads Maven + libraries and can take 5-10 minutes...
call :wait_port %BACKEND_PORT% 1200
if errorlevel 1 (
    echo [WARN] Backend did not open port %BACKEND_PORT% yet. Check the "SIMS Backend" window for errors.
) else (
    echo       Backend is up.
)
call :wait_port %FRONTEND_PORT% 120 >nul

call :summary
if not defined SIMS_NO_BROWSER start "" "http://localhost:%FRONTEND_PORT%"
echo.
echo  This window can be closed - SIMS keeps running in its own windows.
echo  To stop everything later run:  SIMS-Setup-and-Run.bat stop
echo.
if not defined SIMS_NONINTERACTIVE pause
endlocal
exit /b 0


:: =====================================================================
::  Subroutines
:: =====================================================================

:banner
echo.
echo  ================================================================
echo    SIMS - School Information Management System
echo    Wycherley International School, Gampaha  -  One-Click Setup
echo  ================================================================
echo    Portable tools folder: %RT%
echo    Database mode        : %DB_MODE%
echo  ================================================================
exit /b 0

:help
echo.
echo  SIMS-Setup-and-Run.bat           setup (first time) + start everything
echo  SIMS-Setup-and-Run.bat h2        use the embedded H2 file database (no MariaDB)
echo  SIMS-Setup-and-Run.bat stop      stop backend, frontend and database
echo  SIMS-Setup-and-Run.bat reset     stop + delete the database (fresh demo data)
echo  SIMS-Setup-and-Run.bat key       change the Gemini API key
echo.
exit /b 0

:fail
echo.
echo  ****************************************************************
echo   SETUP FAILED - read the message above.
echo   Common fixes: check the internet connection, make sure there is
echo   ~2 GB of free disk space, then run this file again. Downloads
echo   that already finished are reused.
echo  ****************************************************************
if not defined SIMS_NONINTERACTIVE pause
endlocal
exit /b 1

:: ---------- download <url> <outfile> <label> ----------
:download
set "_URL=%~1"
set "_OUT=%~2"
echo       Downloading %~3 ...
if exist "%_OUT%.part" del /q "%_OUT%.part"
curl.exe -L --fail --retry 3 --retry-delay 3 --progress-bar -o "%_OUT%.part" "%_URL%"
if errorlevel 1 (
    echo       curl unavailable or failed - retrying with PowerShell...
    %PS% "$ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -UseBasicParsing -Uri $env:_URL -OutFile ($env:_OUT + '.part')"
)
if not exist "%_OUT%.part" (
    echo [ERROR] Could not download %~3 from %_URL%
    exit /b 1
)
move /y "%_OUT%.part" "%_OUT%" >nul
exit /b 0

:: ---------- extract <zip> <destdir> ----------
:extract
set "_ZIP=%~1"
set "_DEST=%~2"
echo       Extracting %~nx1 ...
if not exist "%_DEST%" mkdir "%_DEST%"
if exist "%TAR%" "%TAR%" -xf "%_ZIP%" -C "%_DEST%" 2>nul && exit /b 0
%PS% "Expand-Archive -LiteralPath $env:_ZIP -DestinationPath $env:_DEST -Force"
if errorlevel 1 (
    echo [ERROR] Could not extract %_ZIP% - the download may be corrupt. Deleting it, run again.
    del /q "%_ZIP%" 2>nul
    exit /b 1
)
exit /b 0

:: ---------- find_dir <base> <relative-file> <outvar> ----------
:find_dir
set "%~3="
if not exist "%~1" exit /b 0
for /d %%D in ("%~1\*") do if exist "%%~fD\%~2" set "%~3=%%~fD"
exit /b 0

:: ---------- project source (download if this .bat is standalone) ----------
:ensure_project
if exist "%ROOT%server\pom.xml" if exist "%ROOT%client\package.json" exit /b 0
if exist "%BAT_DIR%SIMS\server\pom.xml" (
    set "ROOT=%BAT_DIR%SIMS\"
    exit /b 0
)
echo.
echo [0/6] Project source code not found next to this file - downloading it from GitHub...
call :download "%REPO_ZIP_URL%" "%DL%\sims-source.zip" "SIMS source code" || exit /b 1
call :extract "%DL%\sims-source.zip" "%RT%\source" || exit /b 1
call :find_dir "%RT%\source" "server\pom.xml" _SRC
if not defined _SRC (
    echo [ERROR] Downloaded archive does not contain the SIMS project.
    exit /b 1
)
move "%_SRC%" "%BAT_DIR%SIMS" >nul || exit /b 1
set "ROOT=%BAT_DIR%SIMS\"
echo       Source code placed in %BAT_DIR%SIMS
exit /b 0

:: ---------- Java ----------
:ensure_jdk
call :find_dir "%RT%\jdk" "bin\java.exe" JAVA_HOME
if not defined JAVA_HOME (
    call :download "%JDK_URL%" "%DL%\jdk21.zip" "Java 21 - about 200 MB" || exit /b 1
    call :extract "%DL%\jdk21.zip" "%RT%\jdk" || exit /b 1
    call :find_dir "%RT%\jdk" "bin\java.exe" JAVA_HOME
)
if not defined JAVA_HOME (
    echo [ERROR] Java was not found after extraction.
    exit /b 1
)
"%JAVA_HOME%\bin\java.exe" -version >nul 2>&1 || (echo [ERROR] Java failed to run. & exit /b 1)
echo       Java ready: %JAVA_HOME%
exit /b 0

:: ---------- Node.js ----------
:ensure_node
set "NODE_HOME=%RT%\node\node-%NODE_VERSION%-win-x64"
if not exist "%NODE_HOME%\node.exe" (
    call :download "https://nodejs.org/dist/%NODE_VERSION%/node-%NODE_VERSION%-win-x64.zip" "%DL%\node-%NODE_VERSION%.zip" "Node.js %NODE_VERSION% - about 35 MB" || exit /b 1
    call :extract "%DL%\node-%NODE_VERSION%.zip" "%RT%\node" || exit /b 1
)
if not exist "%NODE_HOME%\node.exe" (
    echo [ERROR] Node.js was not found after extraction.
    exit /b 1
)
echo       Node.js ready: %NODE_HOME%
exit /b 0

:: ---------- MariaDB (portable, MySQL compatible) ----------
:ensure_mariadb
set "MDB_HOME=%RT%\mariadb\mariadb-%MARIADB_VERSION%-winx64"
if not exist "%MDB_HOME%\bin\mariadb-install-db.exe" (
    call :download "https://archive.mariadb.org/mariadb-%MARIADB_VERSION%/winx64-packages/mariadb-%MARIADB_VERSION%-winx64.zip" "%DL%\mariadb-%MARIADB_VERSION%.zip" "MariaDB %MARIADB_VERSION% - about 90 MB"
    if exist "%DL%\mariadb-%MARIADB_VERSION%.zip" call :extract "%DL%\mariadb-%MARIADB_VERSION%.zip" "%RT%\mariadb"
)
if not exist "%MDB_HOME%\bin\mariadb-install-db.exe" (
    echo [WARN] MariaDB could not be prepared - falling back to the embedded H2 database.
    set "DB_MODE=h2"
)
exit /b 0

:start_mariadb
if /i not "%DB_MODE%"=="mariadb" exit /b 0
set "DBDATA=%RT%\data\mariadb"
if not exist "%RT%\data" mkdir "%RT%\data"
if not exist "%DBDATA%\my.ini" (
    echo       Creating a new database server data folder ...
    if exist "%DBDATA%" rd /s /q "%DBDATA%"
    "%MDB_HOME%\bin\mariadb-install-db.exe" --datadir="%DBDATA%" --password=%DB_PASSWORD% --port=%DB_PORT% >"%RT%\mariadb-install.log" 2>&1
    if not exist "%DBDATA%\my.ini" (
        echo [WARN] MariaDB initialisation failed - see .runtime\mariadb-install.log. Falling back to H2.
        goto :use_h2
    )
)
call :port_pid %DB_PORT%
if defined _PID (
    echo       MariaDB already running on port %DB_PORT%.
) else (
    echo       Starting MariaDB on 127.0.0.1:%DB_PORT% - minimised window "SIMS Database" ...
    start "SIMS Database (MariaDB :%DB_PORT%) - keep open" /min "%MDB_HOME%\bin\mariadbd.exe" --defaults-file="%DBDATA%\my.ini" --bind-address=127.0.0.1 --console
    call :wait_port %DB_PORT% 90
    if errorlevel 1 (
        echo [WARN] MariaDB did not start - falling back to H2.
        goto :use_h2
    )
)
set "SPRING_DATASOURCE_URL=jdbc:mysql://127.0.0.1:%DB_PORT%/%DB_NAME%?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
set "SPRING_DATASOURCE_USERNAME=root"
set "SPRING_DATASOURCE_PASSWORD=%DB_PASSWORD%"
set "SPRING_DATASOURCE_DRIVER_CLASS_NAME=com.mysql.cj.jdbc.Driver"
set "SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.MariaDBDialect"
echo       MariaDB ready - database "%DB_NAME%" (root / %DB_PASSWORD%, port %DB_PORT%)
exit /b 0

:: ---------- H2 file database (zero download fallback) ----------
:use_h2
set "DB_MODE=h2"
if not exist "%RT%\data\h2" mkdir "%RT%\data\h2"
set "H2_FILE=%RT:\=/%/data/h2/sims"
set "SPRING_DATASOURCE_URL=jdbc:h2:file:%H2_FILE%;MODE=MySQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE"
set "SPRING_DATASOURCE_USERNAME=sa"
set "SPRING_DATASOURCE_PASSWORD=%DB_PASSWORD%"
set "SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.h2.Driver"
set "SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.H2Dialect"
set "SPRING_H2_CONSOLE_ENABLED=true"
echo       Using embedded H2 database file: .runtime\data\h2\sims.mv.db
exit /b 0

:: ---------- Gemini key ----------
:ask_gemini
set "GEMINI_KEY_INPUT="
if not defined SIMS_FORCE_KEY if defined GEMINI_API_KEY goto :ask_gemini_existing
if defined SIMS_NONINTERACTIVE goto :ask_gemini_save
echo       The Student "AI Study Buddy" uses a free Google Gemini API key.
echo       Get one at https://aistudio.google.com/apikey - or just press Enter to skip.
set /p "GEMINI_KEY_INPUT=      Gemini API key: "
:ask_gemini_save
if defined GEMINI_KEY_INPUT (
    > "%RT%\sims-config.cmd" echo @set "GEMINI_API_KEY=%GEMINI_KEY_INPUT%"
) else (
    > "%RT%\sims-config.cmd" echo @rem No Gemini key saved. Run "SIMS-Setup-and-Run.bat key" to add one.
)
exit /b 0
:ask_gemini_existing
echo       Using the GEMINI_API_KEY already set on this computer.
> "%RT%\sims-config.cmd" echo @rem Using the system GEMINI_API_KEY environment variable.
exit /b 0

:: ---------- npm packages ----------
:ensure_npm
set "_NEED_NPM="
if not exist "%ROOT%client\node_modules\.bin\vite.cmd" set "_NEED_NPM=1"
if not exist "%ROOT%client\node_modules\.sims-lock" set "_NEED_NPM=1"
if not defined _NEED_NPM fc /b "%ROOT%client\package-lock.json" "%ROOT%client\node_modules\.sims-lock" >nul 2>&1 || set "_NEED_NPM=1"
if not defined _NEED_NPM (
    echo       Frontend packages already installed.
    exit /b 0
)
echo       Installing frontend packages - first time takes a few minutes ...
pushd "%ROOT%client"
call "%NODE_HOME%\npm.cmd" install --no-audit --no-fund --loglevel=error
set "_NPM_RC=%ERRORLEVEL%"
popd
if not "%_NPM_RC%"=="0" (
    echo [ERROR] npm install failed.
    exit /b 1
)
copy /y "%ROOT%client\package-lock.json" "%ROOT%client\node_modules\.sims-lock" >nul
echo       Frontend packages installed.
exit /b 0

:: ---------- port helpers ----------
:port_pid
set "_PID="
for /f "tokens=5" %%P in ('netstat -ano ^| findstr /r /c:":%~1 .*LISTENING"') do set "_PID=%%P"
exit /b 0

:free_port
call :port_pid %~1
if not defined _PID exit /b 0
set "_PNAME=unknown"
for /f "tokens=1 delims=," %%N in ('tasklist /fi "PID eq %_PID%" /fo csv /nh 2^>nul') do set "_PNAME=%%~N"
echo       Port %~1 is in use by %_PNAME% - PID %_PID%. Probably an earlier SIMS run.
if defined SIMS_NONINTERACTIVE goto :free_port_kill
choice /c YN /m "      Stop it so SIMS can use the port"
if errorlevel 2 (
    echo [ERROR] Port %~1 is busy. Close that program and run again.
    exit /b 1
)
:free_port_kill
taskkill /f /t /pid %_PID% >nul 2>&1
timeout /t 2 /nobreak >nul
exit /b 0

:wait_port
%PS% "$d=(Get-Date).AddSeconds(%~2); while((Get-Date) -lt $d){ foreach($h in '127.0.0.1','::1'){ try { $a=[Net.IPAddress]::Parse($h); $c=New-Object Net.Sockets.TcpClient($a.AddressFamily); $c.Connect($a,%~1); $c.Close(); exit 0 } catch {} }; Start-Sleep -Milliseconds 1000 }; exit 1"
exit /b %ERRORLEVEL%

:: ---------- stop / reset ----------
:stop_all
echo.
echo  Stopping SIMS ...
for %%X in (%FRONTEND_PORT% %BACKEND_PORT%) do call :kill_port %%X
set "MDB_HOME=%RT%\mariadb\mariadb-%MARIADB_VERSION%-winx64"
call :port_pid %DB_PORT%
if defined _PID if exist "%MDB_HOME%\bin\mariadb-admin.exe" (
    "%MDB_HOME%\bin\mariadb-admin.exe" -uroot -p%DB_PASSWORD% -h127.0.0.1 -P%DB_PORT% shutdown >nul 2>&1
    echo       MariaDB stopped.
)
call :port_pid %DB_PORT%
if defined _PID call :kill_port %DB_PORT%
echo  All SIMS services stopped.
if /i "%ARG%"=="reset" exit /b 0
if not defined SIMS_NONINTERACTIVE pause
endlocal
exit /b 0

:kill_port
call :port_pid %~1
if not defined _PID exit /b 0
taskkill /f /t /pid %_PID% >nul 2>&1
echo       Stopped process on port %~1 - PID %_PID%.
exit /b 0

:reset
call :stop_all
timeout /t 3 /nobreak >nul
if exist "%RT%\data" rd /s /q "%RT%\data"
echo  Database wiped. The next start re-creates it with fresh demo data.
if not defined SIMS_NONINTERACTIVE pause
endlocal
exit /b 0

:: ---------- final summary ----------
:summary
echo.
echo  ================================================================
echo    SIMS IS RUNNING
echo  ================================================================
echo    Web portal  : http://localhost:%FRONTEND_PORT%
echo    Backend API : http://localhost:%BACKEND_PORT%/api/v1
if /i "%DB_MODE%"=="mariadb" echo    Database    : MariaDB 127.0.0.1:%DB_PORT%  db=%DB_NAME%  user=root  pass=%DB_PASSWORD%
if /i "%DB_MODE%"=="h2" echo    Database    : H2 file  - console http://localhost:%BACKEND_PORT%/h2-console
echo.
echo    Demo logins:
echo      Admin            admin          / admin123
echo      Head of Academic head_academic  / academic123
echo      Teacher          teacher1       / teacher123
echo      Student          student1       / student123
echo      Parent           parent1        / parent123
echo  ================================================================
exit /b 0
