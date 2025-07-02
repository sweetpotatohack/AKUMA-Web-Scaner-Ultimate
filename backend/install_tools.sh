#!/bin/bash

# ==================== УСТАНОВКА ЗАВИСИМОСТЕЙ ====================
install_dependencies() {
    echo -e "\n[+] Установка необходимых зависимостей..."
    
    # Обновление пакетов
    apt update -y || { echo "❌ Ошибка при обновлении пакетов"; return 1; }
    
echo -e "\n[+] Установка Go (golang) >=1.23..."

# Проверим установлен ли go и его версию
if command -v go &>/dev/null && go version | grep -qE 'go1\.2[3-9]|go1\.[3-9][0-9]'; then
    echo "[i] Go уже установлен: $(go version)"
else
    # Сначала удалим старый golang, если есть
    apt remove -y golang-go golang || true

    # Выбираем последнюю стабильную (1.23.4) — можно менять под себя!
    GO_VERSION="1.23.4"
    ARCH=$(dpkg --print-architecture)
    case "$ARCH" in
      amd64) ARCH_DL="amd64";;
      arm64) ARCH_DL="arm64";;
      *) echo "Неизвестная архитектура: $ARCH"; exit 1;;
    esac

    wget -q https://go.dev/dl/go${GO_VERSION}.linux-${ARCH_DL}.tar.gz -O /tmp/go${GO_VERSION}.tar.gz
    rm -rf /usr/local/go && tar -C /usr/local -xzf /tmp/go${GO_VERSION}.tar.gz

    # Добавим go в PATH (один раз для этой сессии)
    export PATH=$PATH:/usr/local/go/bin
    if ! grep -q '/usr/local/go/bin' ~/.bashrc; then
        echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
    fi
    echo "[+] Установлен Go $(go version)"
fi

    echo -e "\n[+] Установка базовых пакетов..."
apt install -y --no-install-recommends \
    git curl wget nmap python3 python3-pip python3-venv ruby \
    jq docker.io docker-compose snapd libssl-dev xvfb \
    fonts-liberation fonts-noto-cjk fonts-noto-color-emoji ruby-dev \
    build-essential libcurl4-openssl-dev libxml2 libxml2-dev libxslt1-dev \
    libffi-dev zlib1g-dev python3-dev || { 
    echo "⚠ Ошибка установки некоторых пакетов, но продолжаем..."
}

    echo -e "\n[+] Установка pipx..."
if ! command -v pipx &>/dev/null; then
    python3 -m pip install --user pipx --break-system-packages 2>/dev/null
    if ! command -v pipx &>/dev/null; then
        echo "⚠ pipx через pip не установился, пробую через apt..."
        apt update && apt install -y pipx
    fi
    if ! command -v pipx &>/dev/null; then
        echo "❌ pipx не удалось установить ни через pip, ни через apt"
        return 1
    fi
    python3 -m pipx ensurepath || {
        echo "⚠ Не удалось настроить PATH для pipx"
        return 1
    }
    source ~/.bashrc 2>/dev/null || true
fi

    # Установка и настройка Ruby и WPScan
    echo -e "\n[+] Настройка Ruby и WPScan..."
    if ! command -v gem &>/dev/null; then
        apt install -y ruby rubygems || {
            echo "⚠ Не удалось установить Ruby и RubyGems"
            return 1
        }
    fi
    
    # Пропускаем обновление RubyGems, если установлен через apt
    if ! apt list --installed 2>/dev/null | grep -q rubygems; then
        gem update --system 2>/dev/null || echo "ℹ RubyGems установлен через apt, пропускаем обновление"
    else
        echo "ℹ RubyGems установлен через apt, пропускаем обновление"
    fi
    
    # Установка WPScan
    if ! command -v wpscan &>/dev/null; then
        echo "Установка WPScan через RubyGems..."
        if gem install wpscan; then
            echo "✅ WPScan успешно установлен"
        else
            echo "⚠ Попытка альтернативной установки WPScan..."
            if gem install wpscan --user-install; then
                # Добавляем путь к gems в PATH
                gem_path=$(find "$HOME/.gem/ruby" -name 'bin' -type d | head -n 1)
                if [ -n "$gem_path" ]; then
                    export PATH="$PATH:$gem_path"
                    echo "export PATH=\"\$PATH:$gem_path\"" >> ~/.bashrc
                    echo "✅ WPScan установлен в пользовательскую директорию"
                else
                    echo "⚠ Не удалось найти путь к WPScan"
                fi
            else
                echo "❌ Не удалось установить WPScan"
                return 1
            fi
        fi
    fi
    
    # Проверка установки WPScan
    if command -v wpscan &>/dev/null; then
        wpscan_version=$(wpscan --version | head -n 1 | awk '{print $2}')
        echo "✅ WPScan установлен (версия: $wpscan_version)"
    else
        echo "❌ WPScan не установлен, сканирование WordPress будет пропущено"
    fi
    
    echo -e "\n[+] Установка BBOT..."
