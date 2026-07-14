@echo off
setlocal

set "STRIPE=C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\Stripe.StripeCli_Microsoft.Winget.Source_8wekyb3d8bbwe\stripe.exe"
set "GH=C:\Program Files\GitHub CLI\gh.exe"
set "ROOT=%~dp0.."
cd /d "%ROOT%"

echo ============================================
echo  PermitFlow - Stripe Webhook Listener
echo ============================================
echo.
echo This forwards Stripe events to your local app.
echo Copy the whsec_... secret shown below into .env as STRIPE_WEBHOOK_SECRET
echo.
echo Press Ctrl+C to stop.
echo.

"%STRIPE%" listen --forward-to localhost:3000/api/webhooks/stripe

endlocal
