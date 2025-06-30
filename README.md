```
    ▄▄▄       ██ ▄█▀ █    ██  ███▄ ▄███▓ ▄▄▄      
   ▒████▄     ██▄█▒  ██  ▓██▒▓██▒▀█▀ ██▒▒████▄    
   ▒██  ▀█▄  ▓███▄░ ▓██  ▒██░▓██    ▓██░▒██  ▀█▄  
   ░██▄▄▄▄██ ▓██ █▄ ▓▓█  ░██░▒██    ▒██ ░██▄▄▄▄██ 
    ▓█   ▓██▒▒██▒ █▄▒▒█████▓ ▒██▒   ░██▒ ▓█   ▓██▒
    ▒▒   ▓▒█░▒ ▒▒ ▓▒░▒▓▒ ▒ ▒ ░ ▒░   ░  ░ ▒▒   ▓▒█░
     ▒   ▒▒ ░░ ░▒ ▒░░░▒░ ░ ░ ░  ░      ░  ▒   ▒▒ ░
     ░   ▒   ░ ░░ ░  ░░░ ░ ░ ░      ░     ░   ▒   
         ░  ░░  ░      ░            ░         ░  ░
```

# 🔥 AKUMA Web Scanner v3.0
**Ultimate Security Testing Tool for Kali Linux**

[![License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Kali%20Linux-blue.svg)](https://www.kali.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-green.svg)](https://python.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-yellow.svg)](https://nodejs.org/)

## 🎯 Особенности

- 🔍 **Комплексное сканирование** - Полный цикл тестирования безопасности
- 🌐 **Веб-интерфейс** - Современный React UI для управления сканами
- ⚡ **Real-time мониторинг** - Живое отслеживание прогресса через WebSocket
- 🛡️ **Множественные сканеры** - Integration с nmap, nuclei, dirsearch, httpx
- 🎯 **CMS Detection** - Автоматическое обнаружение Bitrix, WordPress и других CMS
- 📊 **Детальные отчеты** - HTML и JSON отчеты с полной информацией
- 🔥 **Kali Terminal Style** - Хакерский интерфейс в стиле терминала

## 🛠️ Установка

### Автоматическая установка (Рекомендуется)

```bash
git clone https://github.com/username/AKUMA-Web-Scanner-Ultimate-3.0.git
cd AKUMA-Web-Scanner-Ultimate-3.0
sudo ./install_tools.sh
```

### Ручная установка

1. **Клонируем репозиторий:**
```bash
git clone https://github.com/username/AKUMA-Web-Scanner-Ultimate-3.0.git
cd AKUMA-Web-Scanner-Ultimate-3.0
```

2. **Устанавливаем инструменты безопасности:**
```bash
sudo apt update
sudo apt install -y nmap nuclei httpx-toolkit whatweb dirsearch wpscan python3 python3-pip nodejs npm
```

3. **Устанавливаем Python зависимости:**
```bash
cd backend
pip3 install -r requirements.txt
cd ..
```

4. **Устанавливаем Node.js зависимости:**
```bash
cd frontend
npm install
cd ..
```

## 🚀 Запуск

### Быстрый старт
```bash
./start_akuma.sh
```

### Ручной запуск
```bash
# Терминал 1 - Backend
cd backend
python3 app.py

# Терминал 2 - Frontend
cd frontend
npm start
```

### Остановка
```bash
./stop_akuma.sh
```

## 🌐 Доступ

- **Frontend UI:** http://127.0.0.1:3000
- **Backend API:** http://127.0.0.1:8000
- **API Docs:** http://127.0.0.1:8000/docs

## 📋 Этапы сканирования

1. **🔍 Discovery** - DNS resolution, ping test
2. **🔌 Port Scan** - Comprehensive nmap scan with service detection
3. **🌐 Web Probe** - HTTP/HTTPS service discovery with httpx
4. **🛡️ Vulnerability Scan** - Nuclei security scanning
5. **📂 Directory Fuzzing** - Hidden directory discovery with dirsearch
6. **🔬 Deep Analysis** - Report generation and analysis

## 🎯 Поддерживаемые цели

- Одиночные домены: `example.com`
- IP адреса: `192.168.1.1`
- URL: `https://example.com`
- Поддомены: `sub.example.com`

## 🔧 Интегрированные инструменты

| Инструмент | Назначение | Статус |
|------------|------------|--------|
| nmap | Port scanning & service detection | ✅ |
| httpx | Web service discovery | ✅ |
| nuclei | Vulnerability scanning | ✅ |
| dirsearch | Directory fuzzing | ✅ |
| whatweb | Technology detection | ✅ |
| subfinder | Subdomain enumeration | ✅ |
| ffuf | Advanced fuzzing | ✅ |
| wpscan | WordPress security scanner | ✅ |

## 📊 Примеры использования

### Базовое сканирование
1. Откройте http://127.0.0.1:3000
2. Перейдите в "New Scan"
3. Введите цель: `httpbin.org`
4. Нажмите "Start Scan"
5. Мониторьте прогресс в реальном времени

### API использование
```bash
# Создать новый скан
curl -X POST http://127.0.0.1:8000/api/scans \
  -H "Content-Type: application/json" \
  -d '{"targets": ["example.com"], "scanTypes": ["basic"]}'

# Получить статус сканов
curl http://127.0.0.1:8000/api/scans

# Получить уязвимости
curl http://127.0.0.1:8000/api/vulnerabilities
```

## 🔒 Типы уязвимостей

- **Critical** - SQL Injection, RCE, Authentication Bypass
- **High** - XSS, CSRF, Path Traversal
- **Medium** - Information Disclosure, Weak Configurations
- **Low** - Version Disclosure, Deprecated Technologies
- **Info** - General Information, Fingerprinting

## 📁 Структура проекта

```
AKUMA-Web-Scanner-Ultimate-3.0/
├── backend/                 # Python FastAPI backend
│   ├── app.py              # Main application
│   ├── requirements.txt    # Python dependencies
│   └── port_parser.py      # Nmap result parser
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Application pages
│   │   └── styles/        # CSS styles
│   ├── public/            # Static files
│   └── package.json       # Node.js dependencies
├── install_tools.sh       # Automated installation script
├── start_akuma.sh         # Start script
├── stop_akuma.sh          # Stop script
└── README.md              # This file
```

## 🐛 Troubleshooting

### Common Issues

**1. httpx Permission Denied**
```bash
sudo chmod +x /usr/bin/httpx
# или
sudo ln -sf /root/go/bin/httpx /usr/local/bin/httpx
```

**2. Nuclei templates not found**
```bash
nuclei -update-templates
```

**3. Port already in use**
```bash
./stop_akuma.sh
./start_akuma.sh
```

**4. Node.js version issues**
```bash
sudo npm install -g n
sudo n latest
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational and authorized testing purposes only. Users are responsible for complying with applicable laws and regulations. The developers assume no liability for misuse.

## 📞 Support

- 🐛 **Issues:** [GitHub Issues](https://github.com/username/AKUMA-Web-Scanner-Ultimate-3.0/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/username/AKUMA-Web-Scanner-Ultimate-3.0/discussions)
- 📧 **Email:** support@akuma-scanner.com

---

**Made with ❤️ for the cybersecurity community**

🔥 **Happy Hacking!** 🔥
