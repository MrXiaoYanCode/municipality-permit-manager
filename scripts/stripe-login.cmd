@echo off
cd /d "%~dp0.."
echo ============================================
echo  Stripe CLI Login
echo ============================================
echo.
"C:\Users\User\AppData\Local\Microsoft\WinGet\Packages\Stripe.StripeCli_Microsoft.Winget.Source_8wekyb3d8bbwe\stripe.exe" login
echo.
pause
