# 🔥 AKUMA Scanner - Исправленные проблемы

## ✅ Что было исправлено:

### 1. Ошибки установки инструментов
- **Проблема**: `httpx not found`, `nuclei not found` и другие
- **Решение**: Полностью переписана функция `check_tools()` в `script_scaner.sh`
- **Детали**: Добавлена умная проверка инструментов и автоматическая установка недостающих

### 2. Docker-compose
- **Статус**: ✅ Запущен и работает
- **Контейнеры**: 
  - `akuma_backend` (порт 8000)
  - `akuma_frontend` (порт 3000) 
  - `akuma_redis` (порт 6379)

### 3. Установленные инструменты
- ✅ nmap
- ✅ httpx (с симлинком от httpx-toolkit)
- ✅ nuclei
- ✅ whatweb
- ✅ waybackurls
- ✅ jaeles
- ✅ cloud_enum
- ✅ check_bitrix
- ✅ testssl

## 🚀 Как запустить сканирование:

```bash
# Быстрое сканирование домена
./script_scaner.sh example.com

# Сканирование с файлом целей
./script_scaner.sh -f targets.txt

# Сканирование IP или подсети
./script_scaner.sh 192.168.1.1
./script_scaner.sh 192.168.1.0/24
```

## 🌐 Веб-интерфейс:

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Redis: localhost:6379

## 📝 Логи:
Все результаты сканирования сохраняются в `/tmp/akuma_scan_*`

---
*Старое зло пробуждено и готово к киберохоте! 🔥*
