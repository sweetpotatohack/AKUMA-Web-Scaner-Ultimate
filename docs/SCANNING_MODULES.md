# 🔍 AKUMA Scanner Modules Documentation

## Обзор процесса сканирования

AKUMA Web Scanner эмулирует работу профессиональных инструментов безопасности, выполняя сканирование в несколько этапов. Каждый этап использует специализированные модули для максимально точного анализа целевых систем.

## 📋 Этапы сканирования

### 1. Discovery Phase (Обнаружение)
**Прогресс: 0-15%**
- Проверка доступности цели
- DNS резолвинг
- Базовая валидация URL
- Определение IP адресов

### 2. Port Scanning (Сканирование портов)
**Прогресс: 15-30%**
- **Эмулирует: nmap**
- Сканирование TCP портов (80, 443, 8080, 8443, 3000, 5000, 8000)
- Определение открытых сервисов
- Fingerprinting операционной системы
- Обнаружение версий сервисов

**Команды nmap (эмулируемые):**
```bash
nmap -sS -sV -O -p 80,443,8080,8443,3000,5000,8000 target
nmap --script=banner,http-title,http-headers target
nmap -sC -sV target
```

### 3. Web Probing (HTTP/HTTPS проверка)
**Прогресс: 30-45%**
- **Эмулирует: httpx**
- Проверка HTTP/HTTPS доступности
- Анализ заголовков ответов
- Определение статус кодов
- Проверка редиректов
- Анализ SSL/TLS сертификатов

**Команды httpx (эмулируемые):**
```bash
httpx -l targets.txt -title -tech-detect -status-code
httpx -probe -follow-redirects -title -tech-detect
httpx -silent -mc 200,301,302,403,500 -title
```

### 4. Technology Detection (Определение технологий)
**Прогресс: 45-60%**
- **Эмулирует: whatweb**
- Определение CMS систем
- Анализ JavaScript фреймворков
- Обнаружение серверных технологий
- Определение версий программного обеспечения
- Анализ метатегов и заголовков

**Команды whatweb (эмулируемые):**
```bash
whatweb --aggression 3 --log-verbose target
whatweb -a 3 --colour=never --log-brief target
whatweb --plugins wordpress,joomla,drupal target
```

### 5. Vulnerability Assessment (Поиск уязвимостей)
**Прогресс: 60-85%**
- **Эмулирует: nuclei**
- Сканирование по шаблонам уязвимостей
- Проверка известных CVE
- Анализ конфигураций безопасности
- Поиск чувствительных файлов
- Тестирование injection атак

**Команды nuclei (эмулируемые):**
```bash
nuclei -l targets.txt -t cves/ -severity critical,high,medium
nuclei -u target -t exposures/ -t misconfiguration/
nuclei -target target -t sqli/ -t xss/ -t lfi/
```

### 6. Deep Analysis (Углубленный анализ)
**Прогресс: 85-100%**
- **Кастомные модули AKUMA**
- Анализ найденных уязвимостей
- Проверка ложных срабатываний
- Определение степени риска
- Генерация рекомендаций по устранению
- Создание финального отчета

## 🛡️ Типы обнаруживаемых уязвимостей

### SQL Injection
- **Методы:** Union-based, Boolean-based, Time-based, Error-based
- **Проверяемые параметры:** GET, POST, Headers, Cookies
- **Payload примеры:** `' OR '1'='1`, `1' UNION SELECT NULL--`, `1'; WAITFOR DELAY '00:00:05'--`

### Cross-Site Scripting (XSS)
- **Типы:** Reflected, Stored, DOM-based
- **Контексты:** HTML, Attribute, JavaScript, CSS
- **Payload примеры:** `<script>alert('XSS')</script>`, `javascript:alert('XSS')`, `<img src=x onerror=alert('XSS')>`

### Cross-Site Request Forgery (CSRF)
- **Проверки:** Отсутствие CSRF токенов, SameSite cookies
- **Методы:** GET/POST based CSRF
- **Анализ:** Referrer headers, Origin headers

