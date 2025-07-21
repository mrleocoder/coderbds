@echo off
echo =================================
echo   BDS VIETNAM - KHOI DONG FRONTEND
echo =================================
echo.

cd /d "%~dp0\frontend"

echo Dang khoi dong Frontend Server...
echo Website se chay tai: http://localhost:3000
echo Admin Panel tai: http://localhost:3000/admin/login
echo.
echo Nhan Ctrl+C de dung server
echo.

npm start

pause