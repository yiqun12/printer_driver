@echo off
cd %~dp0

echo Installing Node.js...
msiexec /i "node-v20.10.0-x64.msi" /qn
echo Node.js has been installed.

call npm install
call npm install -g nodemon

rem Start your node application
cd %~dp0
start "" nodemon index.js

rem Start the shortcuts
start "" "%~dp0/server/win-unpacked/EatifyLocalHost.exe"
start "" "%~dp0/client/win-unpacked/EatifyLocalHost.exe"

