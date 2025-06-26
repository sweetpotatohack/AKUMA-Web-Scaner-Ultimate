# 🔥 AKUMA Web Scanner 

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/React-18.0+-61DAFB.svg" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-0.68+-009688.svg" alt="FastAPI">
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED.svg" alt="Docker">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
</div>

**AKUMA Web Scanner** - это продвинутый веб-сканер безопасности с современным киберпанк интерфейсом, созданный для комплексного анализа веб-приложений и поиска уязвимостей.

## ✨ Возможности

### 🎯 Основной функционал
- **Multi-target сканирование** - одновременное сканирование множественных целей
- **Прогрессивное сканирование** - пошаговая эмуляция профессиональных сканеров (Acunetix/OpenVAS)
- **Реальное время** - мониторинг прогресса сканирования в live режиме
- **Детальная отчетность** - экспорт результатов в HTML формате
- **Гибкие настройки** - конфигурация глубины сканирования, потоков и таймаутов

### 🛡️ Типы обнаруживаемых уязвимостей
- SQL Injection
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Directory Traversal
- Server-Side Request Forgery (SSRF)
- Weak Authentication
- Information Disclosure
- Insecure Direct Object References
- Security Misconfiguration

### 🚀 Этапы сканирования
1. **Discovery** - обнаружение сервисов и технологий
2. **Port Scanning** - сканирование портов (nmap эмуляция)
3. **Web Probing** - HTTP/HTTPS проверка (httpx эмуляция)
4. **Technology Detection** - определение технологий (whatweb эмуляция)
5. **Vulnerability Assessment** - поиск уязвимостей (nuclei эмуляция)
6. **Deep Analysis** - углубленный анализ найденных проблем

### 🎨 Интерфейс
- **Киберпанк дизайн** - темная тема с неоновыми акцентами
- **Адаптивность** - полная поддержка мобильных устройств
- **Интуитивность** - простая навигация по вкладкам
- **Анимации** - плавные переходы и эффекты

## 🏗️ Архитектура

```
AKUMA Web Scanner/
├── backend/           # FastAPI серверная часть
│   ├── main.py       # Основное API приложение
│   ├── models.py     # Модели данных
│   ├── scanner.py    # Логика сканирования
│   └── requirements.txt
├── frontend/         # React клиентская часть
│   ├── src/
│   │   ├── components/  # React компоненты
│   │   ├── services/    # API сервисы
│   │   └── styles/      # CSS стили
│   ├── package.json
│   └── Dockerfile
├── scanner_modules/  # Модули сканирования
├── reports/         # Генерируемые отчеты
├── notifications/   # Модуль уведомлений
└── docker-compose.yml
```

## 🚀 Быстрый старт

### Предварительные требования
- Docker и Docker Compose
- Git

### Установка

1. **Клонируйте репозиторий:**
```bash
git clone https://github.com/ваш-username/AKUMA_Web_Scanner.git
cd AKUMA_Web_Scanner
```

2. **Запустите контейнеры:**
```bash
docker-compose up -d --build
```

3. **Откройте веб-интерфейс:**
```
http://localhost:3001
```

Backend API будет доступен по адресу: `http://localhost:8001`

## 📋 Использование

### Создание нового сканирования

1. Перейдите на вкладку **"Create Scan"**
2. Укажите цель(и) для сканирования:
   - Введите URL вручную
   - Загрузите файл со списком целей
3. Настройте параметры сканирования:
   - **Глубина сканирования** (1-5)
   - **Количество потоков** (1-10)
   - **Таймаут запросов** (5-60 сек)
   - **Включить поддомены** (да/нет)
4. Нажмите **"Start Scan"**

### Мониторинг сканирования

- Переходите на вкладку **"Scans"** для просмотра всех сканирований
- Кликните на сканирование для просмотра детальной информации
- Наблюдайте прогресс в реальном времени
- Скачивайте отчеты после завершения сканирования

