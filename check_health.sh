#!/bin/bash

echo "🏥 AKUMA Scanner - Health Check"
echo "==============================="
echo ""

# Проверка контейнеров
echo "📦 Проверка контейнеров..."
if [ $(docker ps | grep akuma | wc -l) -eq 3 ]; then
    echo "✅ Все контейнеры запущены"
else
    echo "❌ Некоторые контейнеры не запущены"
    docker ps --format "table {{.Names}}\t{{.Status}}"
    exit 1
fi

echo ""

# Проверка API
echo "🔌 Проверка API..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend API отвечает"
else
    echo "❌ Backend API недоступен"
    exit 1
fi

# Проверка Frontend
echo "🌐 Проверка Frontend..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend доступен"
else
    echo "❌ Frontend недоступен"
    exit 1
fi

# Проверка Redis
echo "📊 Проверка Redis..."
if docker exec akuma_redis redis-cli ping | grep -q PONG; then
    echo "✅ Redis работает"
else
    echo "❌ Redis недоступен"
    exit 1
fi

echo ""

# Статистика
echo "📈 Текущая статистика:"
STATS=$(curl -s http://localhost:8000/api/stats)
echo "$STATS" | python3 -c "
import sys, json
try:
    data = json.loads(sys.stdin.read())
    print(f'  Total Scans: {data[\"total_scans\"]}')
    print(f'  Active Scans: {data[\"active_scans\"]}')
    print(f'  Vulnerabilities: {data[\"vulnerabilities_found\"]}')
    print(f'  Critical Issues: {data[\"critical_vulns\"]}')
except:
    print('  ❌ Не удалось получить статистику')
"

echo ""
echo "🎉 Все системы работают нормально!"
echo ""
echo "🔗 Доступные интерфейсы:"
echo "   Web UI: http://localhost:3000"
echo "   API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
