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

echo Running eatifydash_run.vbs...
cscript //nologo eatifydash_run.vbs
echo eatifydash_run.vbs has been executed.
