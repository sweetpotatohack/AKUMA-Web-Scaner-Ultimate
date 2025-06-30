# 🚀 AKUMA Web Scanner - Руководство по запуску

## ⚡ БЫСТРЫЙ СТАРТ

После отключения электричества или перезагрузки системы:

```bash
cd /root/AKUMA_Web_Scanner
./start_scanner.sh
```

## 🔧 РУЧНОЙ ЗАПУСК

### Бэкенд (FastAPI)
```bash
cd /root/AKUMA_Web_Scanner
python3 -m uvicorn backend.app:app --host 0.0.0.0 --port 8000 --reload &
```

### Фронтенд (React)
```bash
cd /root/AKUMA_Web_Scanner/frontend  
npm start &
```

## 🛑 ОСТАНОВКА

```bash
cd /root/AKUMA_Web_Scanner
./stop_scanner.sh
```

Или вручную:
```bash
pkill -f uvicorn
pkill -f "react-scripts"
```

## 🌐 ДОСТУПЫ

- **Главная панель**: http://localhost:3000/dashboard
- **Уязвимости**: http://localhost:3000/vulnerabilities
- **Отчеты**: http://localhost:3000/reports  
- **Настройки**: http://localhost:3000/config
- **API документация**: http://localhost:8000/docs

## 📊 ПРОВЕРКА СТАТУСА

```bash
# Проверка портов
netstat -tulpn | grep -E "(3000|8000)"

# Проверка API
curl -s http://localhost:8000/api/stats

# Проверка фронтенда
curl -s http://localhost:3000 | grep AKUMA
```

## 🔍 ЛОГИ

- **Бэкенд**: `/root/AKUMA_Web_Scanner/backend.log`
- **Фронтенд**: `/root/AKUMA_Web_Scanner/frontend.log`

## ⚙️ ВОЗМОЖНЫЕ ПРОБЛЕМЫ

### Порт занят
```bash
sudo lsof -i :8000
sudo lsof -i :3000
# Убить процесс: kill -9 <PID>
```

### Зависимости отсутствуют
```bash
pip install --break-system-packages fastapi uvicorn python-multipart
cd frontend && npm install
```

### Синтаксические ошибки
```bash
python3 -m py_compile backend/app.py
```

## 🎯 АВТОЗАПУСК (опционально)

Добавить в crontab для автозапуска при загрузке:
```bash
crontab -e
# Добавить: @reboot /root/AKUMA_Web_Scanner/start_scanner.sh
```

## 🔥 ГОТОВНОСТЬ К РАБОТЕ

После успешного запуска вы увидите:
- ✅ Backend started successfully on port 8000
- ✅ Frontend started successfully on port 3000
- Интерфейс доступен по http://localhost:3000

---
*AKUMA Web Scanner v2.0 - Ready for Action! 💀*
