@echo off
setlocal EnableDelayedExpansion

echo ============================================
echo  PermitFlow - Setup Script (CMD)
echo ============================================
echo.

set "GH=C:\Program Files\GitHub CLI\gh.exe"
set "STRIPE=C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\Stripe.StripeCli_Microsoft.Winget.Source_8wekyb3d8bbwe\stripe.exe"
set "ROOT=%~dp0.."
cd /d "%ROOT%"

echo [1/7] Checking GitHub CLI...
"%GH%" --version || (echo ERROR: GitHub CLI not found & exit /b 1)

echo [2/7] Checking Stripe CLI...
"%STRIPE%" --version || (echo ERROR: Stripe CLI not found & exit /b 1)

echo [3/7] Checking GitHub auth...
"%GH%" auth status
if errorlevel 1 (
    echo.
    echo GitHub not authenticated. Run:
    echo   "%GH%" auth login
    echo.
)

echo [4/7] Ensuring .env.local exists...
if not exist ".env.local" copy /Y ".env.example" ".env.local"

echo [5/7] Installing npm dependencies...
call npm install
if errorlevel 1 exit /b 1

echo [6/7] Building project...
call npm run build
if errorlevel 1 exit /b 1

echo [7/7] Setup complete!
echo.
echo Next steps:
echo   1. Edit .env.local with your Supabase, Stripe, and OpenAI keys
echo   2. Run: "%GH%" auth login
echo   3. Run: "%STRIPE%" login
echo   4. Push repo: "%GH%" repo create municipality-permit-manager --private --source=. --remote=origin --push
echo   5. Deploy: vercel --prod
echo   6. Dev server: npm run dev
echo.
endlocal
