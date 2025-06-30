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
# 🔥 AKUMA Web Scanner

<div align="center">
  <img src="https://img.shields.io/badge/Python-3.8+-blue.svg" alt="Python">
  <img src="https://img.shields.io/badge/React-18.0+-61DAFB.svg" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-0.68+-009688.svg" alt="FastAPI">
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED.svg" alt="Docker">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Security-Scanner-red.svg" alt="Security">
</div>

<div align="center">
  <h3>🎯 Professional Web Security Scanner with Cyberpunk UI</h3>
  <p><strong>AKUMA Web Scanner</strong> - Advanced web vulnerability scanner inspired by Acunetix and OpenVAS</p>
</div>

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/AKUMA_Web_Scanner.git
cd AKUMA_Web_Scanner

# One-command deployment
./quickstart.sh

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

## ✨ Features

### 🎯 Core Functionality
- **Multi-target Scanning** - Simultaneous scanning of multiple targets
- **Progressive Scanning** - Step-by-step emulation of professional scanners (Acunetix/OpenVAS style)
- **Real-time Monitoring** - Live scan progress tracking via WebSockets
- **Comprehensive Reporting** - Detailed HTML reports with vulnerability analysis
- **Flexible Configuration** - Customizable scan depth, threads, and timeouts
- **File Upload Support** - Bulk target import from text files
- **Notification System** - Email alerts and webhook notifications

### 🛡️ Vulnerability Detection
- **SQL Injection** - Database query manipulation attacks
- **Cross-Site Scripting (XSS)** - Reflected and stored XSS vulnerabilities
- **Cross-Site Request Forgery (CSRF)** - CSRF token validation bypass
- **Directory Traversal** - Path traversal and file inclusion attacks
- **Server-Side Request Forgery (SSRF)** - Internal service enumeration
- **Authentication Bypass** - Weak authentication mechanisms
- **Information Disclosure** - Sensitive data exposure
- **Security Misconfiguration** - Server and application misconfigurations
- **Insecure Direct Object References** - Authorization bypass vulnerabilities

### 🔍 Scanning Phases
1. **🔍 Discovery** - Service and technology discovery
2. **🔎 Port Scanning** - Network port enumeration (nmap-style)
3. **🌐 Web Probing** - HTTP/HTTPS service detection (httpx-style)
4. **🔧 Technology Detection** - Web technology fingerprinting (whatweb-style)
5. **⚡ Vulnerability Assessment** - Security flaw detection (nuclei-style)
6. **🕵️ Deep Analysis** - In-depth vulnerability analysis and exploitation

### 🎨 Modern UI/UX
- **🌃 Cyberpunk Theme** - Dark interface with neon accents
- **📱 Responsive Design** - Full mobile device support
- **⚡ Real-time Updates** - Live progress indicators and notifications
- **📊 Interactive Dashboard** - Comprehensive scan overview
- **🎭 Smooth Animations** - Fluid transitions and effects
- **🖱️ Intuitive Navigation** - Easy-to-use tabbed interface

## 🏗️ Architecture

```
AKUMA_Web_Scanner/
├── 🖥️ backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── main.py                # Application entry point
│   │   ├── models/                # Data models
│   │   ├── routers/               # API endpoints
│   │   ├── services/              # Business logic
│   │   └── scanner/               # Scanning modules
│   ├── requirements.txt
│   └── Dockerfile
├── 🎨 frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/            # UI components
│   │   ├── pages/                 # Application pages
│   │   ├── styles/                # CSS styles
│   │   └── utils/                 # Utility functions
│   ├── package.json
│   └── Dockerfile
├── 📚 docs/                       # Documentation
│   ├── INSTALLATION_GUIDE.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── API_DOCUMENTATION.md
├── 🔧 scripts/                    # Automation scripts
│   ├── install.sh                 # Installation script
│   ├── backup.sh                  # Backup script
│   └── update.sh                  # Update script
├── 🚀 quickstart.sh               # One-command deployment
├── 🐳 docker-compose.yml          # Docker orchestration
└── 📋 README.md                   # This file
```

## 🛠️ Technology Stack

### Backend
- **⚡ FastAPI** - Modern Python web framework
- **🔄 Asyncio** - Asynchronous programming support
- **🗄️ Redis** - Caching and session management
- **📡 WebSockets** - Real-time communication
- **🐍 Python 3.8+** - Core programming language

### Frontend
- **⚛️ React 18** - Modern UI library
- **🎨 CSS3** - Advanced styling with animations
- **📡 WebSocket** - Real-time updates
- **📱 Responsive Design** - Mobile-first approach

### DevOps
- **🐳 Docker** - Containerization
- **🔗 Docker Compose** - Multi-container orchestration
- **🗄️ Redis** - In-memory data structure store
- **🔄 CI/CD Ready** - Automated deployment support

## 📦 Installation Methods

### 🚀 Quick Installation (Recommended)
```bash
git clone https://github.com/yourusername/AKUMA_Web_Scanner.git
cd AKUMA_Web_Scanner
chmod +x quickstart.sh
./quickstart.sh
```

