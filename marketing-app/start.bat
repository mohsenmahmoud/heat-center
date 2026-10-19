@echo off
REM Double-click to install on first run and open the studio.
cd /d "%~dp0"
if not exist .env copy .env.example .env
if not exist node_modules call npm install
start "" http://localhost:5174
npm start
