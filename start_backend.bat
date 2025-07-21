@echo off
echo ================================
echo   BDS VIETNAM - KHOI DONG BACKEND
echo ================================
echo.

cd /d "%~dp0\backend"

echo Dang khoi dong Backend Server...
echo API se chay tai: http://localhost:8001
echo API Docs se chay tai: http://localhost:8001/docs
echo.
echo Nhan Ctrl+C de dung server
echo.

python server.py

pause