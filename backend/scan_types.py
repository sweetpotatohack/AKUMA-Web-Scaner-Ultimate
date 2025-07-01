"""
AKUMA Scanner - Конфигурации сканирования (Финальная версия)
"""

class ScanTypes:
    QUICK = "quick"
    FULL = "full"

# Конфигурации для двух типов сканирования
SCAN_CONFIGS = {
    ScanTypes.QUICK: {
        "name": "Quick Scan",
        "description": "Быстрое сканирование основных уязвимостей",
        "nmap_options": "-sS -T4 -p-",
        "httpx_options": "-silent -follow-redirects -title",
        "whatweb_options": "--color=never",
        "nuclei_severity": ["critical", "high", "medium"],
        "enable_web_probe": True,
        "enable_vuln_scan": True,
        "enable_directory_fuzzing": False,
        "enable_cms_scan": True,
        "max_threads": 20,
        "timeout": 15
    },
    
    ScanTypes.FULL: {
        "name": "Full Spectrum Scan", 
        "description": "Полное углубленное сканирование безопасности",
        "nmap_options": "-sS -sV -sC -O --min-rate=5000 -p-",
        "httpx_options": "-silent -follow-redirects -title -tech-detect",
        "whatweb_options": "--log-verbose",
        "nuclei_severity": ["critical", "high", "medium", "low"],
        "enable_web_probe": True,
        "enable_vuln_scan": True,
        "enable_directory_fuzzing": True,
        "enable_cms_scan": True,
        "enable_subdomain_enum": True,
        "max_threads": 15,
        "timeout": 30
    }
}

def get_scan_config(scan_type):
    """Получить конфигурацию для типа сканирования"""
    return SCAN_CONFIGS.get(scan_type, SCAN_CONFIGS[ScanTypes.FULL])
