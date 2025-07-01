#!/bin/bash
# Глючная загрузка - киберпанк хак-экран
clear
tput civis  # скрыть курсор

glitch_lines=(
"Ξ Запуск терраформирования матрицы... [отключаю холодильник соседа]"
"Ξ Бутстрап рута... [мама сказала, чтобы не запускал это]"
"Ξ Вызов цифрового шамана... [AI-гадание на эксплойте]"
"Ξ Внедрение пакета чёрного кофе... [держусь на последнем байте]"
"Ξ Отправка дронов в darknet... [их там уже ждут]"
"Ξ Переименование себя в admin... ok [ну а что, могу себе позволить]"
"Ξ Калибровка хаос-алгоритма... ok [ещё чуть-чуть, и баг превратится в фичу]"
"Ξ Подмена сигнатуры антивируса... [сканирую на вирусы в самой жизни]"
"Ξ ████████████▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░ [11%] заливаю утреннюю паранойю"
"Ξ ███████████████▓▓▓▓▓▓▓░░░░░░░░░░░░░░░░ [51%] канализирую данные через тостер"
"Ξ ███████████████████████▓▓▓▓▓░░░░░░░░ [82%] провожу ритуал безоткатного доступа"
"Ξ ████████████████████████████████████ [100%] скан завершён — ты официально киборг"
)

for line in "${glitch_lines[@]}"; do
  if command -v lolcat &>/dev/null; then
    echo -ne "\e[1;32m$line\e[0m\n" | lolcat
  else
    echo -ne "\e[1;38;5;82m$line\e[0m\n"
  fi
  sleep 0.2
done

# ASCII-заставка с ником AKUMA
echo -e "\n\e[1;38;5;201m █████╗ ██╗  ██╗██╗   ██╗███╗   ███╗ █████╗ \n██╔══██╗██║ ██╔╝██║   ██║████╗ ████║██╔══██╗\n███████║█████╔╝ ██║   ██║██╔████╔██║███████║\n██╔══██║██╔═██╗ ██║   ██║██║╚██╔╝██║██╔══██║\n██║  ██║██║  ██╗╚██████╔╝██║ ╚═╝ ██║██║  ██║\n╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝\n\e[0m"

echo ""
echo -ne "\e[1;38;5;93m┌──────────────────────────────────────────────────────┐\e[0m\n"
echo -ne "\e[1;38;5;93m│ \e[0m\e[1;38;5;87m WELCOME TO CYBER-DEEP SCAN, АКУМА В СТРОЮ! \e[0m\e[1;38;5;93m│\e[0m\n"
echo -ne "\e[1;38;5;93m└──────────────────────────────────────────────────────┘\e[0m\n"
sleep 1

for i in {1..30}; do
    echo -ne "\e[32m$(head /dev/urandom | tr -dc 'A-Za-z0-9!@#$%^&*_?' | head -c $((RANDOM % 28 + 12)))\r\e[0m"
    sleep 0.05
done

sleep 0.3

