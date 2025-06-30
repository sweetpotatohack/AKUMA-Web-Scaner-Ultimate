# 🌐 AKUMA Web Scanner - Сетевая настройка

## ✅ ПРОБЛЕМА РЕШЕНА!

Проблема была в конфликте портов:
- Docker контейнер занимал порт 8000
- Наш бэкенд переведен на порт 8001

## 🔧 ТЕКУЩАЯ КОНФИГУРАЦИЯ

- **Frontend**: http://IP_ADDRESS:3000
- **Backend API**: http://IP_ADDRESS:8001
- **Сервер IP**: 192.168.1.24

## 🌐 ДОСТУП ИЗ СЕТИ

Теперь AKUMA Scanner доступен с любой машины в сети:

### Для клиентов:
- **Dashboard**: http://192.168.1.24:3000/dashboard
- **New Scan**: http://192.168.1.24:3000/new-scan
- **Vulnerabilities**: http://192.168.1.24:3000/vulnerabilities
- **Reports**: http://192.168.1.24:3000/reports
- **Config**: http://192.168.1.24:3000/config

### Для разработчиков:
- **API Docs**: http://192.168.1.24:8001/docs
- **API Stats**: http://192.168.1.24:8001/api/stats

## 🔧 ЗАПУСК/ОСТАНОВКА

```bash
# Запуск
cd /root/AKUMA_Web_Scanner
./start_scanner.sh

# Остановка  
./stop_scanner.sh

# Проверка сетевого доступа
python3 test_network_access.py
```

## 🛠️ ТЕХНИЧЕСКАЯ ИНФОРМАЦИЯ

### Процессы:
- **Backend**: `python3 -m uvicorn backend.app:app --host 0.0.0.0 --port 8001`
- **Frontend**: `npm start` (через Docker на порту 3000)

### Порты:
- **3000**: React фронтенд (Docker proxy)
- **8001**: FastAPI бэкенд (Python uvicorn)

### API конфигурация:
- Автоматическое определение IP через `window.location.hostname`
- CORS настроен для всех источников
- WebSocket на том же порту что и API

## ✅ ВСЁ РАБОТАЕТ!

- ✅ Фронтенд доступен с внешних машин
- ✅ API работает с правильным портом  
- ✅ Динамическое определение IP адреса
- ✅ CORS правильно настроен
- ✅ Сканирование запускается из сети

Теперь вы можете запускать сканы с любой машины в сети 192.168.1.x!
