@echo off
cd /d "%~dp0.."
echo Publishing gallery images...
node scripts/publish.mjs gallery
if %errorlevel% neq 0 ( echo FAILED! & pause & exit /b 1 )
git add -A
git commit -m "publish images"
git push
echo Done!
pause
