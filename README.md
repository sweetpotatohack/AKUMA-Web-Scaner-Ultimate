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
