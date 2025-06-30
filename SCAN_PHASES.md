# 🔥 AKUMA Web Scanner - Этапы сканирования

## Обзор этапов сканирования

AKUMA Web Scanner использует 5-этапную методологию сканирования с реальными инструментами пентестинга:

### 1. **Discovery (Обнаружение) - ~15 секунд**
Базовое обнаружение и проверка доступности целей.

**Выполняемые действия:**
- Resolving DNS - Разрешение DNS имен целей
- Checking connectivity - Проверка доступности хостов  
- Detecting web server - Определение веб-сервера

**Эмулируемые команды:**
```bash
nslookup example.com
dig example.com
ping -c 3 example.com
```

---

### 2. **Port Scan (Полное сканирование портов) - ~20 секунд**
Полное сканирование всех портов с высокой скоростью.

**Основная команда:**
```bash
nmap -A -v -p- --min-rate 5000 -oN nmap_result example.com
```

**Обработка результатов:**
```bash
# Извлечение открытых портов в формат ip:port
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
```

**Флаги nmap:**
- `-A` - Агрессивное сканирование (OS detection, version detection, script scanning, traceroute)
- `-v` - Verbose режим
- `-p-` - Сканирование всех портов (1-65535)
- `--min-rate 5000` - Минимальная скорость отправки пакетов
- `-oN` - Нормальный вывод в файл

---

### 3. **Web Probe (Веб-зондирование) - ~25 секунд**
Проверка всех найденных портов на наличие веб-сервисов и определение CMS.

**Команды:**
```bash
# Проверка веб-сервисов на всех открытых портах
httpx -l open_ports.txt -title -tech-detect -status-code -o httpx_result.txt

# Определение CMS и технологий
whatweb example.com
```

**Выполняемые действия:**
- HTTP/HTTPS detection - Обнаружение HTTP/HTTPS сервисов на всех открытых портах
- Crawling web pages - Сканирование веб-страниц
- Technology detection - Определение используемых технологий и CMS
- Сохранение найденных веб-сервисов в httpx_result.txt

---

### 4. **Vulnerability Scan (Сканирование уязвимостей) - ~30 секунд**
Базовое сканирование уязвимостей и специализированные проверки для обнаруженных CMS.

#### Базовое сканирование:
```bash
# Nuclei сканирование всех найденных веб-сервисов
nuclei -l httpx_result.txt -o nuclei_results.txt
```

#### Специализированное сканирование Bitrix (если обнаружен):

**1. Получение Webhook URL:**
```bash
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
}
```

**2. Специализированный сканер Bitrix:**
```bash
# Клонирование и запуск специализированного сканера
git clone https://github.com/k1rurk/check_bitrix && cd check_bitrix
python3 test_bitrix.py -t https://target scan -s $(get_webhook_url)
```

**3. Nuclei темплейты для Bitrix:**
```bash
# Клонирование специальных темплейтов
git clone https://github.com/jhonnybonny/nuclei-templates-bitrix
nuclei -l httpx_result.txt -t nuclei-templates-bitrix
```

**4. Fuzzing Bitrix:**
```bash
# Клонирование словаря для фаззинга
git clone https://github.com/jivoi/pentest
# Использование dicc.txt для фаззинга Bitrix директорий
dirsearch -u https://target -w pentest/wordlists/dicc.txt
```

#### Специализированное сканирование WordPress (если обнаружен):
```bash
# WPScan с полным перечислением
wpscan --url target --enumerate ap,at,cb,dbe --format json --output wpscan_results.json
```

---

### 5. **Deep Analysis (Глубокий анализ) - ~10 секунд**
Финальная обработка результатов и генерация отчетов.

**Выполняемые действия:**
- Analyzing results - Анализ всех собранных данных
- Generating report - Создание детального отчета
- Finalizing scan - Завершение сканирования и очистка

**Эмулируемые команды:**
```bash
# Дополнительные проверки уязвимостей
nmap --script vuln target
gobuster dir -u http://target -w /wordlists/common.txt
```

---

## Структура выходных файлов

### Логи и результаты сохраняются в `/tmp/akuma_scan_{scan_id}/`:

- `nmap_result_{target}` - Полные результаты nmap сканирования
- `open_ports.txt` - Список открытых портов в формате ip:port
- `httpx_result.txt` - Результаты проверки веб-сервисов
- `nuclei_results.txt` - Найденные уязвимости через nuclei
- `check_bitrix/` - Результаты специализированного сканирования Bitrix
- `nuclei-templates-bitrix/` - Темплейты для Bitrix
- `pentest/wordlists/dicc.txt` - Словарь для фаззинга Bitrix
- `wpscan_results.json` - Результаты сканирования WordPress

---

## Типы обнаруживаемых уязвимостей

- **Critical**: SQL Injection
- **High**: Cross-Site Scripting (XSS), Directory Traversal
- **Medium**: CSRF, Missing Security Headers
- **Low**: Information Disclosure, Insecure Configurations

---

## Специальные возможности

### CMS Detection
Автоматическое определение и специализированное сканирование:
- **Bitrix**: Полный набор инструментов включая check_bitrix, специальные nuclei темплейты и словари для фаззинга
- **WordPress**: WPScan с полным перечислением плагинов, тем и уязвимостей
- **Joomla**: Базовое сканирование через nuclei

### Real-time Logging
Все этапы сканирования логируются в реальном времени и доступны через:
- WebSocket подключение `/ws/scan/{scan_id}`
- REST API endpoint для логов
- Детальные отчеты в HTML формате

### Webhook Integration
Для Bitrix сканирования автоматически получается webhook URL от webhook.site для получения обратных соединений и проверки RCE уязвимостей.
