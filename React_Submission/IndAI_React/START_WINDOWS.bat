@echo off
cd /d "%~dp0"
call npm run setup
if errorlevel 1 (pause & exit /b 1)
call npm run dev
pause