if ! command -v bbot &>/dev/null; then
    # Удаляем старую версию bs4, если есть
    pip3 uninstall -y beautifulsoup4 bs4 || true
    # Устанавливаем совместимую версию bs4
    pip3 install --break-system-packages beautifulsoup4==4.12.0
    
    # pipx install с нужным флагом
    if pipx install bbot --break-system-packages; then
        bbot_path=$(pipx list --short | grep bbot | awk '{print $3}')
        if [ -n "$bbot_path" ]; then
            cp "$bbot_path/bin/bbot" /usr/local/bin/ || echo "⚠ Не удалось скопировать BBOT в /usr/local/bin"
        fi
        echo "✅ BBOT успешно установлен"
    else
        echo "❌ Не удалось установить BBOT"
        return 1
    fi
else
    echo "ℹ BBOT уже установлен, пропускаем установку"
fi

    # Остальные зависимости...
    # Установка lolcat (для цветного вывода)
    if ! command -v lolcat &>/dev/null; then
        if command -v gem &>/dev/null; then
            gem install lolcat || apt install -y lolcat || echo "⚠ Не удалось установить lolcat"
        else
            apt install -y lolcat || echo "⚠ Не удалось установить lolcat"
        fi
    fi
    
    # Настройка Go окружения
    echo -e "\n[+] Настройка Go окружения..."
    export GOPATH=$HOME/go
    export PATH=$PATH:$GOPATH/bin:/snap/bin
    if [ ! -d "$GOPATH" ]; then
        mkdir -p "$GOPATH"
        echo "export GOPATH=$HOME/go" >> ~/.bashrc
        echo "export PATH=\$PATH:\$GOPATH/bin:/snap/bin" >> ~/.bashrc
    fi
    
    # Установка Go инструментов
    echo -e "\n[+] Установка Go инструментов..."
    go_tools=(
        "github.com/projectdiscovery/httpx/cmd/httpx@latest"
        "github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest"
        "github.com/jaeles-project/jaeles@latest"
        "github.com/tomnomnom/waybackurls@latest"
        "github.com/tomnomnom/gf@latest"
    )
    
    for tool in "${go_tools[@]}"; do
        tool_name=$(basename "$tool" | cut -d'@' -f1)
        if ! command -v "$tool_name" &>/dev/null; then
            echo "Установка $tool_name..."
            if go install -v "$tool"; then
                echo "✅ $tool_name успешно установлен"
            else
                echo "⚠ Не удалось установить $tool_name"
            fi
        else
            echo "ℹ $tool_name уже установлен, пропускаем"
        fi
    done
    
    # Установка testssl (только git-версия)
    if ! command -v testssl &>/dev/null; then
        echo "Установка testssl..."
        rm -rf /opt/testssl 2>/dev/null
        if git clone --depth 1 https://github.com/drwetter/testssl.sh.git /opt/testssl; then
            ln -sf /opt/testssl/testssl.sh /usr/bin/testssl || echo "⚠ Не удалось создать симлинк для testssl"
            echo "✅ testssl успешно установлен"
        else
            echo "❌ Не удалось установить testssl"
        fi
    fi
    
    # Установка cloud_enum с виртуальным окружением
    if [ ! -f "/root/cloud_enum/cloud_enum.py" ]; then
        echo "Установка cloud_enum..."
        if python3 -m venv /opt/cloud_enum_venv && \
           source /opt/cloud_enum_venv/bin/activate && \
           git clone https://github.com/initstring/cloud_enum.git /root/cloud_enum && \
           pip3 install -r /root/cloud_enum/requirements.txt --break-system-packages; then
            deactivate
            # Создаем обертку для запуска
            echo -e '#!/bin/bash\nsource /opt/cloud_enum_venv/bin/activate\npython3 /root/cloud_enum/cloud_enum.py "$@"' > /usr/local/bin/cloud_enum
            chmod +x /usr/local/bin/cloud_enum
            echo "✅ cloud_enum успешно установлен"
        else
            echo "❌ Не удалось установить cloud_enum"
            deactivate 2>/dev/null
        fi
    fi
    
    # Установка шаблонов Nuclei для Bitrix
    if [ ! -d "/root/nuclei-templates-bitrix" ]; then
        echo "Установка шаблонов Nuclei для Bitrix..."
        if git clone https://github.com/jhonnybonny/nuclei-templates-bitrix.git /root/nuclei-templates-bitrix; then
            echo "✅ Шаблоны Nuclei для Bitrix успешно установлены"
        else
            echo "⚠ Не удалось клонировать nuclei-templates-bitrix"
        fi
    fi
    
    # Установка check_bitrix сканера
    if [ ! -f "/root/check_bitrix/test_bitrix.py" ]; then
        echo "Установка check_bitrix сканера..."
        if git clone https://github.com/k1rurk/check_bitrix.git /root/check_bitrix && \
           python3 -m pip install -r /root/check_bitrix/requirements.txt --break-system-packages; then
            echo "✅ check_bitrix успешно установлен"
        else
            echo "⚠ Не удалось установить зависимости check_bitrix"
        fi
    fi
    
    echo "✅ Все основные зависимости установлены или проверены"
    return 0
}

# Запускаем установку
install_dependencies
