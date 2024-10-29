@echo off
echo Instalando dependencias...
call npm install

echo.
echo Generando certificados...
call npm run cert:generate

echo.
echo Verificando certificados...
call npm run cert:verify

echo.
echo Instalación completada!
pause
