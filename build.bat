@echo off
echo Building 7Dollar Printer Driver...

REM 安装依赖
npm install

REM 构建应用
npm run build

echo Build complete!
pause 