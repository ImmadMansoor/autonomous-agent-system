@echo off
setlocal

set "ROOT=%~dp0"

echo Starting MenuMind local sandbox...
echo.
echo Keep the two opened terminal windows running while you test localhost.
echo Closing them will stop the local website/API.
echo.

start "MenuMind Backend API :8000" /D "%ROOT%backend" cmd /k ".venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000"
timeout /t 2 /nobreak >nul
start "MenuMind Frontend :5173" /D "%ROOT%frontend" cmd /k "npm.cmd run dev"

echo Open http://127.0.0.1:5173 after the frontend terminal says Ready.
echo.
endlocal
