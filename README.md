# 🔥 AKUMA Scanner v3.0 - Ultimate Security Assessment Tool 🔥

## 📋 Overview

AKUMA Scanner v3.0 is a comprehensive web security assessment tool designed for penetration testers and security professionals. Built with a terminal-style interface reminiscent of Kali Linux, it provides automated vulnerability scanning, port enumeration, and specialized CMS analysis.

## ✨ Features

### 🎯 **Two Scanning Modes:**

1. **QUICK_SCAN** - Fast reconnaissance
   - Port scanning with nmap (-sS -T4 -p-)
   - Web service detection with httpx
   - Technology identification with whatweb
   - Critical/High/Medium vulnerability detection with nuclei
   - CMS-specific scanning (Bitrix/WordPress)

2. **FULL_SPECTRUM** - Deep penetration testing
   - Comprehensive port scanning (-sS -sV -sC -O --min-rate=5000 -p-)
   - Advanced web probing with technology detection
   - Complete vulnerability assessment (all severity levels)
   - Directory/file fuzzing with dirsearch + gobuster
   - Specialized CMS vulnerability scanners

### 🛠️ **Security Tools Included:**
- **nmap** - Port scanning and service detection
- **httpx** - Web service probing and enumeration
- **nuclei** - Vulnerability scanning with templates
- **dirsearch** - Directory and file fuzzing
- **whatweb** - Web technology identification
- **gobuster** - Directory/DNS bruteforcing
- **nikto** - Web vulnerability scanner
- **wpscan** - WordPress security scanner
- **Custom Bitrix scanner** - Specialized Bitrix CMS assessment

### 🖥️ **Interface Features:**
- Terminal-style Kali Linux theme
- Real-time scanning progress
- Live command output
- Comprehensive reporting
- WebSocket updates
- Interactive configuration

## 🚀 Quick Start

### 1. **Automatic Setup & Launch:**
```bash
cd AKUMA-Web-Scaner-Ultimate-3.0-kali-terminal
./start_akuma.sh
```

### 2. **Manual Installation:**
```bash
# Install security tools
./install_tools.sh

# Start backend
cd backend && python3 app.py &

# Start frontend  
cd frontend && npm install && npm start
```

### 3. **Access the Scanner:**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

## 🎯 Scanning Types

### Quick Scan
```bash
# Commands executed:
nmap -sS -T4 -p- target
httpx -silent -follow-redirects -title
whatweb --color=never
nuclei -severity critical,high,medium
```

### Full Spectrum Scan
```bash
# Commands executed:
nmap -sS -sV -sC -O --min-rate=5000 -p- target
httpx -silent -follow-redirects -title -tech-detect
whatweb --log-verbose
nuclei -severity critical,high,medium,low
dirsearch + gobuster directory fuzzing
Bitrix/WordPress specialized scanners
```

## 📊 API Endpoints

- `GET /health` - Health check
- `GET /api/stats` - System statistics
- `GET /api/scans` - List all scans
- `POST /api/scans` - Create new scan
- `GET /api/scans/{id}` - Get scan details
- `DELETE /api/scans/{id}` - Delete scan
- `GET /api/scans/{id}/logs` - Get scan logs
- `GET /api/scans/{id}/vulnerabilities` - Get vulnerabilities
- `GET /api/scans/{id}/ports` - Get open ports

## 🛡️ Security Features

### Vulnerability Detection:
- **Critical** - Remote code execution, SQL injection
- **High** - Authentication bypass, privilege escalation
- **Medium** - Information disclosure, XSS
- **Low** - Configuration issues, deprecated software

### CMS-Specific Scanning:
- **Bitrix24/Bitrix** - Custom vulnerability scanner
- **WordPress** - WPScan integration
- **Drupal** - Technology detection
- **Joomla** - Technology detection

### Network Analysis:
- Port scanning (1-65535)
- Service version detection
- OS fingerprinting
- Web technology stack analysis

## 📁 Project Structure

```
AKUMA-Web-Scaner-Ultimate-3.0-kali-terminal/
├── backend/
│   ├── app.py              # Main backend application
│   ├── scan_types.py       # Scan configurations
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.js    # Main dashboard
│   │   │   ├── CreateScan.js   # Scan creation
│   │   │   └── ScanResult.js   # Results viewer
│   │   ├── services/
│   │   │   └── api.js          # API client
│   │   └── styles/
│   │       └── App.css         # Terminal styling
│   └── package.json
├── install_tools.sh        # Tool installation script
├── start_akuma.sh         # Startup script
└── README.md              # This file
```

## ⚙️ Configuration

### Scan Parameters:
- **Target URLs** - Single or multiple targets
- **Scan Type** - Quick or Full spectrum
- **Thread Count** - Concurrent operations
- **Timeout** - Request timeout settings
- **Advanced Options** - Subdomain enumeration, aggressive mode

### Environment Variables:
```bash
export WPSCAN_API_TOKEN="your_wpscan_token"  # Optional WPScan API key
```

## 🔧 Troubleshooting

### Common Issues:

1. **Tools not found:**
   ```bash
   ./install_tools.sh  # Reinstall tools
   ```

2. **Backend connection errors:**
   ```bash
   curl http://127.0.0.1:8000/health  # Check backend status
   ```

3. **Frontend build issues:**
   ```bash
   cd frontend && npm install  # Reinstall dependencies
   ```

## 📈 Example Scan Results

### Dashboard View:
- Total scans: 15
- Active scans: 2
- Vulnerabilities found: 47
- Critical issues: 3

### Typical Scan Output:
```
[2025-07-01 12:00:00] 🚀 Starting FULL scan of example.com
[2025-07-01 12:00:01] 🔍 Starting Discovery phase for example.com
[2025-07-01 12:00:15] 🔍 Starting Port Scan phase for example.com
[2025-07-01 12:02:30] 📊 Found 5 open ports
[2025-07-01 12:02:31] 🔍 Starting Web Probe phase for example.com
[2025-07-01 12:02:45] 🎯 Detected CMS: WordPress
[2025-07-01 12:02:46] 🔍 Starting Vulnerability Scan phase for example.com
[2025-07-01 12:05:20] 🚨 Found vulnerability: wordpress-version-detect [medium]
[2025-07-01 12:05:21] 🔍 Starting Directory Fuzzing phase for example.com
[2025-07-01 12:08:15] 🎉 Scan completed successfully!
```

## ⚠️ Legal Disclaimer

**IMPORTANT:** This tool is intended for authorized security testing only. Always ensure you have proper authorization before scanning any systems. Unauthorized scanning may be illegal in your jurisdiction.

- Only scan systems you own or have explicit permission to test
- Follow responsible disclosure practices
- Comply with local laws and regulations
- Use for educational and legitimate security purposes only

## 🤝 Contributing

Contributions are welcome! Please ensure all security tools are properly configured and tested.

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Verify tool installation with `./install_tools.sh`
3. Check logs in `/tmp/akuma_scan_*` directories

---

**AKUMA Scanner v3.0** - Ultimate Security Assessment Tool for Penetration Testers
