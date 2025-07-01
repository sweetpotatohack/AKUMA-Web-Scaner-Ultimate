#!/bin/bash

echo "🔥🔥🔥 AKUMA SCANNER v3.0 - STARTING UP 🔥🔥🔥"
echo "=============================================="

# Проверяем и устанавливаем инструменты
echo "[1/4] Checking and installing security tools..."
if [ ! -f "./install_tools.sh" ]; then
    echo "Error: install_tools.sh not found!"
    exit 1
fi

chmod +x ./install_tools.sh
./install_tools.sh

# Запускаем backend
echo "[2/4] Starting AKUMA Backend..."
cd backend
python3 -m pip install fastapi uvicorn requests pydantic
python3 app.py &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"
cd ..

# Ждем запуска backend
echo "[3/4] Waiting for backend to start..."
sleep 5

# Проверяем backend
curl -s http://127.0.0.1:8000/health > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Backend is running!"
else
    echo "❌ Backend failed to start!"
    exit 1
fi

# Запускаем frontend
echo "[4/4] Starting AKUMA Frontend..."
cd frontend
npm install
npm start &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"
cd ..

echo ""
echo "🎉 AKUMA SCANNER v3.0 IS READY! 🎉"
echo "=================================="
echo "📡 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8000"
echo "📊 API Docs: http://localhost:8000/docs"
echo ""
echo "Available Scan Types:"
echo "• QUICK_SCAN: Fast reconnaissance + critical vulns"
echo "• FULL_SPECTRUM: Deep penetration testing + fuzzing"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=================================="

# Функция для остановки всех процессов
cleanup() {
    echo ""
    echo "🛑 Stopping AKUMA Scanner..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "npm start" 2>/dev/null
    pkill -f "python3 app.py" 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Устанавливаем обработчик сигнала
trap cleanup SIGINT SIGTERM

# Ждем
wait
