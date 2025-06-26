# 🔌 AKUMA Web Scanner API Documentation

## Base URL
```
http://localhost:8001/api
```

## Authentication
В текущей версии API не требует аутентификации. В production рекомендуется использовать JWT токены или API ключи.

## Response Format
Все ответы возвращаются в JSON формате:

```json
{
  "status": "success|error",
  "data": {},
  "message": "Описание ответа",
  "timestamp": "2024-06-26T10:30:00Z"
}
```

## Endpoints

### 🎯 Scans Management

#### Create New Scan
```http
POST /api/scans/
```

**Request Body:**
```json
{
  "name": "My Security Scan",
  "targets": ["https://example.com", "https://test.com"],
  "config": {
    "depth": 3,
    "threads": 5,
    "timeout": 15,
    "include_subdomains": true,
    "scan_types": ["sql_injection", "xss", "csrf"]
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "scan_id": "scan_123456789",
    "name": "My Security Scan",
    "status": "pending",
    "created_at": "2024-06-26T10:30:00Z",
    "estimated_duration": "00:45:00"
  },
  "message": "Scan created successfully"
}
```

#### Get All Scans
```http
GET /api/scans/
```

**Query Parameters:**
- `limit` (int): Количество результатов (default: 50)
- `offset` (int): Смещение (default: 0)
- `status` (string): Фильтр по статусу (pending, running, completed, failed)
- `sort` (string): Сортировка (created_at, name, status)

**Response:**
```json
{
  "status": "success",
  "data": {
    "scans": [
      {
        "scan_id": "scan_123456789",
        "name": "My Security Scan",
        "status": "completed",
        "targets_count": 2,
        "vulnerabilities_found": 15,
        "created_at": "2024-06-26T10:30:00Z",
        "completed_at": "2024-06-26T11:15:00Z",
        "duration": "00:45:00"
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  }
}
```

#### Get Scan Details
```http
GET /api/scans/{scan_id}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "scan_id": "scan_123456789",
    "name": "My Security Scan",
    "status": "running",
    "targets": ["https://example.com"],
    "config": {
      "depth": 3,
      "threads": 5,
      "timeout": 15
    },
    "progress": {
      "percentage": 65,
      "current_stage": "Vulnerability Assessment",
      "stages": [
        {"name": "Discovery", "status": "completed", "progress": 100},
        {"name": "Port Scanning", "status": "completed", "progress": 100},
        {"name": "Web Probing", "status": "completed", "progress": 100},
        {"name": "Technology Detection", "status": "completed", "progress": 100},
        {"name": "Vulnerability Assessment", "status": "running", "progress": 65},
        {"name": "Deep Analysis", "status": "pending", "progress": 0}
      ]
    },
    "statistics": {
      "total_requests": 1250,
      "successful_requests": 1180,
      "failed_requests": 70,
      "vulnerabilities_found": 12,
      "critical": 2,
      "high": 4,
      "medium": 5,
      "low": 1
    },
    "created_at": "2024-06-26T10:30:00Z",
    "estimated_completion": "2024-06-26T11:15:00Z"
  }
}
```

#### Delete Scan
```http
DELETE /api/scans/{scan_id}
```

**Response:**
```json
{
  "status": "success",
  "message": "Scan deleted successfully"
}
```

#### Stop Scan
```http
POST /api/scans/{scan_id}/stop
```

**Response:**
```json
{
  "status": "success",
  "message": "Scan stopped successfully"
}
```

### 🛡️ Vulnerabilities

#### Get Scan Vulnerabilities
```http
GET /api/scans/{scan_id}/vulnerabilities
```

**Query Parameters:**
- `severity` (string): Фильтр по критичности (critical, high, medium, low)
- `type` (string): Фильтр по типу уязвимости
- `limit` (int): Количество результатов
- `offset` (int): Смещение

**Response:**
```json
{
  "status": "success",
  "data": {
    "vulnerabilities": [
      {
        "id": "vuln_987654321",
        "type": "SQL Injection",
        "severity": "critical",
        "url": "https://example.com/login.php",
        "parameter": "username",
        "method": "POST",
        "payload": "admin' OR '1'='1'--",
        "description": "SQL injection vulnerability detected in login form",
        "impact": "Potential database compromise and data extraction",
        "recommendation": "Use parameterized queries and input validation",
        "cwe": "CWE-89",
        "cvss_score": 9.1,
        "evidence": {
          "request": "POST /login.php HTTP/1.1\n...",
          "response": "HTTP/1.1 200 OK\n...",
          "proof": "Database error message revealed"
        },
        "discovered_at": "2024-06-26T10:45:00Z"
      }
    ],
    "total": 12,
    "statistics": {
      "critical": 2,
      "high": 4,
      "medium": 5,
      "low": 1
    }
  }
}
```

#### Get Vulnerability Details
```http
GET /api/vulnerabilities/{vulnerability_id}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": "vuln_987654321",
    "type": "SQL Injection",
    "severity": "critical",
    "url": "https://example.com/login.php",
    "technical_details": {
      "injection_point": "POST parameter 'username'",
      "technique": "Union-based SQL injection",
      "database_type": "MySQL",
      "extracted_data": ["users table structure", "admin credentials hash"]
    },
    "remediation": {
      "immediate": ["Disable vulnerable endpoint", "Review logs for exploitation"],
      "short_term": ["Implement input validation", "Use prepared statements"],
      "long_term": ["Security code review", "Implement WAF rules"]
    }
  }
}
```

