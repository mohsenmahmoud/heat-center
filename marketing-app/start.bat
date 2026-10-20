@echo off
chcp 65001 >nul
title Qudra Marketing Studio
cd /d "%~dp0"

REM 1) Node.js must be installed (22.13 or newer).
where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo  [X] Node.js is not installed.
  echo      Download the LTS version from https://nodejs.org , install it, then run start.bat again.
  echo.
  start "" https://nodejs.org
  pause
  exit /b 1
)
node -e "const [a,b]=process.versions.node.split('.').map(Number);process.exit(a>22||(a===22&&b>=13)?0:1)"
if errorlevel 1 (
  echo.
  echo  [X] Your Node.js is too old. Install the latest LTS from https://nodejs.org , then run start.bat again.
  echo.
  pause
  exit /b 1
)

REM 2) First run: create .env and install packages.
if not exist .env copy .env.example .env >nul
REM Runs every time so updates that add packages just work (fast when nothing changed).
(
  echo  Checking packages...
  call npm install --no-audit --no-fund --loglevel=error
  if errorlevel 1 (
    echo  [X] npm install failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)

REM 3) Build the UI, open the browser once the server is up, and start.
echo  Building the app...
call npm run build --silent
if errorlevel 1 (
  echo  [X] Build failed. Send the messages above to support.
  pause
  exit /b 1
)
start "" cmd /c "timeout /t 3 >nul & start http://localhost:5174"
echo.
echo  Keep this window open while you use the app. Close it to stop.
node --disable-warning=ExperimentalWarning server\index.js
pause
