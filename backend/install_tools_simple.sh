#!/bin/bash

# Простая установка только базовых инструментов
echo "[+] Установка основных зависимостей..."

# Обновление пакетов
apt update -y

# Установка Go
echo "[+] Установка Go..."
GO_VERSION="1.23.4"
wget -q https://go.dev/dl/go${GO_VERSION}.linux-amd64.tar.gz -O /tmp/go.tar.gz
rm -rf /usr/local/go && tar -C /usr/local -xzf /tmp/go.tar.gz
export PATH=$PATH:/usr/local/go/bin
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc

# Настройка Go окружения
export GOPATH=/root/go
mkdir -p $GOPATH
echo 'export GOPATH=/root/go' >> ~/.bashrc
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.bashrc

# Установка Go инструментов
echo "[+] Установка httpx..."
go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest

echo "[+] Установка nuclei..."
go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest

echo "[+] Установка waybackurls..."
go install -v github.com/tomnomnom/waybackurls@latest

echo "[+] Установка lolcat..."
gem install lolcat

echo "[+] Установка nuclei шаблонов для Bitrix..."
git clone https://github.com/jhonnybonny/nuclei-templates-bitrix.git /root/nuclei-templates-bitrix

echo "[+] Установка check_bitrix сканера..."
git clone https://github.com/k1rurk/check_bitrix.git /root/check_bitrix
pip3 install -r /root/check_bitrix/requirements.txt --break-system-packages 2>/dev/null || true

echo "✅ Установка завершена!"