### 📊 Reports

#### Generate HTML Report
```http
GET /api/scans/{scan_id}/report
```

**Query Parameters:**
- `format` (string): html, pdf, json (default: html)
- `include_details` (bool): Включить детальную информацию (default: true)

**Response:** HTML файл или JSON с данными отчета

#### Get Report Status
```http
GET /api/scans/{scan_id}/report/status
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "report_status": "ready",
    "generated_at": "2024-06-26T11:20:00Z",
    "file_size": "2.5MB",
    "download_url": "/api/scans/scan_123456789/report"
  }
}
```

### 📤 File Upload

#### Upload Target List
```http
POST /api/upload-targets
```

**Request:** Multipart form data with file

**Response:**
```json
{
  "status": "success",
  "data": {
    "targets": ["https://example.com", "https://test.com"],
    "valid_targets": 2,
    "invalid_targets": 0,
    "file_name": "targets.txt"
  }
}
```

### 🔄 Real-time Updates

#### WebSocket Connection
```
ws://localhost:8001/ws/scan/{scan_id}
```

**Message Types:**
```json
{
  "type": "progress_update",
  "data": {
    "percentage": 45,
    "current_stage": "Web Probing",
    "stage_progress": 30,
    "message": "Scanning https://example.com"
  }
}

{
  "type": "vulnerability_found",
  "data": {
    "vulnerability": {
      "type": "XSS",
      "severity": "medium",
      "url": "https://example.com/search"
    }
  }
}

{
  "type": "scan_completed",
  "data": {
    "scan_id": "scan_123456789",
    "duration": "00:42:15",
    "vulnerabilities_found": 8
  }
}
```

### ⚙️ Configuration

#### Get Scanner Configuration
```http
GET /api/config
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "scanner_version": "1.0.0",
    "supported_scan_types": [
      "sql_injection",
      "xss",
      "csrf",
      "directory_traversal"
    ],
    "max_concurrent_scans": 5,
    "max_targets_per_scan": 100,
    "default_timeout": 15,
    "available_modules": [
      {"name": "nmap_emulator", "version": "1.0", "enabled": true},
      {"name": "httpx_emulator", "version": "1.0", "enabled": true}
    ]
  }
}
```

#### Update Configuration
```http
PUT /api/config
```

**Request Body:**
```json
{
  "max_concurrent_scans": 3,
  "default_timeout": 20,
  "enable_notifications": true
}
```

### 📧 Notifications

#### Configure Email Notifications
```http
POST /api/notifications/email
```

**Request Body:**
```json
{
  "enabled": true,
  "smtp_server": "smtp.gmail.com",
  "smtp_port": 587,
  "username": "user@example.com",
  "password": "app_password",
  "recipients": ["admin@example.com"],
  "events": ["scan_completed", "critical_vulnerability_found"]
}
```

#### Configure Telegram Notifications
```http
POST /api/notifications/telegram
```

**Request Body:**
```json
{
  "enabled": true,
  "bot_token": "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
  "chat_id": "-1001234567890",
  "events": ["scan_completed", "high_vulnerability_found"]
}
```

### 📈 Statistics

#### Get Dashboard Statistics
```http
GET /api/stats/dashboard
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_scans": 45,
    "active_scans": 2,
    "total_vulnerabilities": 234,
    "critical_vulnerabilities": 12,
    "scans_this_week": 8,
    "top_vulnerability_types": [
      {"type": "XSS", "count": 45},
      {"type": "SQL Injection", "count": 32},
      {"type": "CSRF", "count": 28}
    ],
    "scan_success_rate": 92.5
  }
}
```

## Error Handling

### Error Response Format
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid target URL format",
    "details": {
      "field": "targets[0]",
      "value": "invalid-url",
      "expected": "Valid URL with http:// or https://"
    }
  },
  "timestamp": "2024-06-26T10:30:00Z"
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Неверные входные данные
- `SCAN_NOT_FOUND`: Сканирование не найдено
- `SCAN_ALREADY_RUNNING`: Сканирование уже выполняется
- `MAX_SCANS_EXCEEDED`: Превышен лимит одновременных сканирований
- `INVALID_TARGET`: Недопустимая цель для сканирования
- `INSUFFICIENT_RESOURCES`: Недостаточно ресурсов системы
- `MODULE_ERROR`: Ошибка в модуле сканирования

## Rate Limiting
- **API calls**: 1000 запросов в час
- **Concurrent scans**: максимум 5 одновременных сканирований
- **File uploads**: максимум 10MB на файл

## Security Considerations
- Используйте HTTPS в production
- Реализуйте аутентификацию и авторизацию
- Ограничьте доступ к API через firewall
- Регулярно обновляйте зависимости
- Мониторьте использование ресурсов

---

*API Documentation v1.0 - Updated: 2024-06-26*
