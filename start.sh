#!/bin/bash

echo "🔥 AKUMA Web Scanner Ultimate 3.0 🔥"
echo "======================================"
echo ""

# Проверка Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker не установлен. Установите Docker и повторите попытку."
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose не установлен. Установите Docker Compose и повторите попытку."
    exit 1
fi

echo "🔧 Проверка Docker..."
if ! docker info &> /dev/null; then
    echo "❌ Docker не запущен. Запустите Docker daemon и повторите попытку."
    exit 1
fi

echo "✅ Docker проверен"
echo ""

# Остановка существующих контейнеров
echo "🛑 Остановка существующих контейнеров..."
docker-compose down -v --remove-orphans 2>/dev/null

echo "🧹 Очистка старых образов..."
docker system prune -f 2>/dev/null

echo ""
echo "🚀 Запуск AKUMA Scanner..."
echo "📦 Сборка и запуск контейнеров..."

# Запуск с сборкой
if docker-compose up --build -d; then
    echo ""
    echo "✅ Контейнеры запущены!"
    echo ""
    echo "⏳ Ожидание инициализации сервисов..."
    
    # Ожидание готовности бэкенда
    for i in {1..60}; do
        if curl -s http://localhost:8000/health > /dev/null 2>&1; then
            echo "✅ Backend готов!"
            break
        fi
        echo -n "."
        sleep 2
    done
    
    echo ""
    echo "⏳ Ожидание готовности фронтенда..."
    sleep 10
    
    echo ""
    echo "🎉 AKUMA Scanner успешно запущен!"
    echo ""
    echo "📱 Веб-интерфейс: http://localhost:3000"
    echo "🔌 API: http://localhost:8000"
    echo "📚 API Docs: http://localhost:8000/docs"
    echo ""
    echo "📊 Статус контейнеров:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "📝 Для просмотра логов используйте:"
    echo "   docker logs akuma_backend -f  # Логи бэкенда"
    echo "   docker logs akuma_frontend -f # Логи фронтенда"
    echo ""
    echo "🛑 Для остановки используйте:"
    echo "   docker-compose down"
    echo ""
    echo "🔥 Начните ваш первый скан на http://localhost:3000"
    
else
    echo "❌ Ошибка при запуске контейнеров"
    echo "📝 Проверьте логи с помощью:"
    echo "   docker-compose logs"
    exit 1
fi
