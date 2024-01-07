@echo off
cd %~dp0

echo Installing Node.js...
msiexec /i "node-v20.10.0-x64.msi" /qn
echo Node.js has been installed.

call npm install
call npm install -g nodemon
echo Stopping any Node.js application on port 3000...
for /f "tokens=5" %%a in ('netstat -aon ^| find "LISTENING" ^| find ":3000"') do (
    taskkill /F /PID %%a
)
echo Any existing Node.js application on port 3000 has been stopped.

rem Start your node application
cd %~dp0
start "" nodemon index.js
call npm start
