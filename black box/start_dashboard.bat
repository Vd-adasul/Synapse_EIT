@echo off
echo =================================_________=================================
echo   PROJECT SENTINEL : SURGICAL FLIGHT RECORDER
echo ===========================================================================
echo.
echo Starting local analytics server on http://localhost:8000
echo.
echo 1. Ensure you have run: python sentinel_engine.py
echo 2. Keep this window open while using the dashboard.
echo 3. Navigate to: http://localhost:8000/dashboard/index.html
echo.
python -m http.server 8000
pause
