@echo off
echo =====================================
echo   BDS VIETNAM - KHOI DONG DAY DU
echo =====================================
echo.

echo Dang khoi dong Backend va Frontend...
echo.
echo Backend API: http://localhost:8001
echo Frontend Web: http://localhost:3000  
echo Admin Panel: http://localhost:3000/admin/login
echo.
echo Tai khoan Admin:
echo Username: admin
echo Password: admin123
echo.

REM Khoi dong backend trong tab moi
start "BDS Vietnam Backend" cmd /c "%~dp0start_backend.bat"

REM Doi 3 giay roi khoi dong frontend
timeout /t 3 /nobreak > nul

REM Khoi dong frontend trong tab moi
start "BDS Vietnam Frontend" cmd /c "%~dp0start_frontend.bat"

echo.
echo ===================================
echo CAC SERVER DANG CHAY:
echo - Backend: http://localhost:8001
echo - Frontend: http://localhost:3000
echo - Admin: http://localhost:3000/admin/login
echo ===================================
echo.

pause