### Настройки уведомлений

На вкладке **"Settings"** можно настроить:
- Email уведомления
- Telegram уведомления
- Частоту отправки уведомлений

## 🔧 API Endpoints

### Сканирование
- `POST /api/scans/` - Создать новое сканирование
- `GET /api/scans/` - Получить список всех сканирований
- `GET /api/scans/{scan_id}` - Получить детали сканирования
- `DELETE /api/scans/{scan_id}` - Удалить сканирование

### Отчеты
- `GET /api/scans/{scan_id}/report` - Скачать HTML отчет
- `GET /api/scans/{scan_id}/vulnerabilities` - Получить список уязвимостей

### Утилиты
- `POST /api/upload-targets` - Загрузить файл с целями
- `GET /api/scan-progress/{scan_id}` - Получить прогресс сканирования

## 🛠️ Разработка

### Структура backend

```python
# Основные компоненты
- FastAPI приложение с REST API
- Асинхронное сканирование с websocket обновлениями
- SQLite база данных для хранения результатов
- Модульная система для различных типов сканирования
```

### Структура frontend

```javascript
// React компоненты
- Dashboard - главная панель с статистикой
- Scans - список и детали сканирований
- CreateScan - форма создания нового сканирования
- Settings - настройки уведомлений и системы
```

### Запуск в режиме разработки

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## 🎯 Эмулируемые инструменты

AKUMA Web Scanner эмулирует работу следующих профессиональных инструментов:

- **nmap** - сканирование портов и сервисов
- **httpx** - HTTP/HTTPS проверка и анализ
- **whatweb** - определение веб-технологий
- **nuclei** - поиск уязвимостей по шаблонам
- **Custom modules** - дополнительные проверки безопасности

## 🤝 Участие в разработке

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - смотрите [LICENSE](LICENSE) файл для деталей.

## ⚠️ Дисклеймер

AKUMA Web Scanner предназначен только для законного тестирования безопасности систем, на которые у вас есть явное разрешение. Использование этого инструмента против систем без разрешения владельца может быть незаконным. Авторы не несут ответственности за неправомерное использование этого инструмента.

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
- Создайте Issue в GitHub
- Обратитесь к документации API
- Проверьте логи Docker контейнеров

---

<div align="center">
  <b>Made with ❤️ for cybersecurity community</b>
</div>

## 🚀 Quick Start Options

### Option 1: One-Command Launch (Fastest)
```bash
# Clone and start in one go
git clone https://github.com/your-username/AKUMA_Web_Scanner.git
cd AKUMA_Web_Scanner
chmod +x quickstart.sh
./quickstart.sh
```

### Option 2: Manual Setup
```bash
# Traditional Docker Compose
docker-compose up --build -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Option 3: Automated Installation
```bash
# Use installation script
chmod +x scripts/install.sh
./scripts/install.sh
```

## 📁 Project Structure Update

```
AKUMA_Web_Scanner/
├── 🔧 scripts/
│   ├── install.sh          # Automated installation
│   ├── backup.sh           # Backup system
│   ├── update.sh           # Update deployment
│   └── setup.sh            # Advanced setup
├── 📚 docs/
│   ├── INSTALLATION_GUIDE.md  # Detailed install guide
│   ├── DEPLOYMENT_GUIDE.md    # Production deployment
│   ├── API_DOCUMENTATION.md   # API reference
│   └── SCANNING_MODULES.md    # Scanner details
├── quickstart.sh           # One-command launcher
├── CHANGELOG.md           # Version history
└── [previous files...]
```

## 🛠️ Maintenance Commands

```bash
# Create backup
./scripts/backup.sh

# Update deployment
./scripts/update.sh

# Quick restart
./quickstart.sh

# Clean restart
docker-compose down
docker system prune -f
./quickstart.sh
```

---

*🔥 AKUMA Web Scanner v1.0 - The Professional Web Security Scanner*
