#!/bin/bash

echo "🚀 Starting AKUMA Web Scanner..."
echo "================================="

# Переходим в директорию проекта
cd /root/AKUMA_Web_Scanner

# Убиваем старые процессы если есть
echo "🔄 Cleaning up old processes..."
pkill -f uvicorn 2>/dev/null
pkill -f "react-scripts" 2>/dev/null
sleep 2

# Запускаем бэкенд
echo "🔧 Starting backend server..."
nohup python3 -m uvicorn backend.app:app --host 0.0.0.0 --port 8001 > backend.log 2>&1 &
BACKEND_PID=$!

# Ждем запуска бэкенда
echo "⏳ Waiting for backend to start..."
sleep 5

# Проверяем бэкенд
if curl -s http://localhost:8001/api/stats > /dev/null; then
    echo "✅ Backend started successfully on port 8001"
else
    echo "❌ Backend failed to start"
    exit 1
fi

# Запускаем фронтенд
echo "🌐 Starting frontend server..."
cd frontend
nohup npm start > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# Ждем запуска фронтенда
echo "⏳ Waiting for frontend to start..."
sleep 15

# Проверяем фронтенд
if curl -s http://localhost:3000 | grep -q "AKUMA"; then
    echo "✅ Frontend started successfully on port 3000"
else
    echo "❌ Frontend failed to start"
fi

echo ""
echo "🎯 AKUMA Scanner is now running!"
echo "================================="
echo "📊 Dashboard: http://localhost:3000/dashboard"
echo "🛡️ Vulnerabilities: http://localhost:3000/vulnerabilities"
echo "📋 Reports: http://localhost:3000/reports"
echo "⚙️ Config: http://localhost:3000/config"
echo "🔍 API Docs: http://localhost:8001/docs"
echo ""
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "To stop: pkill -f uvicorn && pkill -f react-scripts"
echo "Logs: backend.log and frontend.log"

# Показываем статус
echo ""
echo "📈 Current Status:"
curl -s http://localhost:8001/api/stats | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    print(f'   Total Scans: {data.get(\"total_scans\", 0)}')
    print(f'   Active Scans: {data.get(\"active_scans\", 0)}')
    print(f'   Vulnerabilities: {data.get(\"vulnerabilities_found\", 0)}')
    print(f'   Critical Issues: {data.get(\"critical_vulns\", 0)}')
except:
    print('   Status: Starting...')
"
