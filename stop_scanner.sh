#!/bin/bash

echo "🛑 Stopping AKUMA Web Scanner..."
echo "================================="

# Останавливаем процессы
echo "🔄 Stopping backend..."
pkill -f uvicorn

echo "🔄 Stopping frontend..." 
pkill -f "react-scripts"

# Ждем завершения
sleep 3

# Проверяем что процессы остановлены
if pgrep -f uvicorn > /dev/null; then
    echo "⚠️ Backend still running, force killing..."
    pkill -9 -f uvicorn
fi

if pgrep -f "react-scripts" > /dev/null; then
    echo "⚠️ Frontend still running, force killing..."
    pkill -9 -f "react-scripts"
fi

echo "✅ AKUMA Scanner stopped"
echo ""
echo "To restart: ./start_scanner.sh"
