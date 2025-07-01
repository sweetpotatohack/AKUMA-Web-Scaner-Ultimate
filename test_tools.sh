#!/bin/bash

# Простой тест функций сканера
source script_scaner.sh

echo "🔍 Тестируем проверку инструментов..."

# Переопределяем функцию log для тестирования
log() {
    echo "[TEST LOG] $1"
}

# Тестируем функцию check_tools
echo "Запускаем check_tools..."
check_tools

echo "✅ Тест завершен"
