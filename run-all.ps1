# E-Commerce Platform Launcher PowerShell Script
Set-Location $PSScriptRoot
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  Starting All E-Commerce Microservices..." -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
node start-all.js
