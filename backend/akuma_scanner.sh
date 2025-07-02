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
tput cnorm  # показать курсор обратно

# ==================== НАСТРОЙКИ ====================
LOG_DIR="/root/web_scan/$(date +%d-%m-%Y)-external"
mkdir -p "$LOG_DIR" || { echo "Не могу создать $LOG_DIR"; exit 1; }
cd "$LOG_DIR" || { echo "Не могу перейти в $LOG_DIR"; exit 1; }

TARGET=${1:-"example.com"}
ZOMBIE_FILTER=1  # Включаем зомби-фильтр по умолчанию

# Создаем файл цели
target_file="$LOG_DIR/target_list.txt"
echo "$TARGET" > "$target_file"

# Функция для логирования
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_DIR/scan.log"
}

# Проверка инструментов
check_tools() {
    local required_tools=("nmap" "httpx" "nuclei" "whatweb" "testssl")
    local missing_tools=()
    
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &>/dev/null; then
            missing_tools+=("$tool")
        fi
    done
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        log "❌ Отсутствующие инструменты: ${missing_tools[*]}"
        return 1
    fi
    
    return 0
}

# Получение webhook URL
get_webhook_url() {
    echo "https://webhook.site/default-token"
}

# Функция для очистки цветовых кодов
clean_colors() {
    sed 's/\x1b\[[0-9;]*m//g'
}

# Функция сканирования поддоменов
scan_subdomains() {
    local domain="$1"
    log "Поиск поддоменов для $domain"
    
    # Создаем директорию для поддоменов
    mkdir -p "$LOG_DIR/subdomains"
    
    # Используем crt.sh API для поиска поддоменов
    curl -s "https://crt.sh/?q=%.$domain&output=json" | \
    jq -r '.[].name_value' 2>/dev/null | \
    sed 's/\*\.//g' | \
    sort -u >> "$LOG_DIR/subdomains/${domain}_subdomains.txt"
    
    # Объединяем все найденные поддомены
    cat "$LOG_DIR/subdomains/"*_subdomains.txt 2>/dev/null | sort -u > "$LOG_DIR/subdomains/all_subdomains.txt"
}

# Функция сканирования Bitrix
scan_bitrix() {
    local url="$1"
    local clean_name="$2"
    
    log "Запуск специального сканирования Bitrix для $url"
    
    # check_bitrix сканирование
    if [ -f "/root/check_bitrix/test_bitrix.py" ]; then
        python3 /root/check_bitrix/test_bitrix.py -t "$url" scan > "$LOG_DIR/bitrix_scan_results/${clean_name}_check_bitrix.txt" 2>&1 || true
    fi
    
    # Nuclei для Bitrix
    if [ -d "/root/nuclei-templates-bitrix" ]; then
        nuclei -u "$url" -t "/root/nuclei-templates-bitrix/" -o "$LOG_DIR/bitrix_scan_results/${clean_name}_nuclei_bitrix.txt" -silent
    fi
}

# Функция сканирования WordPress
scan_wordpress() {
    local url="$1"
    
    log "Запуск WPScan для $url"
    
    if command -v wpscan &>/dev/null; then
        # Извлекаем домен из URL для имени файла
        local domain=$(echo "$url" | awk -F/ '{print $3}' | sed 's/:.*//')
        
        wpscan --url "$url" --no-banner --random-user-agent \
               --format json --output "$LOG_DIR/wordpress_scan/${domain}_wpscan.json" 2>/dev/null || true
    else
        log "⚠ WPScan не найден, пропускаем WordPress сканирование"
    fi
}

# Функция SSL сканирования
run_ssl_scan() {
    local url="$1"
    local domain=$(echo "$url" | awk -F/ '{print $3}' | sed 's/:.*//')
    
    if command -v testssl &>/dev/null; then
        testssl --quiet --jsonfile "$LOG_DIR/ssl_audit/${domain}_ssl.json" "$url" 2>/dev/null || true
    fi
}

# Функция подготовки списка для waybackurls
prepare_wayback_list() {
    local input_file="$1"
    local output_file="$2"
    
    # Извлекаем домены из URL
    awk -F/ '{print $3}' "$input_file" | sort -u > "$output_file"
}

# Функция анализа wayback URL
analyze_wayback_urls() {
    local urls_file="$1"
    local subdomains_file="$2"
    
    # Извлекаем поддомены из URL
    awk -F/ '{print $3}' "$urls_file" | sort -u > "$subdomains_file"
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
mkdir -p "$LOG_DIR"/{bitrix_targets,bitrix_scan_results,whatweb_result,ssl_audit,wayback,wordpress_scan,cloud,jaeles_results,leaks,_redirects,subdomains,nmap_redirects}

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
    if command -v cloud_enum &>/dev/null; then
        cloud_enum -k "$domain" -l "$LOG_DIR/cloud/${domain}_cloud.txt" --disable-aws --disable-azure --disable-gcp 2>/dev/null || true
    elif [ -f "/root/cloud_enum/cloud_enum.py" ]; then
        python3 /root/cloud_enum/cloud_enum.py -k "$domain" -l "$LOG_DIR/cloud/${domain}_cloud.txt" --disable-aws --disable-azure --disable-gcp 2>/dev/null || true
    fi
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
    if command -v jaeles &>/dev/null; then
        jaeles scan -U "$LOG_DIR/httpx_clean_urls.txt" -S /root/.jaeles/base-signatures/ -r 5 -o "$LOG_DIR/jaeles_results/" 2>/dev/null
    else
        log "⚠ Jaeles не найден"
    fi
    
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

# Подсчет открытых портов
ports_count=0
if [ -f "$LOG_DIR/open_ports.txt" ]; then
    ports_count=$(wc -l < "$LOG_DIR/open_ports.txt" 2>/dev/null)
    ports_count=${ports_count:-0}
fi

# Подсчет Bitrix уязвимостей
bitrix_vulns=0
if [ -f "$LOG_DIR/nuclei_bitrix_results.txt" ]; then
    bitrix_vulns=$(wc -l < "$LOG_DIR/nuclei_bitrix_results.txt" 2>/dev/null)
    bitrix_vulns=${bitrix_vulns:-0}
fi

# Общее количество уязвимостей
total_vulns=$((nuclei_crit + nuclei_high + nuclei_med + jaeles_vulns + wordpress_vulns + bitrix_vulns))

log "🎉 СКАНИРОВАНИЕ ЗАВЕРШЕНО!"
log "📊 Статистика:"
log "   • Цель: $TARGET"
log "   • Найдено поддоменов: $subdomains_count"
log "   • Открытых портов: $ports_count"
log "   • Уязвимостей Nuclei: Critical($nuclei_crit) High($nuclei_high) Medium($nuclei_med)"
log "   • Уязвимостей Jaeles: $jaeles_vulns"
log "   • Уязвимостей WordPress: $wordpress_vulns"
log "   • Уязвимостей Bitrix: $bitrix_vulns"
log "   • Всего уязвимостей: $total_vulns"
log "   • Исторических URL: $wayback_count"
log "   • Результаты в: $LOG_DIR"

echo "✅ AKUMA Scanner завершил работу. Все результаты сохранены в $LOG_DIR"