### 🐳 Docker Installation
```bash
# Clone repository
git clone https://github.com/yourusername/AKUMA_Web_Scanner.git
cd AKUMA_Web_Scanner

# Build and start services
docker-compose up -d --build

# Check status
docker-compose ps
```

### 🔧 Manual Installation
```bash
# Install dependencies
./scripts/install.sh

# Start backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Start frontend (new terminal)
cd frontend
npm install
npm start
```

## 🎮 Usage Guide

### 1. 🌟 Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **API Alternative Docs**: http://localhost:8000/redoc

### 2. 🎯 Create a New Scan
1. Navigate to the **"New Scan"** tab
2. Choose input method:
   - **Manual Entry**: Enter targets separated by commas
   - **File Upload**: Upload a text file with targets (one per line)
3. Configure scan settings:
   - **Scan Depth**: Surface/Deep/Comprehensive
   - **Threads**: Number of concurrent workers
   - **Timeout**: Request timeout in seconds
4. Click **"Start Scan"** to begin

### 3. 📊 Monitor Progress
- View real-time progress in the **Dashboard**
- Watch detailed logs in the **Scan Details** section
- Get notified when scan phases complete

### 4. 📈 Analyze Results
- Review vulnerabilities in the **Vulnerabilities** tab
- Generate detailed reports in the **Reports** section
- Export findings in HTML format

### 5. ⚙️ Configure Settings
- Set up email notifications in **Settings**
- Configure webhook endpoints for integrations
- Adjust scanning parameters and thresholds

## 🔧 Configuration

### Environment Variables
```bash
# Backend Configuration
REDIS_URL=redis://localhost:6379
DATABASE_URL=sqlite:///./scanner.db
SECRET_KEY=your-secret-key-here

# Notification Settings
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Security Settings
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ORIGINS=http://localhost:3000
```

### Docker Environment
Copy and modify the example environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## 📊 API Documentation

### 🔗 Core Endpoints
- **POST /api/scans** - Create new scan
- **GET /api/scans** - List all scans
- **GET /api/scans/{scan_id}** - Get scan details
- **DELETE /api/scans/{scan_id}** - Delete scan
- **GET /api/vulnerabilities** - List vulnerabilities
- **POST /api/reports/generate** - Generate report
- **WebSocket /ws/scan/{scan_id}** - Real-time updates

### 📚 Interactive Documentation
Visit http://localhost:8000/docs for complete API documentation with interactive testing interface.

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
**🚫 Port Already in Use**
```bash
# Check what's using the port
sudo lsof -i :3000
sudo lsof -i :8000

# Kill the process or change ports in docker-compose.yml
```

**🐳 Docker Issues**
```bash
# Reset Docker environment
docker-compose down
docker system prune -a
docker-compose up -d --build
```

**📡 Connection Issues**
```bash
# Check service status
docker-compose ps
docker-compose logs backend
docker-compose logs frontend
```

### 🔍 Debug Mode
Enable detailed logging:
```bash
# Backend debug mode
export DEBUG=True
export LOG_LEVEL=DEBUG

# Frontend debug mode
export REACT_APP_DEBUG=true
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
We welcome contributions! Here's how to get started:

### 🔄 Development Setup
```bash
# Fork the repository
git clone https://github.com/yourusername/AKUMA_Web_Scanner.git
cd AKUMA_Web_Scanner

# Create development branch
git checkout -b feature/your-feature-name

# Set up development environment
./scripts/install.sh

# Make your changes and test
./quickstart.sh

# Submit pull request
```

### 📋 Contribution Guidelines
1. **🧪 Testing**: Ensure all tests pass
2. **📝 Documentation**: Update relevant documentation
3. **🎨 Code Style**: Follow existing code patterns
4. **🔒 Security**: Test security implications
5. **📱 Responsive**: Ensure mobile compatibility

## 🔒 Security Considerations

### ⚠️ Important Warnings
- **Educational Purpose**: This tool is for educational and authorized testing only
- **Legal Compliance**: Ensure you have permission before scanning any targets
- **Network Security**: Run in isolated environments when possible
- **Data Protection**: Scan results may contain sensitive information

### 🛡️ Best Practices
- Use strong authentication in production
- Implement rate limiting for API endpoints
- Regular security updates for dependencies
- Monitor scan activities and access logs
- Encrypt sensitive configuration data

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

- **🎯 Inspiration**: Acunetix, OpenVAS, and Nuclei scanners
- **🎨 Design**: Cyberpunk 2077 visual aesthetics
- **🛠️ Tools**: Nmap, Httpx, Whatweb methodologies
- **🌟 Community**: Open source security tools community

## 📞 Support

### 🆘 Getting Help
- **📚 Documentation**: Check the `docs/` directory
- **🐛 Issues**: Create an issue on GitHub
- **💬 Discussions**: Join our community discussions
- **📧 Contact**: Reach out for enterprise support

### 🔄 Updates
- **⭐ Star** this repository to stay updated
- **👀 Watch** for new releases and features
- **🍴 Fork** to contribute your improvements

---

<div align="center">
  <p><strong>🔥 AKUMA Web Scanner - Professional Security Testing Made Simple</strong></p>
  <p>Built with ❤️ for the cybersecurity community</p>
</div>
