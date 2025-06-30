#!/bin/bash

echo "🔧 Fixing API endpoints for network access..."

# Список файлов для обновления
files=(
    "frontend/src/components/Dashboard.js"
    "frontend/src/components/NewScan.js"
    "frontend/src/components/ScanDetails.js"
    "frontend/src/components/Navigation.js"
    "frontend/src/pages/Vulnerabilities.js"
    "frontend/src/pages/Reports.js"
    "frontend/src/pages/Config.js"
    "frontend/src/hooks/useApi.js"
)

# Добавляем импорт API_BASE_URL в каждый файл
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "📝 Updating $file..."
        
        # Проверяем, есть ли уже импорт
        if ! grep -q "import.*API_BASE_URL" "$file"; then
            # Добавляем импорт после других импортов
            sed -i "/^import.*from/a import { API_BASE_URL, WS_URL } from '../config/api';" "$file"
        fi
        
        # Заменяем все localhost:8000 на переменную
        sed -i "s|'http://localhost:8000/api/|\`\${API_BASE_URL}/api/|g" "$file"
        sed -i "s|\"http://localhost:8000/api/|\`\${API_BASE_URL}/api/|g" "$file"
        sed -i "s|http://localhost:8000/api/|\${API_BASE_URL}/api/|g" "$file"
        
        # Заменяем WebSocket URL
        sed -i "s|'ws://localhost:8000/ws'|\`\${WS_URL}\`|g" "$file"
        sed -i "s|\"ws://localhost:8000/ws\"|\`\${WS_URL}\`|g" "$file"
        sed -i "s|ws://localhost:8000/ws|\${WS_URL}|g" "$file"
        
        echo "✅ Updated $file"
    else
        echo "⚠️ File not found: $file"
    fi
done

echo ""
echo "🎯 Network API fix completed!"
echo "Now the scanner will work from any machine in the network"
