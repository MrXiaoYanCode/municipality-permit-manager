@echo off
cd /d "%~dp0.."
echo ============================================
echo  GitHub Login (GitHub CLI)
echo ============================================
echo.
"C:\Program Files\GitHub CLI\gh.exe" auth login -h github.com -p https -w
echo.
pause
