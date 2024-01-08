::[Bat To Exe Converter]
::
::YAwzoRdxOk+EWAjk
::fBw5plQjdCyDJGyX8VAjFAJdWA+XAE+1EbsQ5+n//NaBo1sUV+0xR5/a2b+PJ+Us/BWqJMAR0HtMkcgDAlVRfR3L
::YAwzuBVtJxjWCl3EqQJgSA==
::ZR4luwNxJguZRRnk
::Yhs/ulQjdF+5
::cxAkpRVqdFKZSzk=
::cBs/ulQjdF+5
::ZR41oxFsdFKZSDk=
::eBoioBt6dFKZSDk=
::cRo6pxp7LAbNWATEpCI=
::egkzugNsPRvcWATEpCI=
::dAsiuh18IRvcCxnZtBJQ
::cRYluBh/LU+EWAnk
::YxY4rhs+aU+JeA==
::cxY6rQJ7JhzQF1fEqQJQ
::ZQ05rAF9IBncCkqN+0xwdVs0
::ZQ05rAF9IAHYFVzEqQJQ
::eg0/rx1wNQPfEVWB+kM9LVsJDGQ=
::fBEirQZwNQPfEVWB+kM9LVsJDGQ=
::cRolqwZ3JBvQF1fEqQJQ
::dhA7uBVwLU+EWDk=
::YQ03rBFzNR3SWATElA==
::dhAmsQZ3MwfNWATElA==
::ZQ0/vhVqMQ3MEVWAtB9wSA==
::Zg8zqx1/OA3MEVWAtB9wSA==
::dhA7pRFwIByZRRnk
::Zh4grVQjdCyDJGyX8VAjFAJdWA+XAE+/Fb4I5/jH3/iOrFkYRt0YcZvTz7ayMPIa5FHhZ6kpxHNMndkwJRVLahOnYkExsWsi
::YB416Ek+ZG8=
::
::
::978f952a14a936cc963da21a135fa983
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
