@echo off
cd %~dp0

echo Installing Node.js...
msiexec /i "node-v20.10.0-x64.msi" /qn
echo Node.js has been installed.

call npm install
call npm install -g nodemon
