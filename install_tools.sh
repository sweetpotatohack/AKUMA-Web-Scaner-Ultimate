#!/bin/bash

echo "🔥 AKUMA Scanner - Installing Security Tools 🔥"
echo "================================================"

# Обновляем систему
echo "[1/8] Updating system packages..."
apt update -qq

# Устанавливаем основные инструменты из репозиториев Kali
echo "[2/8] Installing core tools from repositories..."
apt install -y \
    nmap \
    whatweb \
    httpx-toolkit \
    gobuster \
    nikto \
    wpscan \
    python3-pip \
    git \
    curl \
    wget \
    unzip

# Создаем символические ссылки для httpx
echo "[3/8] Setting up httpx..."
ln -sf /usr/bin/httpx-toolkit /usr/local/bin/httpx

# Устанавливаем nuclei
echo "[4/8] Installing nuclei..."
if [ ! -f "/usr/local/bin/nuclei" ]; then
    wget -q -O nuclei.zip https://github.com/projectdiscovery/nuclei/releases/latest/download/nuclei_3.4.6_linux_amd64.zip
    unzip -q nuclei.zip
    mv nuclei /usr/local/bin/
    chmod +x /usr/local/bin/nuclei
    rm -f nuclei.zip LICENSE.md README*.md
fi

# Устанавливаем dirsearch
echo "[5/8] Installing dirsearch..."
if [ ! -d "/opt/dirsearch" ]; then
    git clone -q https://github.com/maurosoria/dirsearch.git /opt/dirsearch
    chmod +x /opt/dirsearch/dirsearch.py
    ln -sf /opt/dirsearch/dirsearch.py /usr/local/bin/dirsearch
fi

# Создаем директории для wordlists если их нет
echo "[6/8] Setting up wordlists..."
mkdir -p /usr/share/wordlists/dirb
mkdir -p /usr/share/wordlists/dirbuster

# Скачиваем базовые wordlists если их нет
if [ ! -f "/usr/share/wordlists/dirb/common.txt" ]; then
    wget -q -O /usr/share/wordlists/dirb/common.txt https://raw.githubusercontent.com/v0re/dirb/master/wordlists/common.txt
fi

if [ ! -f "/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt" ]; then
    wget -q -O /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt https://raw.githubusercontent.com/daviddias/node-dirbuster/master/lists/directory-list-2.3-medium.txt
fi

# Обновляем nuclei templates
echo "[7/8] Updating nuclei templates..."
nuclei -update-templates -silent 2>/dev/null || true

# Проверяем установку инструментов
echo "[8/8] Verifying tool installation..."
echo "✓ nmap: $(which nmap)"
echo "✓ httpx: $(which httpx || which httpx-toolkit)"  
echo "✓ nuclei: $(which nuclei)"
echo "✓ dirsearch: $(which dirsearch)"
echo "✓ whatweb: $(which whatweb)"
echo "✓ gobuster: $(which gobuster)"
echo "✓ nikto: $(which nikto)"

echo ""
echo "🎉 All tools installed successfully!"
echo "================================================"

# Устанавливаем Go инструменты
echo "[7/8] Installing Go tools..."
if command -v go &>/dev/null; then
    export GOPATH="/root/go"
    export PATH="$PATH:/root/go/bin"
    
    echo "Installing waybackurls..."
    go install github.com/tomnomnom/waybackurls@latest
    
    echo "Installing jaeles..."
    go install github.com/jaeles-project/jaeles@latest
fi

# Устанавливаем специальные инструменты
echo "[8/8] Installing specialized tools..."

# Cloud enum
if [ ! -d "/root/cloud_enum" ]; then
    git clone https://github.com/initstring/cloud_enum.git /root/cloud_enum
    pip3 install -r /root/cloud_enum/requirements.txt --break-system-packages
fi

# Nuclei templates for Bitrix
if [ ! -d "/root/nuclei-templates-bitrix" ]; then
    git clone https://github.com/jhonnybonny/nuclei-templates-bitrix.git /root/nuclei-templates-bitrix
fi

# Check Bitrix scanner
if [ ! -d "/root/check_bitrix" ]; then
    git clone https://github.com/k1rurk/check_bitrix.git /root/check_bitrix
    pip3 install -r /root/check_bitrix/requirements.txt --break-system-packages
fi

# TestSSL
if [ ! -d "/opt/testssl.sh" ]; then
    git clone --depth 1 https://github.com/drwetter/testssl.sh.git /opt/testssl.sh
    chmod +x /opt/testssl.sh/testssl.sh
    ln -sf /opt/testssl.sh/testssl.sh /usr/local/bin/testssl
fi

echo "✅ All tools installed successfully!"
echo "🔥 AKUMA Scanner is ready to rock! 🔥"
