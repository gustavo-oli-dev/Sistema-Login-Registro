@echo off
chcp 65001 >nul
color 0A
title Sistema de Login e Registro
cls

echo.
echo ======================================
echo    Sistema de Login e Registro
echo ======================================
echo.
echo Iniciando Backend (Flask) e Frontend (React)...
echo.

REM Iniciar Backend em uma nova janela
start cmd /k "cd api && python index.py"

REM Aguardar um pouco para o backend iniciar
timeout /t 3 /nobreak

REM Iniciar Frontend em uma nova janela
start cmd /k "cd frontend && npm start"

REM Aguardar o frontend iniciar completamente
timeout /t 8 /nobreak

REM Abrir o navegador Chrome
start chrome http://localhost:3000

echo.
echo ======================================
echo    Servicos iniciados com sucesso!
echo ======================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Pressione qualquer tecla para sair...
pause >nul
exit
