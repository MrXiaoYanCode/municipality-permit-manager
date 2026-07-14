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

echo [4b/7] AI provider setup reminder...
echo   Gemini key:  https://aistudio.google.com/apikey  -^> GEMINI_API_KEY
echo   OpenRouter:  https://openrouter.ai/keys          -^> OPENROUTER_API_KEY
echo   OpenRouter tip: add $10 credits once to raise free limit 50 -^> 1000 req/day

echo [5/7] Installing npm dependencies...
call npm install
if errorlevel 1 exit /b 1

echo [6/7] Building project...
call npm run build
if errorlevel 1 exit /b 1

echo [7/7] Setup complete!
echo.
echo Next steps:
echo   1. Edit .env.local with Supabase, Stripe, Gemini, and OpenRouter keys
echo   2. Gemini:  https://aistudio.google.com/apikey  (free, no card)
echo   3. OpenRouter: https://openrouter.ai/keys (optional fallback)
echo   4. OpenRouter: add $10 credits before beta for 1000 free req/day
echo   5. Run: "%GH%" auth login
echo   6. Run: "%STRIPE%" login
echo   7. Push repo and deploy: vercel --prod
echo   8. Dev server: npm run dev
echo.
endlocal
