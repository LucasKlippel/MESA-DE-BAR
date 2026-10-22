@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Instale o Node.js 22 ou superior e abra este arquivo novamente.
 echo Site oficial: https://nodejs.org/
 pause
 exit /b 1
)
echo Abra http://localhost:3000 no navegador.
echo Mantenha esta janela aberta durante as partidas.
node server.mjs
pause
