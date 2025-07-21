@echo off
echo ====================================
echo   BDS VIETNAM - CAI DAT DEPENDENCIES
echo ====================================
echo.

echo [1/3] Cai dat Backend Dependencies...
cd /d "%~dp0\backend"
pip install -r requirements.txt
if %ERRORLEVEL% neq 0 (
    echo FAILED: Loi khi cai dat backend dependencies!
    pause
    exit /b 1
)
echo SUCCESS: Backend dependencies da duoc cai dat!
echo.

echo [2/3] Cai dat Frontend Dependencies...
cd /d "%~dp0\frontend"
npm install
if %ERRORLEVEL% neq 0 (
    echo FAILED: Loi khi cai dat frontend dependencies!
    pause
    exit /b 1
)
echo SUCCESS: Frontend dependencies da duoc cai dat!
echo.

echo [3/3] Tao du lieu demo...
cd /d "%~dp0"
python scripts\seed_demo_data.py
if %ERRORLEVEL% neq 0 (
    echo WARNING: Khong the tao du lieu demo (co the MongoDB chua chay)
    echo Ban co the chay lai sau: python scripts\seed_demo_data.py
) else (
    echo SUCCESS: Du lieu demo da duoc tao!
)
echo.

echo =====================================
echo   CAI DAT HOAN THANH!
echo =====================================
echo.
echo Gio ban co the chay website bang cach:
echo 1. Chay start_all.bat (khoi dong ca 2 server)
echo 2. Hoac chay rieng le:
echo    - start_backend.bat (Backend API)
echo    - start_frontend.bat (Frontend Web)
echo.
echo Website: http://localhost:3000
echo Admin: http://localhost:3000/admin/login
echo API Docs: http://localhost:8001/docs
echo.

pause