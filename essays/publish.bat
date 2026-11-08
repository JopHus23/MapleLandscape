@echo off
cd /d "%~dp0.."
echo Publishing essays...
node scripts/publish.mjs essay
if %errorlevel% neq 0 ( echo FAILED! & pause & exit /b 1 )
git add -A
git commit -m "publish essay"
git push
echo Done!
pause