nickname="AKUMA"
for ((i=0; i<${#nickname}; i++)); do
    echo -ne "\e[1;31m${nickname:$i:1}\e[0m"
    sleep 0.15
done
echo ""
tput cnorm  # вернуть курсор

echo -e "\n"
target_file=""
ZOMBIE_FILTER=0
custom_targets=()

usage() {
    cat <<EOF
AKUMA SCANER — киберпанк сканер для багбаунти/редтиминга

Использование:
  $0 -f <файл_с_целями> [опции]
  $0 <ip/подсеть/домен>... [опции]

Ключи:
  -f <file>     Файл с целями (IP или домены, по одному на строку)
  -z            Включить TCP-зомби фильтр (по портам AD/топовые)
  -h, --help    Показать это меню

Примеры:
  $0 -f targets.txt              — сканировать все up-хосты без TCP-фильтра
  $0 -f targets.txt -z           — только хосты с открытыми топовыми портами
  $0 192.168.1.24                — одиночный IP
  $0 192.168.1.0/24 -z           — подсеть с зомби-фильтром
  $0 example.com                 — домен
  $0 192.168.1.1 example.com -z  — несколько целей с зомби-фильтром

EOF
    exit 0
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        -f)
            target_file="$2"
            shift 2
            ;;
        -z)
            ZOMBIE_FILTER=1
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            custom_targets+=("$1")
            shift
            ;;
    esac
done

if [[ ${#custom_targets[@]} -gt 0 ]]; then
    target_file=$(mktemp)
    printf "%s\n" "${custom_targets[@]}" > "$target_file"
fi

if [[ -z "$target_file" ]] || [[ ! -f "$target_file" ]]; then
    echo "❌ Файл целей '$target_file' не существует или не указан"
    usage
fi

# ==================== УСТАНОВКА ЗАВИСИМОСТЕЙ ====================
install_dependencies() {
    echo -e "\n[+] Установка необходимых зависимостей..."
    
    # Проверка на root-права
    if [ "$EUID" -ne 0 ]; then
        echo "❌ Требуются root-права! Запустите скрипт с sudo."
        exit 1
    fi
    
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

# ==================== ОСНОВНОЙ СКРИПТ ====================

# Установка зависимостей перед началом работы
if ! install_dependencies; then
    echo "❌ Критические зависимости не установлены. Завершение."
    exit 1
fi

# ==================== НАСТРОЙКИ ====================
LOG_DIR="/root/web_scan/$(date +%d-%m-%Y)-external"
mkdir -p "$LOG_DIR" || { echo "Не могу создать $LOG_DIR"; exit 1; }
cd "$LOG_DIR" || { echo "Не могу перейти в $LOG_DIR"; exit 1; }

# Функция для логирования
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_DIR/scan.log"
}

# Функция для очистки цветовых кодов
clean_colors() {
    sed -r "s/\x1B\[[0-9;]*[mK]//g"
}

# Функция для получения Webhook URL
get_webhook_url() {
    if command -v curl &>/dev/null && command -v jq &>/dev/null; then
        response=$(curl -s -X POST "https://webhook.site/token" 2>/dev/null)
        token=$(echo "$response" | jq -r '.uuid' 2>/dev/null)
        
        if [ -n "$token" ]; then
            echo "https://webhook.site/$token"
            return
        fi
    fi
    
    random_token=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32 2>/dev/null)
    echo "https://webhook.site/${random_token:-default-token-$(date +%s)}"
}

# Функция для проверки SSL
run_ssl_scan() {
    local url=$1
    local domain=$(echo "$url" | awk -F/ '{print $3}' | sed 's/\[.*//')
    
    log "Проверка SSL для $domain"
    
    if ping -c 1 "$domain" &> /dev/null; then
        testssl --htmlfile "$LOG_DIR/ssl_audit/${domain}.html" "$url" > /dev/null 2>&1
        
        if [ ! -f "$LOG_DIR/ssl_audit/${domain}.html" ]; then
            log "⚠ Не удалось создать SSL отчет для $url"
            touch "$LOG_DIR/ssl_audit/${domain}.html"
        fi
    else
        log "⚠ Хост $domain недоступен, пропускаем SSL проверку"
    fi
}

# Функция для получения доменного имени по IP:port
get_domain_from_ip_port() {
    local ip_port=$1
    local ip=$(echo "$ip_port" | cut -d: -f1)
    local port=$(echo "$ip_port" | cut -d: -f2)
    
    # Пробуем получить имя через curl
    local name=$(timeout 5 curl -vsk "https://$ip:$port" 2>&1 | grep -oP '(?<=subject: CN=).*' | head -1)
    
    # Если не получилось, пробуем через openssl
    if [ -z "$name" ]; then
        name=$(timeout 5 openssl s_client -connect "$ip:$port" -servername any 2>/dev/null | \
               openssl x509 -noout -subject 2>/dev/null | grep -oP '(?<=CN = ).*')
    fi
    
    echo "$name"
}

# Функция для сканирования WordPress
scan_wordpress() {
    local url=$1
    local clean_url=$(echo "$url" | sed "s|^http[s]*://||;s|[:/]|_|g;s/\[.*\]//g;s/ *$//")
    
    log "Запуск WPScan для $url"
    wpscan --url "$(echo "$url" | awk '{print $1}')" --force --api-token 7xSvi2jEhfZyHeEnOLXeWxmskjQbwsOCTHXlrzzq6Is --format json --output "$LOG_DIR/wordpress_scan/${clean_url}_wpscan.json" || {
        log "⚠ Ошибка WPScan для $url"
    }
    
    # Анализ результатов WPScan
    if [ -f "$LOG_DIR/wordpress_scan/${clean_url}_wpscan.json" ]; then
        local vuln_count=$(jq '.version.vulnerabilities | length' "$LOG_DIR/wordpress_scan/${clean_url}_wpscan.json" 2>/dev/null || echo 0)
        local plugin_count=$(jq '.plugins | length' "$LOG_DIR/wordpress_scan/${clean_url}_wpscan.json" 2>/dev/null || echo 0)
        
        log "Найдено $vuln_count уязвимостей WordPress и $plugin_count плагинов"
    fi
}

# Функция для поиска поддоменов с помощью BBOT
scan_subdomains() {
    local domain=$1
    
    if ! command -v bbot &>/dev/null; then
        log "⚠ BBOT не установлен, пропускаем поиск поддоменов"
        return
    fi
    
    log "▶ Поиск поддоменов для $domain с помощью BBOT..."
    mkdir -p "$LOG_DIR/subdomains/${domain}_subdomains"
    
    # Запускаем BBOT и сохраняем вывод для анализа
    bbot_output=$(bbot -t "$domain" -f subdomain-enum -y --output-module csv -o "$LOG_DIR/subdomains/${domain}_subdomains" 2>&1)
    
    # Ищем все возможные файлы с поддоменами
    subdomains_file=$(find "$LOG_DIR/subdomains/${domain}_subdomains" -name "subdomains.*" -o -name "subdomains.txt" -o -name "subdomains.csv" | head -n 1)
    
    if [ -n "$subdomains_file" ] && [ -s "$subdomains_file" ]; then
        # Определяем формат файла (CSV или TXT)
        if [[ "$subdomains_file" == *.csv ]]; then
            # Для CSV файлов извлекаем первый столбец
            sub_count=$(awk -F, 'NR>1 {print $1}' "$subdomains_file" | sort -u | tee "$LOG_DIR/subdomains/${domain}_subdomains/clean_subdomains.txt" | wc -l)
        else
            # Для TXT файлов просто считаем строки
            sub_count=$(sort -u "$subdomains_file" | tee "$LOG_DIR/subdomains/${domain}_subdomains/clean_subdomains.txt" | wc -l)
        fi
        
        log "Найдено поддоменов: $sub_count"
        # Добавляем найденные поддомены в общий список целей
        cat "$LOG_DIR/subdomains/${domain}_subdomains/clean_subdomains.txt" >> "$LOG_DIR/subdomains/all_subdomains.txt"
        
        # Сохраняем полный вывод BBOT для отладки
        echo "$bbot_output" > "$LOG_DIR/subdomains/${domain}_subdomains/bbot_output.log"
    else
        log "⚠ BBOT не нашел поддоменов для $domain или не смог сохранить результаты"
        log "Вывод BBOT: $bbot_output"
    fi
}

# Функция для анализа исторических URL
analyze_wayback_urls() {
    local wayback_file="$1"
    local output_file="$2"
    
    if [ ! -s "$wayback_file" ]; then
        log "⚠ Файл исторических URL пуст"
        return
    fi
    
    # Извлекаем уникальные поддомены
    grep -oP 'https?://\K[^/]+' "$wayback_file" | sort -u > "$output_file"
    
    local sub_count=$(wc -l < "$output_file")
    log "Найдено уникальных поддоменов в исторических данных: $sub_count"
    
    # Добавляем найденные поддомены в общий список
    cat "$output_file" >> "$LOG_DIR/subdomains/all_subdomains.txt"
}

# Улучшенная проверка инструментов
check_tools() {
    local missing_tools=()
    local required_tools=("nmap" "httpx" "nuclei" "whatweb" "wpscan" "gobuster" "nikto" "curl" "python3")
    
    log "🔧 Checking required tools..."
    
    # Проверяем основные инструменты
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &>/dev/null; then
            # Специальная проверка для httpx
            if [[ "$tool" == "httpx" ]] && command -v "httpx-toolkit" &>/dev/null; then
                # httpx установлен как httpx-toolkit, создаем симлинк
                ln -sf /usr/bin/httpx-toolkit /usr/local/bin/httpx
                continue
            fi
            missing_tools+=("$tool")
        fi
    done
    
    # Проверяем специальные инструменты
    if [ ! -f "/root/cloud_enum/cloud_enum.py" ]; then
        missing_tools+=("cloud_enum")
    fi
    
    if [ ! -d "/root/nuclei-templates-bitrix" ]; then
        missing_tools+=("bitrix_templates")
    fi
    
    if [ ! -f "/root/check_bitrix/test_bitrix.py" ]; then
        missing_tools+=("check_bitrix")
    fi
    
    if [ ! -f "/opt/testssl.sh/testssl.sh" ]; then
        missing_tools+=("testssl")
    fi
    
    if ! command -v "waybackurls" &>/dev/null; then
        missing_tools+=("waybackurls")
    fi
    
    if ! command -v "jaeles" &>/dev/null; then
        missing_tools+=("jaeles")
    fi
    
    # Если есть отсутствующие инструменты - устанавливаем
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log "⚠️ Missing tools: ${missing_tools[*]}"
        log "🔧 Installing missing tools..."
        
        # Запускаем скрипт установки
        if [ -f "./install_tools.sh" ]; then
            bash ./install_tools.sh
        else
            log "❌ install_tools.sh not found!"
            return 1
        fi
        
        # Устанавливаем Go инструменты если Go доступен
        if command -v go &>/dev/null; then
            export GOPATH="/root/go"
            export PATH="$PATH:/root/go/bin"
            
            for tool in "${missing_tools[@]}"; do
                case "$tool" in
                    "waybackurls")
                        go install github.com/tomnomnom/waybackurls@latest
                        ;;
                    "jaeles")
                        go install github.com/jaeles-project/jaeles@latest
                        ;;
                esac
            done
        fi
        
        # Устанавливаем специальные инструменты
        for tool in "${missing_tools[@]}"; do
            case "$tool" in
                "cloud_enum")
                    if [ ! -f "/root/cloud_enum/cloud_enum.py" ]; then
                        git clone https://github.com/initstring/cloud_enum.git /root/cloud_enum
                        pip3 install -r /root/cloud_enum/requirements.txt --break-system-packages
                    fi
                    ;;
                "bitrix_templates")
                    if [ ! -d "/root/nuclei-templates-bitrix" ]; then
                        git clone https://github.com/jhonnybonny/nuclei-templates-bitrix.git /root/nuclei-templates-bitrix
                    fi
                    ;;
                "check_bitrix")
                    if [ ! -f "/root/check_bitrix/test_bitrix.py" ]; then
                        git clone https://github.com/k1rurk/check_bitrix.git /root/check_bitrix
                        pip3 install -r /root/check_bitrix/requirements.txt --break-system-packages
                    fi
                    ;;
                "testssl")
                    if [ ! -f "/opt/testssl.sh/testssl.sh" ]; then
                        git clone --depth 1 https://github.com/drwetter/testssl.sh.git /opt/testssl.sh
                        chmod +x /opt/testssl.sh/testssl.sh
                        ln -sf /opt/testssl.sh/testssl.sh /usr/local/bin/testssl
                    fi
                    ;;
            esac
        done
    fi
    
    # Проверяем, что все критически важные инструменты установлены
    local critical_missing=()
    for tool in "nmap" "curl" "python3"; do
        if ! command -v "$tool" &>/dev/null; then
            critical_missing+=("$tool")
        fi
    done
    
    if [ ${#critical_missing[@]} -gt 0 ]; then
        log "❌ Critical tools missing: ${critical_missing[*]}"
        return 1
    fi
    
    log "✅ Tool check completed"
    return 0
}

# Функция для очистки и валидации URL перед обработкой
clean_and_validate_url() {
    local url=$1
    # Удаляем все, что не является частью URL (электронные адреса и т.д.)
    url=$(echo "$url" | sed 's/[[:space:]].*//; s/,[^/]*$//')
    
    # Проверяем, что URL соответствует правильному формату
    if [[ "$url" =~ ^https?://[a-zA-Z0-9.-]+(:[0-9]+)?(/[^[:space:]]*)?$ ]]; then
        echo "$url"
    else
        echo ""
    fi
}

# Функция проверки Bitrix
check_bitrix() {
    local url=$1
    local clean_url=$(echo "$url" | sed "s|^http[s]*://||;s|[:/]|_|g")
    
    log "Проверка Bitrix для $url"
    local temp_file=$(mktemp)
    
    whatweb -v -a 3 "$url" > "$temp_file" 2>&1
    
    if grep -qi "1C-Bitrix" "$temp_file"; then
        # Извлекаем домен из URL
        local domain=$(echo "$url" | awk -F/ '{print $3}' | sed 's/:.*//')
        
        # Проверяем, что это не IP-адрес
        if [[ ! "$domain" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            mkdir -p "$LOG_DIR/bitrix_targets"
            echo "$url" >> "$LOG_DIR/bitrix_targets/bitrix_sites.txt"
            log "Обнаружен Bitrix: $url"
            
            clean_colors < "$temp_file" > "$LOG_DIR/whatweb_result/${clean_url}_clean.txt"
            scan_bitrix "$url" "$clean_url"
        else
            log "Пропускаем IP-адрес $domain, хотя обнаружен Bitrix"
        fi
    else
        log "Bitrix не обнаружен на $url"
    fi
    
    rm -f "$temp_file"
}

# Функция сканирования Bitrix
scan_bitrix() {
    local url=$1
    local clean_name=$2
    
    # Извлекаем домен из URL
    local domain=$(echo "$url" | awk -F/ '{print $3}' | sed 's/:.*//')
    
    # Формируем корректный URL для сканирования
    if [[ "$url" != http* ]]; then
        url="https://$domain"
    fi
    
    log "Запуск check_bitrix для $url"
    mkdir -p "$LOG_DIR/bitrix_scan_results"
    
    # Запускаем сканирование только если это не IP-адрес
    if [[ ! "$domain" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        python3 /root/check_bitrix/test_bitrix.py -t "$url" scan -s "$WEBHOOK_URL" > "$LOG_DIR/bitrix_scan_results/${clean_name}_check.txt" 2>&1
        
        log "Запуск Nuclei для Bitrix $url"
        nuclei -u "$url" -t /root/nuclei-templates-bitrix/ -o "$LOG_DIR/bitrix_scan_results/${clean_name}_nuclei.txt" 2>/dev/null
    else
        log "Пропускаем сканирование Bitrix для IP-адреса $domain"
        echo "Сканирование пропущено: IP-адрес $domain" > "$LOG_DIR/bitrix_scan_results/${clean_name}_check.txt"
    fi
}

# Функция подготовки списка для waybackurls
prepare_wayback_list() {
    local input_file="$1"
    local output_file="$2"
    
    > "$output_file"  # Очищаем файл
    
    # Создаем временный файл с очищенными URL
    temp_file=$(mktemp)
    awk '{print $1}' "$input_file" | while read -r url; do
        # Очищаем и проверяем каждый URL
        cleaned_url=$(clean_and_validate_url "$url")
        if [ -n "$cleaned_url" ]; then
            echo "$cleaned_url" >> "$temp_file"
        fi
    done
    
    # Удаляем дубликаты и сохраняем
    sort -u "$temp_file" > "$output_file"
    rm -f "$temp_file"
    
    # Логируем содержимое для отладки
    log "Подготовленные URL для waybackurls:"
    log "$(head -n 10 "$output_file")"
}

# ==================== ОСНОВНОЙ СКРИПТ ====================
log "=== Начало сканирования внешнего периметра ==="
if ! check_tools; then
    log "❌ Критические инструменты отсутствуют. Завершение."
    exit 1
fi

# Получаем уникальный Webhook URL
WEBHOOK_URL=$(get_webhook_url)
log "Используется Webhook URL: $WEBHOOK_URL"
if [[ "$WEBHOOK_URL" == *"default-token"* ]]; then
    log "⚠ Внимание: используется дефолтный webhook URL, результаты могут быть неполными"
fi

# Создаем необходимые директории
mkdir -p "$LOG_DIR"/{bitrix_targets,bitrix_scan_results,whatweb_result,ssl_audit,wayback,wordpress_scan,cloud,jaeles_results,leaks,_redirects,subdomains}

# 1. ПИНГ-СКАН + ОДНОВРЕМЕННО СОХРАНЯЕМ ВСЁ!
log "▶ Пинг-сканирование (ICMP nmap)..."

awk '{print $1}' "$target_file" | sed '/^$/d;/^#/d' | sort -u > "$LOG_DIR/initial_scope.txt"

# Пинг ICMP только IP и домены, которые резолвятся
nmap -sn -iL "$target_file" -oG "$LOG_DIR/ping_result.txt"
awk '/Up$/{print $2}' "$LOG_DIR/ping_result.txt" > "$LOG_DIR/up_hosts.txt"

# Резолвим домены в IP (домены сами не выбрасываем!)
> "$LOG_DIR/resolved_ips.txt"
while read host; do
    [[ -z "$host" || "$host" =~ ^# ]] && continue
    if [[ "$host" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo "$host" >> "$LOG_DIR/resolved_ips.txt"
    else
        dig +short "$host" | grep -E '^[0-9.]+' >> "$LOG_DIR/resolved_ips.txt"
    fi
done < "$LOG_DIR/initial_scope.txt"
sort -u "$LOG_DIR/resolved_ips.txt" -o "$LOG_DIR/resolved_ips.txt"

# IP, которые реально up
comm -12 <(sort "$LOG_DIR/up_hosts.txt") <(sort "$LOG_DIR/resolved_ips.txt") > "$LOG_DIR/up_and_resolved_ips.txt"

# TCP-зомби фильтр
if [ "$ZOMBIE_FILTER" = "1" ]; then
    log "▶ TCP-зомби фильтр активен (AD + топовые порты)"
    AD_PORTS="53 88 135 137 138 139 389 445 464 636 3268 3269 5985 5986 9389 80 443 21 22 23 25 110 143 8080"
    > "$LOG_DIR/zombie_alive.txt"
    while read ip; do
        for port in $AD_PORTS; do
            timeout 1 bash -c "echo > /dev/tcp/$ip/$port" 2>/dev/null
            if [ $? -eq 0 ]; then
                echo "$ip" >> "$LOG_DIR/zombie_alive.txt"
                break
            fi
        done
    done < "$LOG_DIR/up_and_resolved_ips.txt"
    sort -u "$LOG_DIR/zombie_alive.txt" -o "$LOG_DIR/up_and_resolved_ips.txt"
else
    log "▶ Зомби-фильтр отключён — все up-хосты идут дальше"
fi

# Собираем финальный scope:
#  - домены из исходника (никогда не теряем!)
#  - IP, которые прошли резолв+пинг (+ зомби фильтр, если был)
#  - убираем дубли
grep -vE '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$' "$LOG_DIR/initial_scope.txt" > "$LOG_DIR/dns_only.txt"
cat "$LOG_DIR/dns_only.txt" "$LOG_DIR/up_and_resolved_ips.txt" | sort -u > "$LOG_DIR/targets_clean.txt"

if [ ! -s "$LOG_DIR/targets_clean.txt" ]; then
    log "❌ Нет целей после фильтрации (ICMP, резолв, зомби)"
    exit 1
fi

log "▶ Итоговый scope для дальнейшего сканирования:"
cat "$LOG_DIR/targets_clean.txt" | tee -a "$LOG_DIR/scan.log"


# 3. Поиск поддоменов для доменов из target_file
log "▶ Поиск поддоменов..."
# Извлекаем домены из файла целей (исключая IP-адреса)
grep -vE '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' "$target_file" | while read -r domain; do
    scan_subdomains "$domain"
done

# Логируем найденные поддомены, но не добавляем их в список целей
if [ -f "$LOG_DIR/subdomains/all_subdomains.txt" ]; then
    log "Найдено поддоменов: $(wc -l < "$LOG_DIR/subdomains/all_subdomains.txt") (не добавляются в scope сканирования)"
fi

# 4. Детальное сканирование 
log "▶ Глубокое сканирование портов..."
 nmap -p- -sV -Pn --script=http-title,ssl-cert \
     --min-rate 500 --max-rate 1000 \
     --open -oA "$LOG_DIR/nmap_result" \
     $(cat "$LOG_DIR/targets_clean.txt") || {
    log "⚠ Nmap завершился с ошибками, но продолжаем"
}

# 5. Интеграция с Grafana
log "▶ Копирование результатов nmap для Grafana..."
if [ -d "/root/nmap-did-what/data" ]; then
    cp "$LOG_DIR/nmap_result.xml" "/root/nmap-did-what/data/" || {
        log "⚠ Не удалось скопировать результаты для Grafana"
    }

    log "▶ Перезапуск Grafana..."
    cd "/root/nmap-did-what/grafana-docker" && \
    docker-compose up -d || {
        log "⚠ Не удалось перезапустить Grafana"
    }

    log "▶ Создание базы данных для Grafana..."
    cd "/root/nmap-did-what/data/" && \
    python3 nmap-to-sqlite.py nmap_result.xml || {
        log "⚠ Не удалось создать базу данных Grafana"
    }
    cd "$LOG_DIR"
else
    log "⚠ Пропускаем интеграцию с Grafana: директория nmap-did-what не найдена"
fi

# 6. Извлечение открытых портов с проверкой
log "▶ Анализ результатов nmap..."
if [ ! -f "$LOG_DIR/nmap_result.gnmap" ]; then
    log "❌ Файл nmap_result.gnmap не найден"
    exit 1
fi

grep "Ports:" "$LOG_DIR/nmap_result.gnmap" | awk -F"[ /]" '{
    split($0, a, "Ports: "); 
    split(a[2], ports, ", "); 
    for (i in ports) { 
        split(ports[i], p, "/"); 
        if (p[1] ~ /^[0-9]+$/ && p[1] <= 65535) {
            print $2":"p[1]; 
        }
    }
}' > "$LOG_DIR/open_ports.txt"

if [ ! -s "$LOG_DIR/open_ports.txt" ]; then
    log "⚠ Нет открытых портов, создаем минимальный список"
    awk '{print $1":80"}' "$LOG_DIR/targets_clean.txt" > "$LOG_DIR/open_ports.txt"
fi

# 7. Проверка веб-сервисов с улучшенной обработкой
log "▶ Верификация веб-сервисов..."
if [ ! -s "$LOG_DIR/open_ports.txt" ]; then
    log "❌ Файл open_ports.txt пуст"
    exit 1
fi

# Создаем объединенный список целей: оригинальные домены + открытые порты
cat "$target_file" "$LOG_DIR/open_ports.txt" | sort -u > "$LOG_DIR/combined_targets.txt"

# Проверяем веб-сервисы по объединенному списку
if command -v httpx >/dev/null; then
    httpx -list "$LOG_DIR/combined_targets.txt" -title -tech-detect -status-code -o "$LOG_DIR/httpx_live.txt" -silent || {
        log "⚠ Ошибка httpx, создаем fallback"
        # Форматируем open_ports.txt в URL
        sed 's/:/\/\//;s/$/\//' "$LOG_DIR/open_ports.txt" | sed 's/^/http:\/\//' > "$LOG_DIR/httpx_live.txt"
        # Добавляем оригинальные домены
        grep -vE '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' "$target_file" >> "$LOG_DIR/httpx_live.txt"
    }
else
    log "❌ httpx не установлен, используем fallback"
    sed 's/:/\/\//;s/$/\//' "$LOG_DIR/open_ports.txt" | sed 's/^/http:\/\//' > "$LOG_DIR/httpx_live.txt"
    grep -vE '^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' "$target_file" >> "$LOG_DIR/httpx_live.txt"
fi

# Очищаем httpx_live.txt от лишней информации
awk '{print $1}' "$LOG_DIR/httpx_live.txt" | sort -u > "$LOG_DIR/httpx_clean_urls.txt"

# Получаем домены из редиректов nmap перед WhatWeb
log "▶ Анализ редиректов из отчета nmap..."
grep "Did not follow redirect to" "$LOG_DIR/nmap_result.nmap" | \
awk '{print $2" -> "$NF}' | sort -u > "$LOG_DIR/nmap_redirects/redirects.txt"

# Добавляем найденные редиректы в общий список доменов
if [ -s "$LOG_DIR/nmap_redirects/redirects.txt" ]; then
    log "Найдены редиректы в отчете nmap:"
    # Создаем временный файл с дополненными целями
    temp_targets=$(mktemp)
    cp "$LOG_DIR/httpx_clean_urls.txt" "$temp_targets"
    
    cat "$LOG_DIR/nmap_redirects/redirects.txt" | while read -r line; do
        redirect_url=$(echo "$line" | awk -F' -> ' '{print $2}' | sed 's/\/$//')
        log "  Добавляем редирект: $redirect_url"
        echo "$redirect_url" >> "$temp_targets"
    done
    
    # Обновляем httpx_clean_urls.txt с учетом редиректов
    sort -u "$temp_targets" -o "$LOG_DIR/httpx_clean_urls.txt"
    rm -f "$temp_targets"
else
    log "В отчете nmap не найдено редиректов"
fi

# 8. Запуск WhatWeb и проверка Bitrix/WordPress
log "▶ Запуск WhatWeb..."
processed_bitrix=()
processed_wordpress=()
while read -r url; do
    # Очищаем URL от цветовых кодов и дополнительной информации
    clean_url=$(echo "$url" | sed 's/\[.*//')
    clean_name=$(echo "$clean_url" | sed "s|^http[s]*://||;s|[:/]|_|g")
    
    log "Проверка $clean_url"
    
    # Запускаем WhatWeb и сохраняем результат
    whatweb -v -a 3 "$clean_url" > "$LOG_DIR/whatweb_result/${clean_name}.txt" 2>&1
    
    # Очищаем цвета и сохраняем чистый лог
    clean_colors < "$LOG_DIR/whatweb_result/${clean_name}.txt" > "$LOG_DIR/whatweb_result/${clean_name}_clean.txt"
    
    # Проверка на Bitrix
    if grep -qi "1C-Bitrix" "$LOG_DIR/whatweb_result/${clean_name}_clean.txt"; then
        domain=$(echo "$clean_url" | awk -F/ '{print $3}' | sed 's/:.*//')
        
        # Проверяем, не сканировали ли мы уже этот домен
        if [[ ! " ${processed_bitrix[@]} " =~ " ${domain} " ]]; then
            mkdir -p "$LOG_DIR/bitrix_targets"
            echo "$clean_url" >> "$LOG_DIR/bitrix_targets/bitrix_sites.txt"
            log "Обнаружен Bitrix: $clean_url"
            
            # Формируем корректный URL для check_bitrix.py
            if [[ "$clean_url" != http* ]]; then
                scan_url="https://$domain"
            else
                scan_url="$clean_url"
            fi
            
            scan_bitrix "$scan_url" "$clean_name"
            processed_bitrix+=("$domain")
        else
            log "Bitrix для домена $domain уже проверялся, пропускаем"
        fi
    fi
    
    # Проверка на WordPress
    if grep -qi "WordPress" "$LOG_DIR/whatweb_result/${clean_name}_clean.txt"; then
        domain=$(echo "$clean_url" | awk -F/ '{print $3}' | sed 's/:.*//')
        
        # Проверяем, не сканировали ли мы уже этот домен
        if [[ ! " ${processed_wordpress[@]} " =~ " ${domain} " ]]; then
            mkdir -p "$LOG_DIR/wordpress_scan"
            echo "$clean_url" >> "$LOG_DIR/wordpress_scan/wordpress_sites.txt"
            log "Обнаружен WordPress: $clean_url"
            
            # Формируем корректный URL для WPScan
            if [[ "$clean_url" != http* ]]; then
                scan_url="https://$domain"
            else
                scan_url="$clean_url"
            fi
            
            scan_wordpress "$scan_url"
            processed_wordpress+=("$domain")
        else
            log "WordPress для домена $domain уже проверялся, пропускаем"
        fi
    fi
done < "$LOG_DIR/httpx_clean_urls.txt"

log "Сканирование WhatWeb завершено."

# 9. SSL/TLS аудит
log "▶ Проверка SSL/TLS..."
while read -r url; do
    run_ssl_scan "$url"
done < "$LOG_DIR/httpx_clean_urls.txt"

# 10. Подготовка списка для waybackurls
log "▶ Подготовка списка для Waybackurls..."
prepare_wayback_list "$LOG_DIR/httpx_live.txt" "$LOG_DIR/wayback/domains.txt"

# 11. Поиск исторических URL через Waybackurls
log "▶ Поиск исторических URL через Waybackurls..."
if [ -s "$LOG_DIR/wayback/domains.txt" ]; then
    cat "$LOG_DIR/wayback/domains.txt" | waybackurls > "$LOG_DIR/wayback/urls.txt" 2>/dev/null
    wayback_count=$(wc -l < "$LOG_DIR/wayback/urls.txt" 2>/dev/null)
    wayback_count=${wayback_count:-0}
    log "Найдено $wayback_count исторических URL"

    # Анализ найденных URL
    if [ -s "$LOG_DIR/wayback/urls.txt" ]; then
        log "▶ Анализ найденных URL..."
        mkdir -p "$LOG_DIR/leaks"
        
        # Извлекаем поддомены из исторических URL
        analyze_wayback_urls "$LOG_DIR/wayback/urls.txt" "$LOG_DIR/wayback/subdomains.txt"
        
        declare -A vuln_patterns=(
            ["sqli"]="sql|select|insert|update|delete|union|where|from"
            ["xss"]="script|alert|onerror|onload|javascript"
            ["ssrf"]="url=|path=|request=|proxy=|http://|https://"
            ["redirect"]="redirect=|return=|url=|next=|rurl=|continue="
            ["rce"]="cmd=|command=|exec=|system|eval|passthru"
            ["lfi"]="file=|path=|include=|require=|document="
            ["idor"]="id=|user=|account=|profile=|edit=|delete="
        )
        
        for pattern in "${!vuln_patterns[@]}"; do
            grep -E -i "${vuln_patterns[$pattern]}" "$LOG_DIR/wayback/urls.txt" > "$LOG_DIR/leaks/${pattern}_urls.txt"
            count=$(wc -l < "$LOG_DIR/leaks/${pattern}_urls.txt")
            [ "$count" -gt 0 ] && log "Найдено $count URL с признаками ${pattern^^}"
        done

        # Поиск чувствительных данных
        grep -E -i "api[._-]?key|auth[._-]?token|access[._-]?token|secret[._-]?key|password|credential" "$LOG_DIR/wayback/urls.txt" > "$LOG_DIR/leaks/sensitive_urls.txt"
        grep -P "\d{4,}" "$LOG_DIR/wayback/urls.txt" > "$LOG_DIR/leaks/numeric_ids.txt"
    fi
else
    log "⚠ Нет доменов для проверки через Waybackurls"
    wayback_count=0
fi

# 12. Проверка облачной инфраструктуры
log "▶ Сканирование облачных сервисов..."
while read -r url; do
    domain=$(echo "$url" | awk -F/ '{print $3}')
    python3 /root/cloud_enum/cloud_enum.py -k "$domain" -l "$LOG_DIR/cloud/${domain}_cloud.txt" --disable-aws --disable-azure --disable-gcp
done < "$LOG_DIR/httpx_clean_urls.txt"

# 13. Запуск Nuclei
log "▶ Nuclei (10 запр/сек)..."
if [ -s "$LOG_DIR/httpx_clean_urls.txt" ]; then
    nuclei -l "$LOG_DIR/httpx_clean_urls.txt" -rate-limit 10 -c 20 -o "$LOG_DIR/nuclei_results.txt" 2>/dev/null
else
    log "⚠ Нет целей для Nuclei"
    touch "$LOG_DIR/nuclei_results.txt"
fi

# 14. Запуск Nuclei для Bitrix24
if [ -s "$LOG_DIR/bitrix_targets/bitrix_sites.txt" ]; then
    log "▶ Запуск Nuclei для Bitrix..."
    nuclei -l "$LOG_DIR/bitrix_targets/bitrix_sites.txt" -o "$LOG_DIR/nuclei_bitrix_results.txt" -t /root/nuclei-templates-bitrix/ 2>/dev/null
    cat "$LOG_DIR/nuclei_bitrix_results.txt" >> "$LOG_DIR/nuclei_results.txt"
fi

# 15. Запуск Jaeles
log "▶ Jaeles (5 потоков)..."
if [ -s "$LOG_DIR/httpx_clean_urls.txt" ]; then
    # Создаем файл для результатов, если директория не существует
    mkdir -p "$LOG_DIR/jaeles_results"
    
    # Запускаем Jaeles с перенаправлением вывода в файл
    jaeles scan -U "$LOG_DIR/httpx_clean_urls.txt" -S /root/.jaeles/base-signatures/ -r 5 -o "$LOG_DIR/jaeles_results/" 2>/dev/null
    
    # Проверяем, что файл результатов создан и не пустой
    if [ -f "$LOG_DIR/jaeles_results/jaeles-summary.txt" ]; then
        # Генерируем сводку уязвимостей
        grep "\[Vulnerable\]" "$LOG_DIR/jaeles_results/jaeles-summary.txt" > "$LOG_DIR/jaeles_results/vuln-summary.txt" 2>/dev/null
        
        # Удаляем дубликаты в результатах Jaeles
        awk '!seen[$0]++' "$LOG_DIR/jaeles_results/jaeles-summary.txt" > "$LOG_DIR/jaeles_results/scan.tmp"
        mv "$LOG_DIR/jaeles_results/scan.tmp" "$LOG_DIR/jaeles_results/scan.txt"
    else
        log "⚠ Jaeles не создал файл результатов"
        touch "$LOG_DIR/jaeles_results/vuln-summary.txt"
        touch "$LOG_DIR/jaeles_results/scan.txt"
    fi
else
    log "⚠ Нет целей для Jaeles"
    mkdir -p "$LOG_DIR/jaeles_results"
    touch "$LOG_DIR/jaeles_results/vuln-summary.txt"
    touch "$LOG_DIR/jaeles_results/scan.txt"
fi

# ==================== ОТЧЕТ ====================
log "▶ Генерация отчета..."

# Подсчет уязвимостей WordPress
wordpress_vulns=0
wordpress_plugins=0
if [ -d "$LOG_DIR/wordpress_scan" ]; then
    for wp_report in "$LOG_DIR"/wordpress_scan/*_wpscan.json; do
        if [ -f "$wp_report" ]; then
            vulns=$(jq '.version.vulnerabilities | length' "$wp_report" 2>/dev/null || echo 0)
            plugins=$(jq '.plugins | length' "$wp_report" 2>/dev/null || echo 0)
            wordpress_vulns=$((wordpress_vulns + vulns))
            wordpress_plugins=$((wordpress_plugins + plugins))
        fi
    done
fi

# Подсчет поддоменов
subdomains_count=0
if [ -f "$LOG_DIR/subdomains/all_subdomains.txt" ]; then
    subdomains_count=$(wc -l < "$LOG_DIR/subdomains/all_subdomains.txt" 2>/dev/null)
    subdomains_count=${subdomains_count:-0}
fi

# Подсчет уязвимостей Nuclei
nuclei_crit=$(grep -c -i "critical" "$LOG_DIR/nuclei_results.txt" 2>/dev/null || echo 0)
nuclei_high=$(grep -c -i "high" "$LOG_DIR/nuclei_results.txt" 2>/dev/null || echo 0)
nuclei_med=$(grep -c -i "medium" "$LOG_DIR/nuclei_results.txt" 2>/dev/null || echo 0)

# Подсчет уязвимостей Jaeles
jaeles_vulns=0
if [ -f "$LOG_DIR/jaeles_results/vuln-summary.txt" ]; then
    jaeles_vulns=$(wc -l < "$LOG_DIR/jaeles_results/vuln-summary.txt" 2>/dev/null)
    jaeles_vulns=${jaeles_vulns:-0}
fi

# Создаем HTML отчет с улучшенным дизайном
cat <<EOF > "$LOG_DIR/report.html"
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Отчет по сканированию</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
        }
        h1, h2, h3, h4 {
            color: #2c3e50;
            margin-top: 24px;
            margin-bottom: 16px;
        }
        h1 {
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            font-size: 28px;
        }
        h2 {
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
            font-size: 24px;
        }
        h3 {
            font-size: 20px;
            color: #3498db;
        }
        h4 {
            font-size: 18px;
            color: #7f8c8d;
        }
        .summary-card {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
            margin-bottom: 20px;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        .summary-item {
            background: #f8f9fa;
            border-left: 4px solid #3498db;
            padding: 10px 15px;
            border-radius: 4px;
        }
        .summary-item.critical {
            border-left-color: #e74c3c;
        }
        .summary-item.high {
            border-left-color: #f39c12;
        }
        .summary-item.medium {
            border-left-color: #f1c40f;
        }
        .summary-item.low {
            border-left-color: #2ecc71;
        }
        .summary-item .value {
            font-size: 24px;
            font-weight: bold;
            color: #2c3e50;
        }
        .summary-item .label {
            font-size: 14px;
            color: #7f8c8d;
        }
        pre {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            line-height: 1.4;
            border-left: 4px solid #3498db;
        }
        .vulnerability {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 20px;
            margin-bottom: 20px;
        }
        .vulnerability.critical {
            border-left: 4px solid #e74c3c;
        }
        .vulnerability.high {
            border-left: 4px solid #f39c12;
        }
        .vulnerability.medium {
            border-left: 4px solid #f1c40f;
        }
        .vulnerability.low {
            border-left: 4px solid #2ecc71;
        }
        .vulnerability-title {
            font-weight: bold;
            margin-bottom: 10px;
        }
        .vulnerability-desc {
            margin-bottom: 10px;
        }
        .vulnerability-url {
            word-break: break-all;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background-color: #3498db;
            color: white;
        }
        tr:nth-child(even) {
            background-color: #f2f2f2;
        }
        tr:hover {
            background-color: #e6f7ff;
        }
        .badge {
            display: inline-block;
            padding: 3px 7px;
            font-size: 12px;
            font-weight: bold;
            line-height: 1;
            color: white;
            text-align: center;
            white-space: nowrap;
            vertical-align: middle;
            border-radius: 10px;
        }
        .badge.critical {
            background-color: #e74c3c;
        }
        .badge.high {
            background-color: #f39c12;
        }
        .badge.medium {
            background-color: #f1c40f;
        }
        .badge.low {
            background-color: #2ecc71;
        }
        .badge.info {
            background-color: #3498db;
        }
        .timestamp {
            color: #7f8c8d;
            font-size: 14px;
            margin-bottom: 20px;
        }
        .webhook-url {
            word-break: break-all;
            margin-bottom: 20px;
        }
        .section {
            margin-bottom: 40px;
        }
        .file-link {
            color: #3498db;
            text-decoration: none;
        }
        .file-link:hover {
            text-decoration: underline;
        }
        .wordpress {
            color: #21759b;
        }
        .bitrix {
            color: #9b59b6;
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .tabs {
            display: flex;
            border-bottom: 1px solid #ddd;
            margin-bottom: 20px;
        }
        .tab {
            padding: 10px 20px;
            cursor: pointer;
            background: #f1f1f1;
            margin-right: 5px;
            border-radius: 5px 5px 0 0;
        }
        .tab.active {
            background: #3498db;
            color: white;
        }
    </style>
</head>
<body>
    <h1>Отчет внешнего сканирования</h1>
    <div class="timestamp">Сгенерировано: $(date '+%Y-%m-%d %H:%M:%S')</div>
    <div class="webhook-url">Webhook URL: <a href="$WEBHOOK_URL" target="_blank">$WEBHOOK_URL</a></div>
    
    <div class="summary-card">
        <h2>Общая информация</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="value">$(wc -l < "$LOG_DIR/targets_clean.txt")</div>
                <div class="label">Всего хостов</div>
            </div>
            <div class="summary-item">
                <div class="value">$(wc -l < "$LOG_DIR/httpx_clean_urls.txt")</div>
                <div class="label">Веб-сервисов</div>
            </div>
            <div class="summary-item">
                <div class="value">$(wc -l < "$LOG_DIR/wordpress_scan/wordpress_sites.txt" 2>/dev/null || echo 0)</div>
                <div class="label">Сайтов на WordPress</div>
            </div>
            <div class="summary-item">
                <div class="value">$wayback_count</div>
                <div class="label">Исторических URL</div>
            </div>
            <div class="summary-item">
                <div class="value">$subdomains_count</div>
                <div class="label">Найдено поддоменов</div>
            </div>
            <div class="summary-item">
                <div class="value">$(wc -l < "$LOG_DIR/nmap_redirects/redirects.txt" 2>/dev/null || echo 0)</div>
                <div class="label">Редиректов nmap</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Критические уязвимости</h2>
        <div class="vulnerability critical">
            <pre>$(grep -i "critical" "$LOG_DIR/nuclei_results.txt" 2>/dev/null || echo "Не обнаружено")</pre>
        </div>
    </div>

    <div class="section">
        <div class="tabs">
            <div class="tab active" onclick="openTab(event, 'wordpress')">WordPress</div>
            <div class="tab" onclick="openTab(event, 'bitrix')">Bitrix</div>
            <div class="tab" onclick="openTab(event, 'whatweb')">WhatWeb</div>
            <div class="tab" onclick="openTab(event, 'wayback')">Wayback</div>
            <div class="tab" onclick="openTab(event, 'subdomains')">Поддомены</div>
            <div class="tab" onclick="openTab(event, 'jaeles')">Jaeles</div>
        </div>

        <div id="wordpress" class="tab-content active">
            <h3 class="wordpress">Результаты сканирования WordPress</h3>
            <h4>WPScan Results</h4>
            <pre>$(jq . "$LOG_DIR"/wordpress_scan/*_wpscan.json 2>/dev/null || echo "Нет данных")</pre>
        </div>

        <div id="bitrix" class="tab-content">
            <h3 class="bitrix">Результаты сканирования Bitrix</h3>
            <h4>Check Bitrix Scanner</h4>
            <pre>$(cat "$LOG_DIR"/bitrix_scan_results/*_check.txt 2>/dev/null || echo "Нет данных")</pre>
            <h4>Nuclei Scan Results</h4>
            <pre>$(cat "$LOG_DIR"/bitrix_scan_results/*_nuclei.txt 2>/dev/null || echo "Нет данных")</pre>
        </div>

        <div id="whatweb" class="tab-content">
            <h3>Результаты WhatWeb</h3>
            $(for file in "$LOG_DIR"/whatweb_result/*_clean.txt; do
                echo "<h4>$(basename "$file")</h4>"
                echo "<pre>$(cat "$file")</pre>"
              done)
        </div>

        <div id="wayback" class="tab-content">
            <h3>Исторические URL (Wayback)</h3>
            <pre>$(head -n 50 "$LOG_DIR/wayback/urls.txt" 2>/dev/null || echo "Нет данных")</pre>
        </div>

        <div id="subdomains" class="tab-content">
            <h3>Найденные поддомены</h3>
            <pre>$(head -n 50 "$LOG_DIR/subdomains/all_subdomains.txt" 2>/dev/null || echo "Нет данных")</pre>
        </div>

        <div id="jaeles" class="tab-content">
            <h3>Результаты Jaeles</h3>
            <h4>Сводка уязвимостей</h4>
            <pre>$(cat "$LOG_DIR/jaeles_results/vuln-summary.txt" 2>/dev/null || echo "Нет данных")</pre>
            <h4>Полные результаты</h4>
            <pre>$(head -n 50 "$LOG_DIR/jaeles_results/scan.txt" 2>/dev/null || echo "Нет данных")</pre>
        </div>
    </div>

    <script>
        function openTab(evt, tabName) {
            var i, tabcontent, tablinks;
            
            tabcontent = document.getElementsByClassName("tab-content");
            for (i = 0; i < tabcontent.length; i++) {
                tabcontent[i].className = tabcontent[i].className.replace(" active", "");
            }
            
            tablinks = document.getElementsByClassName("tab");
            for (i = 0; i < tablinks.length; i++) {
                tablinks[i].className = tablinks[i].className.replace(" active", "");
            }
            
            document.getElementById(tabName).className += " active";
            evt.currentTarget.className += " active";
        }
    </script>
</body>
</html>
EOF

# Финал
log "=== Сканирование завершено ==="

# Вывод итоговых результатов
echo -e "\n\e[1;32m[+] Итоговые результаты:\e[0m"
echo -e "• Обнаружено хостов: \e[33m$(wc -l < "$LOG_DIR/targets_clean.txt")\e[0m"
echo -e "• Веб-сервисов: \e[33m$(wc -l < "$LOG_DIR/httpx_clean_urls.txt")\e[0m"

# Выводим информацию о Bitrix только если есть результаты
if [ -f "$LOG_DIR/bitrix_targets/bitrix_sites.txt" ] && [ -s "$LOG_DIR/bitrix_targets/bitrix_sites.txt" ]; then
    bitrix_count=$(wc -l < "$LOG_DIR/bitrix_targets/bitrix_sites.txt")
    echo -e "• Сайтов на Bitrix: \e[35m$bitrix_count\e[0m"
fi

echo -e "• Сайтов на WordPress: \e[36m$(wc -l < "$LOG_DIR/wordpress_scan/wordpress_sites.txt" 2>/dev/null || echo 0)\e[0m"
echo -e "• Уязвимостей WordPress: \e[36m$wordpress_vulns\e[0m"
echo -e "• Исторических URL: \e[33m$wayback_count\e[0m"
echo -e "• Найдено поддоменов: \e[33m$subdomains_count\e[0m"
echo -e "• Редиректов nmap: \e[33m$(wc -l < "$LOG_DIR/nmap_redirects/redirects.txt" 2>/dev/null || echo 0)\e[0m"
echo -e "• Критических уязвимостей: \e[31m$nuclei_crit\e[0m"
echo -e "• Высоких уязвимостей: \e[31m$nuclei_high\e[0m"
echo -e "• Средних уязвимостей: \e[31m$nuclei_med\e[0m"
echo -e "• Уязвимостей Jaeles: \e[31m$jaeles_vulns\e[0m"
echo -e "• Webhook URL: \e[36m$WEBHOOK_URL\e[0m"

# Дополнительная информация о найденных редиректах
if [ -s "$LOG_DIR/nmap_redirects/redirects.txt" ]; then
    echo -e "\e[1;34m[+] Обнаруженные редиректы:\e[0m"
    while read -r line; do
        echo -e "  \e[33m$line\e[0m"
    done < "$LOG_DIR/nmap_redirects/redirects.txt"
    echo ""
fi

exit 0

nickname="AKUMA"
for ((i=0; i<${#nickname}; i++)); do
    echo -ne "\e[1;31m${nickname:$i:1}\e[0m"
    sleep 0.15
done
echo ""
tput cnorm  # вернуть курсор
