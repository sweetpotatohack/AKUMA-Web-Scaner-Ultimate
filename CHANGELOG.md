# Changelog

All notable changes to AKUMA Web Scanner will be documented in this file.

## [3.0.0] - 2025-06-30

### 🔥 Major Features Added
- **Complete UI/UX Redesign** - Modern React-based web interface with Kali Linux terminal styling
- **Real-time Scanning** - Live progress updates via WebSocket connections
- **Advanced Dashboard** - Comprehensive scan management with visual progress indicators
- **Detailed Scan Results** - Tabbed interface showing vulnerabilities, ports, fuzzing results
- **CMS Auto-Detection** - Automatic detection of Bitrix, WordPress, and other CMS platforms
- **Multi-phase Scanning** - 6-stage comprehensive security assessment

### 🛠️ Technical Improvements
- **FastAPI Backend** - High-performance async API with automatic documentation
- **Improved Port Parsing** - Enhanced nmap result parsing with service version detection
- **Better Error Handling** - Graceful fallbacks and comprehensive error reporting
- **Tool Integration** - Seamless integration with 8+ security tools
- **Auto-Installation** - One-click setup script for all dependencies

### 🔧 Tools Integrated
- ✅ nmap - Port scanning & service detection
- ✅ httpx - Web service discovery  
- ✅ nuclei - Vulnerability scanning
- ✅ dirsearch - Directory fuzzing
- ✅ whatweb - Technology detection
- ✅ subfinder - Subdomain enumeration
- ✅ ffuf - Advanced fuzzing
- ✅ wpscan - WordPress security scanner

### 🐛 Bug Fixes
- Fixed httpx permission denied errors
- Resolved nmap output parsing issues
- Fixed vulnerability classification and display
- Improved scan status tracking
- Better handling of network timeouts

### 📊 Scanning Phases
1. **Discovery** - DNS resolution, connectivity testing
2. **Port Scan** - Comprehensive port discovery with service detection
3. **Web Probe** - HTTP/HTTPS service enumeration
4. **Vulnerability Scan** - Security vulnerability assessment
5. **Directory Fuzzing** - Hidden content discovery
6. **Deep Analysis** - Report generation and analysis

### 🎯 Supported Targets
- Single domains (example.com)
- IP addresses (192.168.1.1)
- URLs (https://example.com)
- Subdomains (sub.example.com)

### 📈 Performance Improvements
- Async scan execution
- Parallel tool execution
- Optimized nmap scanning parameters
- Efficient result parsing and storage

### 🔐 Security Features
- Input validation and sanitization
- Safe command execution
- Temporary file management
- Error boundary handling

### 🎨 UI Features
- Kali Linux terminal aesthetic
- Matrix-style animations
- Progress visualization
- Responsive design
- Real-time log streaming

## [2.0.0] - Previous Version
- Basic command-line interface
- Limited tool integration
- Manual result analysis

## [1.0.0] - Initial Release
- Basic scanning functionality
- Simple web interface
- Core nmap integration
