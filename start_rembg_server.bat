@echo off
REM 로컬 배경 제거 서버 시작 스크립트

echo ========================================
echo 누끼따기(배경 제거) 로컬 서버 시작
echo ========================================

REM 가상환경 활성화
call venv\Scripts\activate.bat

REM Python 서버 시작
echo.
echo Python rembg 서버를 포트 5000에서 시작하고 있습니다...
echo API: http://127.0.0.1:5000/remove-bg
echo.
python rembg_server.py

pause