### Directory Traversal
- **Payload примеры:** `../../../etc/passwd`, `..\\..\\..\\windows\\system32\\drivers\\etc\\hosts`
- **Кодировки:** URL encoding, Double encoding, Unicode

### Server-Side Request Forgery (SSRF)
- **Цели:** Internal services, Cloud metadata, File schemes
- **Payload примеры:** `http://localhost:8080/admin`, `http://169.254.169.254/metadata`

### Information Disclosure
- **Типы:** Backup files, Configuration files, Debug information
- **Файлы:** `.git/`, `.env`, `web.config`, `phpinfo.php`

### Authentication Bypass
- **Методы:** SQL injection, Parameter pollution, HTTP verb tampering
- **Проверки:** Default credentials, Weak passwords

### Security Misconfiguration
- **Проверки:** CORS misconfiguration, Security headers, Directory listing
- **Headers:** CSP, HSTS, X-Frame-Options, X-Content-Type-Options

## 🎯 Конфигурация сканирования

### Параметры глубины сканирования

**Level 1 (Базовый):**
- Discovery + Port Scanning
- Время: ~5-10 минут
- Уязвимости: Критические

**Level 2 (Стандартный):**
- + Web Probing + Technology Detection
- Время: ~15-20 минут
- Уязвимости: Критические + Высокие

**Level 3 (Расширенный):**
- + Vulnerability Assessment (основные шаблоны)
- Время: ~30-45 минут
- Уязвимости: Критические + Высокие + Средние

**Level 4 (Полный):**
- + Deep Analysis + все шаблоны
- Время: ~60-90 минут
- Уязвимости: Все уровни

**Level 5 (Экстремальный):**
- + Brute force + Fuzzing
- Время: ~2-4 часа
- Уязвимости: Все + Low priority

### Параметры потоков
- **1 поток:** Медленно, но безопасно для стабильности
- **3-5 потоков:** Оптимальный баланс скорости и стабильности
- **10+ потоков:** Быстро, но может вызвать блокировку

### Таймауты
- **5 сек:** Быстрые сети, локальные цели
- **15 сек:** Стандартные интернет-соединения
- **30+ сек:** Медленные соединения, удаленные цели

## 📊 Метрики и статистика

### Показатели производительности
- **Запросов в секунду:** Зависит от количества потоков
- **Время сканирования:** Зависит от глубины и количества целей
- **Обнаруженных уязвимостей:** Статистика по типам и критичности
- **Ложных срабатываний:** Процент от общего количества

### Статистика по типам уязвимостей
```
SQL Injection:     15-25% от всех находок
XSS:              20-30% от всех находок
Misconfigurations: 30-40% от всех находок
Info Disclosure:   10-15% от всех находок
Other:            10-20% от всех находок
```

## 🔧 Техническая реализация

### Архитектура модулей
```python
class ScannerModule:
    def __init__(self, name, version, description):
        self.name = name
        self.version = version
        self.description = description
    
    async def scan(self, target, config):
        """Выполнить сканирование цели"""
        pass
    
    def generate_report(self, results):
        """Сгенерировать отчет по результатам"""
        pass
```

### Интеграция с внешними API
- **CVE Database:** Обновление информации о уязвимостях
- **Threat Intelligence:** Анализ репутации целей
- **Security Advisories:** Актуальные рекомендации

### Логирование и мониторинг
- **Детальные логи:** Каждый этап сканирования
- **Метрики производительности:** Время выполнения, использование ресурсов
- **Алерты:** Критические ошибки и найденные уязвимости

## 🚀 Планы развития

### Будущие модули
- **Wordlist fuzzing:** Поиск скрытых директорий и файлов
- **API security testing:** Тестирование REST/GraphQL API
- **Mobile app analysis:** Анализ мобильных приложений
- **Infrastructure scanning:** Сетевое сканирование

### Интеграции
- **OWASP ZAP:** Интеграция с популярным прокси-сканером
- **Burp Suite:** Импорт/экспорт данных
- **DefectDojo:** Интеграция с системой управления уязвимостями
- **JIRA:** Автоматическое создание тикетов

---

*Документация обновлена: 2024-06-26*
