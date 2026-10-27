@echo off
title Smart Personal Finance & Subscription Tracker
cd /d "%~dp0"
echo ========================================================
echo   Starting Smart Finance Tracker (MongoDB Cloud Server)
echo ========================================================
echo.
echo Opening browser at http://localhost:5173...
echo.
start http://localhost:5173
npm run dev
pause
