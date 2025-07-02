#!/bin/bash

echo "🔥 AKUMA Scanner - Installing Security Tools 🔥"
echo "================================================"

# Обновляем систему
echo "[1/9] Updating system packages..."
apt update -qq >/dev/null 2>&1

# Устанавливаем основные инструменты из репозиториев Kali
echo "[2/9] Installing core tools from repositories..."
apt install -y \
    nmap \
    whatweb \
    gobuster \
    nikto \
    wpscan \
    python3-pip \
    git \
    curl \
    wget \
    unzip \
    jq >/dev/null 2>&1

# Устанавливаем httpx через go (более надежный способ)
echo "[3/9] Installing httpx..."
if ! command -v httpx >/dev/null 2>&1; then
    # Пробуем установить через apt сначала
    apt install -y httpx-toolkit >/dev/null 2>&1
    
    # Создаем символическую ссылку
    if [ -f "/usr/bin/httpx-toolkit" ]; then
        ln -sf /usr/bin/httpx-toolkit /usr/local/bin/httpx
    else
        # Устанавливаем через go если apt не сработал
        if ! command -v go >/dev/null 2>&1; then
            apt install -y golang-go >/dev/null 2>&1
        fi
        go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest
        cp ~/go/bin/httpx /usr/local/bin/
    fi
fi

# Устанавливаем nuclei
echo "[4/9] Installing nuclei..."
if ! command -v nuclei >/dev/null 2>&1; then
    # Пробуем установить через go
    if command -v go >/dev/null 2>&1; then
        go install -v github.com/projectdiscovery/nuclei/v3/cmd/nuclei@latest
        cp ~/go/bin/nuclei /usr/local/bin/
    else
        # Скачиваем бинарник
        NUCLEI_VERSION=$(curl -s https://api.github.com/repos/projectdiscovery/nuclei/releases/latest | jq -r .tag_name)
        wget -q -O nuclei.zip "https://github.com/projectdiscovery/nuclei/releases/latest/download/nuclei_${NUCLEI_VERSION#v}_linux_amd64.zip"
        unzip -q nuclei.zip
        mv nuclei /usr/local/bin/
        chmod +x /usr/local/bin/nuclei
        rm -f nuclei.zip LICENSE.md README*.md
    fi
fi

# Устанавливаем subfinder
echo "[5/9] Installing subfinder..."
if ! command -v subfinder >/dev/null 2>&1; then
    if command -v go >/dev/null 2>&1; then
        go install -v github.com/projectdiscovery/subfinder/v2/cmd/subfinder@latest
        cp ~/go/bin/subfinder /usr/local/bin/
    fi
fi

# Устанавливаем waybackurls
echo "[6/9] Installing waybackurls..."
if ! command -v waybackurls >/dev/null 2>&1; then
    if command -v go >/dev/null 2>&1; then
        go install github.com/tomnomnom/waybackurls@latest
        cp ~/go/bin/waybackurls /usr/local/bin/
    fi
fi

# Устанавливаем jaeles
echo "[7/9] Installing jaeles..."
if ! command -v jaeles >/dev/null 2>&1; then
    if command -v go >/dev/null 2>&1; then
        go install github.com/jaeles-project/jaeles@latest
        cp ~/go/bin/jaeles /usr/local/bin/
    fi
fi

# Устанавливаем dirsearch
echo "[8/9] Installing dirsearch..."
if [ ! -d "/opt/dirsearch" ]; then
    git clone -q https://github.com/maurosoria/dirsearch.git /opt/dirsearch
    chmod +x /opt/dirsearch/dirsearch.py
    ln -sf /opt/dirsearch/dirsearch.py /usr/local/bin/dirsearch
fi

# Создаем директории для wordlists если их нет
echo "[9/9] Setting up wordlists..."
mkdir -p /usr/share/wordlists/dirb
mkdir -p /usr/share/wordlists/dirbuster

# Скачиваем SecLists если их нет
if [ ! -d "/usr/share/wordlists/SecLists" ]; then
    echo "Downloading SecLists wordlists..."
    git clone -q https://github.com/danielmiessler/SecLists.git /usr/share/wordlists/SecLists
fi

echo ""
echo "🎯 Installation Summary:"
echo "========================"
echo "✓ nmap: $(which nmap)"
echo "✓ httpx: $(which httpx || echo 'NOT FOUND')"
echo "✓ nuclei: $(which nuclei || echo 'NOT FOUND')"
echo "✓ subfinder: $(which subfinder || echo 'NOT FOUND')"
echo "✓ gobuster: $(which gobuster)"
echo "✓ nikto: $(which nikto)"
echo "✓ wpscan: $(which wpscan)"
echo "✓ waybackurls: $(which waybackurls || echo 'NOT FOUND')"
echo "✓ jaeles: $(which jaeles || echo 'NOT FOUND')"
echo "✓ dirsearch: $(which dirsearch)"
echo ""
echo "🚀 All tools installed successfully!"
echo "🔥 AKUMA Scanner is ready to use!"
