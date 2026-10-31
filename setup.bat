@echo off
title Install - AI Notes Quiz App
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Download the LTS version from https://nodejs.org , install it, then run this file again.
  pause
  exit /b 1
)
echo Installing backend packages...
cd /d "%~dp0server"
call npm install
echo.
echo Installing frontend packages...
cd /d "%~dp0client"
call npm install
echo.
echo ==================================================
echo Install finished.
echo NEXT: open server\.env and paste your MONGODB_URI and GEMINI_API_KEY.
echo THEN: double-click start.bat
echo ==================================================
pause
