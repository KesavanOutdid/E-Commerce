@echo off
title E-Commerce Platform Launcher
cd /d "%~dp0"
echo ===================================================
echo   Starting All E-Commerce Microservices...
echo ===================================================
node start-all.js
pause
