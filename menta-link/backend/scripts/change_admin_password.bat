@echo off
setlocal
set POSTGRES_PASSWORD=postgresql
..\.venv\Scripts\python.exe change_admin_password.py
pause
