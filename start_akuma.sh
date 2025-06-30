#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${RED}"
echo "    ▄▄▄       ██ ▄█▀ █    ██  ███▄ ▄███▓ ▄▄▄      "
echo "   ▒████▄     ██▄█▒  ██  ▓██▒▓██▒▀█▀ ██▒▒████▄    "
echo "   ▒██  ▀█▄  ▓███▄░ ▓██  ▒██░▓██    ▓██░▒██  ▀█▄  "
echo "   ░██▄▄▄▄██ ▓██ █▄ ▓▓█  ░██░▒██    ▒██ ░██▄▄▄▄██ "
echo "    ▓█   ▓██▒▒██▒ █▄▒▒█████▓ ▒██▒   ░██▒ ▓█   ▓██▒"
echo "    ▒▒   ▓▒█░▒ ▒▒ ▓▒░▒▓▒ ▒ ▒ ░ ▒░   ░  ░ ▒▒   ▓▒█░"
echo "     ▒   ▒▒ ░░ ░▒ ▒░░░▒░ ░ ░ ░  ░      ░  ▒   ▒▒ ░"
echo "     ░   ▒   ░ ░░ ░  ░░░ ░ ░ ░      ░     ░   ▒   "
echo "         ░  ░░  ░      ░            ░         ░  ░"
echo -e "${NC}"
echo -e "${CYAN}🔥 AKUMA Web Scanner - Ultimate Security Testing Tool${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════${NC}"
echo ""

# Проверяем, запущен ли уже скрипт
if pgrep -f "python.*app.py" > /dev/null; then
    echo -e "${YELLOW}⚠️  Backend уже запущен${NC}"
else
    echo -e "${GREEN}🚀 Запускаем Backend...${NC}"
    cd backend && python3 app.py &
    BACKEND_PID=$!
    echo -e "${GREEN}✅ Backend запущен (PID: $BACKEND_PID)${NC}"
fi

if pgrep -f "npm.*start" > /dev/null; then
    echo -e "${YELLOW}⚠️  Frontend уже запущен${NC}"
else
    echo -e "${GREEN}🚀 Запускаем Frontend...${NC}"
    cd frontend && npm start &
    FRONTEND_PID=$!
    echo -e "${GREEN}✅ Frontend запущен (PID: $FRONTEND_PID)${NC}"
fi

echo ""
echo -e "${CYAN}📡 Сервисы:${NC}"
echo -e "${GREEN}• Backend API: http://127.0.0.1:8000${NC}"
echo -e "${GREEN}• Frontend UI: http://127.0.0.1:3000${NC}"
echo ""
echo -e "${YELLOW}💡 Подсказки:${NC}"
echo -e "${BLUE}• Откройте браузер: http://127.0.0.1:3000${NC}"
echo -e "${BLUE}• API документация: http://127.0.0.1:8000/docs${NC}"
echo -e "${BLUE}• Для остановки: Ctrl+C или ./stop_akuma.sh${NC}"
echo ""
echo -e "${RED}⚡ AKUMA Scanner готов к сканированию!${NC}"

# Ждем сигнал для остановки
trap 'echo -e "\n${RED}🛑 Останавливаем AKUMA Scanner...${NC}"; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' SIGINT SIGTERM

# Ожидаем завершения процессов
wait
