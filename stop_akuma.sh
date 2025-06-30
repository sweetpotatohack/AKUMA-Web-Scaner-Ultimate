#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}🛑 Останавливаем AKUMA Scanner...${NC}"

# Останавливаем все процессы
pkill -f "python.*app.py" && echo -e "${GREEN}✅ Backend остановлен${NC}"
pkill -f "npm.*start" && echo -e "${GREEN}✅ Frontend остановлен${NC}"

echo -e "${YELLOW}🔥 AKUMA Scanner остановлен${NC}"
