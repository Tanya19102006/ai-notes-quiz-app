@echo off
title Start - AI Notes Quiz App
start "Backend (Express)" /d "%~dp0server" cmd /k npm run dev
start "Frontend (React)" /d "%~dp0client" cmd /k npm run dev
timeout /t 6 /nobreak >nul
start http://localhost:5173
