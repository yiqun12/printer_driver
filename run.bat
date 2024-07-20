@echo off
cd %~dp0

echo Checking if Node.js is installed...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Node.js...
    msiexec /i "node-v20.10.0-x64.msi" /qn
    echo Node.js has been installed.
) else (
    echo Node.js is already installed.
)
call npm install

call npm install -g nodemon
echo Stopping any Node.js application on port 3001...
for /f "tokens=5" %%a in ('netstat -aon ^| find "LISTENING" ^| find ":3001"') do (
    taskkill /F /PID %%a
)
echo Any existing Node.js application on port 3001 has been stopped.

rem Start your node application
cd %~dp0
start "" nodemon index.js
