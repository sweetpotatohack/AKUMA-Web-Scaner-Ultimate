#!/bin/bash

echo "🛑 AKUMA Web Scanner - Остановка"
echo "================================="
echo ""

echo "🔄 Остановка контейнеров..."
docker-compose down -v --remove-orphans

echo ""
echo "🧹 Очистка временных данных..."
docker system prune -f > /dev/null 2>&1

echo ""
echo "✅ AKUMA Scanner остановлен"
echo ""
echo "📊 Оставшиеся контейнеры:"
docker ps -a --format "table {{.Names}}\t{{.Status}}"
echo ""
echo "🚀 Для запуска используйте: ./start.sh"
