#!/bin/bash

echo "🔥 AKUMA Web Scanner - Installing Security Tools..."
echo "==============================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Обновляем систему
log "Updating system packages..."
apt-get update -y

# Устанавливаем базовые инструменты
log "Installing base tools..."
apt-get install -y \
    git \
    wget \
    curl \
    nmap \
    dnsutils \
    iputils-ping \
    build-essential \
    python3 \
    python3-pip \
    ruby \
    ruby-dev \
    golang-go \
    whatweb \
    dirsearch \
    nuclei \
    wpscan \
    nodejs \
    npm

# Устанавливаем httpx
log "Installing httpx..."
if ! command -v httpx &> /dev/null; then
    # Устанавливаем из Kali репозитория
    apt-get install -y httpx-toolkit
    
    # Если не получилось, устанавливаем через Go
    if ! command -v httpx &> /dev/null; then
        warn "Installing httpx via Go..."
        export PATH=$PATH:/usr/local/go/bin
        go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest
        ln -sf /root/go/bin/httpx /usr/local/bin/httpx
    fi
fi

# Устанавливаем subfinder
log "Installing subfinder..."
if ! command -v subfinder &> /dev/null; then
    go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
    ln -sf /root/go/bin/subfinder /usr/local/bin/subfinder
fi

# Устанавливаем ffuf
log "Installing ffuf..."
if ! command -v ffuf &> /dev/null; then
    go install github.com/ffuf/ffuf@latest
    ln -sf /root/go/bin/ffuf /usr/local/bin/ffuf
fi

# Устанавливаем Python зависимости для backend
log "Installing Python dependencies..."
cd backend && pip3 install -r requirements.txt
cd ..

# Устанавливаем Node.js зависимости для frontend
log "Installing Node.js dependencies..."
cd frontend && npm install
cd ..

# Создаем директории для результатов
log "Creating scan directories..."
mkdir -p /tmp/akuma_scans
chmod 755 /tmp/akuma_scans

# Обновляем nuclei templates
log "Updating nuclei templates..."
nuclei -update-templates || warn "Failed to update nuclei templates"

# Проверяем установленные инструменты
log "Verifying installation..."
tools=(
    "nmap"
    "httpx"
    "subfinder"
    "ffuf"
    "nuclei"
    "whatweb"
    "dirsearch"
    "wpscan"
    "curl"
    "ping"
    "nslookup"
)

failed=0
for tool in "${tools[@]}"; do
    if command -v $tool &> /dev/null; then
        log "✅ $tool: $(which $tool)"
    else
        error "❌ $tool: NOT FOUND"
        failed=1
    fi
done

# Проверяем Python модули
python3 -c "
import sys
modules = ['fastapi', 'uvicorn', 'requests', 'asyncio']
failed = 0
for module in modules:
    try:
        __import__(module)
        print(f'✅ Python {module}: OK')
    except ImportError:
        print(f'❌ Python {module}: NOT FOUND')
        failed = 1
sys.exit(failed)
"

if [ $? -ne 0 ]; then
    failed=1
fi

if [ $failed -eq 0 ]; then
    log "🎉 All tools installed successfully!"
    log "🚀 Ready to start AKUMA Web Scanner!"
else
    error "⚠️  Some tools failed to install. Please check the errors above."
    exit 1
fi

echo ""
echo "==============================================="
echo "🔥 AKUMA Web Scanner Installation Complete"
echo "==============================================="
echo ""
echo "To start the scanner:"
echo "1. Backend:  cd backend && python3 app.py"
echo "2. Frontend: cd frontend && npm start"
echo "3. Open:     http://127.0.0.1:3000"
echo ""
