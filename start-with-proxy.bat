@echo off
echo Starting Bunny Storage Proxy Server and React App...
echo.

REM Start proxy server in a new window
start "Bunny Proxy Server" cmd /k "cd server && yarn install && yarn start"

REM Wait a moment for proxy to start
timeout /t 3 /nobreak > nul

REM Start React app
echo Starting React app...
yarn start
