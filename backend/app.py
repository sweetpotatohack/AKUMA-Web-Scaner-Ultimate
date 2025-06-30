import asyncio
import json
import os
import subprocess
import tempfile
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging
#import aiofiles
import requests
from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AKUMA Web Scanner API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Глобальные переменные для хранения данных
scans: Dict[str, dict] = {}
scan_logs: Dict[str, List[str]] = {}
websocket_connections: List[WebSocket] = []
running_tasks: Dict[str, Any] = {}
scan_results: Dict[str, Any] = {}

class ScanRequest(BaseModel):
    targets: List[str]
    scanTypes: Optional[List[str]] = ["basic"]
    description: Optional[str] = ""

class ScanPhase:
    DISCOVERY = "Discovery"
    PORT_SCAN = "Port Scan"
    WEB_PROBE = "Web Probe"
    VULNERABILITY_SCAN = "Vulnerability Scan"
    FUZZING = "Directory Fuzzing"
    DEEP_ANALYSIS = "Deep Analysis"

async def log_message(scan_id: str, message: str):
    """Логирование сообщения для конкретного скана"""
    if scan_id not in scan_logs:
        scan_logs[scan_id] = []
    
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    log_entry = f"[{timestamp}] {message}"
    scan_logs[scan_id].append(log_entry)
    
    # Записываем в файл лога
    log_dir = scans.get(scan_id, {}).get('log_dir')
    if log_dir:
        log_file = os.path.join(log_dir, 'scan.log')
        try:
            with open(log_file, 'a') as f:
                f.write(log_entry + '\n')
        except Exception as e:
            logger.error(f"Failed to write to log file: {e}")
    
    # Отправляем через WebSocket
    for connection in websocket_connections:
        try:
            await connection.send_json({
                "type": "log",
                "scan_id": scan_id,
                "message": log_entry
            })
        except:
            pass

async def run_command(scan_id: str, command: str, description: str):
    """Выполнение команды с логированием"""
    await log_message(scan_id, f"🔧 {description}")
    await log_message(scan_id, f"💻 Executing: {command}")
    
    try:
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        
        stdout, stderr = await process.communicate()
        
        if stdout:
            await log_message(scan_id, f"✅ Output: {stdout.decode()[:500]}")
        if stderr:
            await log_message(scan_id, f"⚠️ Error: {stderr.decode()[:500]}")
            
        return stdout.decode(), stderr.decode(), process.returncode
    except Exception as e:
        await log_message(scan_id, f"❌ Command failed: {str(e)}")
        return "", str(e), 1

async def get_webhook_url():
    """Получение webhook URL от webhook.site"""
    try:
        response = requests.post("https://webhook.site/token", timeout=10)
        if response.status_code == 201:
            data = response.json()
            return f"https://webhook.site/{data['uuid']}"
    except:
        pass
    return None

async def phase_discovery(scan_id: str, target: str):
    """Этап 1: Discovery - базовое обнаружение цели"""
    await log_message(scan_id, f"🔍 Starting {ScanPhase.DISCOVERY} phase for {target}")
    
    # DNS resolution
    stdout, stderr, code = await run_command(
        scan_id, 
        f"nslookup {target}",
        f"Resolving DNS for {target}"
    )
    
    # Ping test
    stdout, stderr, code = await run_command(
        scan_id,
        f"ping -c 3 {target}",
        f"Testing connectivity to {target}"
    )
    
    scans[scan_id]['progress'] = 20
    scans[scan_id]['phase'] = ScanPhase.PORT_SCAN
    
    await log_message(scan_id, f"✅ {ScanPhase.DISCOVERY} phase completed")

async def phase_port_scan(scan_id: str, target: str):
    """Этап 2: Port Scan - полное сканирование портов"""
    await log_message(scan_id, f"🔍 Starting {ScanPhase.PORT_SCAN} phase for {target}")
    
    log_dir = scans[scan_id]["log_dir"]
    nmap_output = os.path.join(log_dir, "nmap_result")
    
    # Полное сканирование портов с высокой скоростью
    stdout, stderr, code = await run_command(
        scan_id,
        f"nmap -sS -sV -p- --min-rate 5000 -oN {nmap_output} -oG {nmap_output}.gnmap {target}",
        f"Running comprehensive port scan on {target}"
    )
    
    # Улучшенный парсинг результатов nmap
    # Улучшенный парсинг результатов nmap встроенный
    parsed_ports = []
    
    if os.path.exists(nmap_output):
        try:
            with open(nmap_output, "r") as f:
                content = f.read()
            
            # Парсим построчно результаты nmap
            lines = content.split("\n")
            for line in lines:
                line = line.strip()
                
                # Ищем строки с портами (формат: PORT STATE SERVICE VERSION)
                import re
                port_pattern = r"(\d+)/(tcp|udp)\s+(open|closed|filtered)\s+(\S+)(?:\s+(.+))?"
                match = re.match(port_pattern, line)
                
                if match:
                    port_num = int(match.group(1))
                    protocol = match.group(2).upper()
                    state = match.group(3)
                    service = match.group(4) if match.group(4) else "unknown"
                    version = match.group(5) if match.group(5) else "unknown"
                    
                    # Только открытые порты
                    if state == "open":
                        port_info = {
                            "port": port_num,
                            "protocol": protocol,
                            "status": state,
                            "service": service,
                            "version": version.strip() if version else "unknown"
                        }
                        parsed_ports.append(port_info)
        except Exception as e:
            await log_message(scan_id, f"❌ Error parsing nmap output: {str(e)}")
    
    # Добавляем порты в результаты
    scans[scan_id]["ports"].extend(parsed_ports)
    
    await log_message(scan_id, f"📊 Found {len(parsed_ports)} open ports with detailed information")
    
    # Сохраняем список портов для httpx
    ports_file = os.path.join(log_dir, "open_ports.txt")
    with open(ports_file, "w") as f:
        for port in parsed_ports:
            f.write(f"{target}:{port["port"]}\n")
    
    scans[scan_id]["progress"] = 40
    scans[scan_id]["phase"] = ScanPhase.WEB_PROBE
    
    await log_message(scan_id, f"✅ {ScanPhase.PORT_SCAN} phase completed")

async def phase_web_probe(scan_id: str, target: str):
    """Этап 3: Web Probe - проверка веб-сервисов"""
    await log_message(scan_id, f"🔍 Starting {ScanPhase.WEB_PROBE} phase for {target}")
    
    log_dir = scans[scan_id]["log_dir"]
    
    # Проверка веб-сервисов на открытых портах
    ports_file = os.path.join(log_dir, "open_ports.txt")
    if os.path.exists(ports_file):
        stdout, stderr, code = await run_command(
            scan_id,
            f"{HTTPX_PATH} -l {ports_file} -o {log_dir}/httpx_result.txt -silent -timeout 10",
            "Probing web services on open ports"
        )
        
        # Если httpx не сработал, попробуем базовые URL
        if code != 0 or not os.path.exists(f"{log_dir}/httpx_result.txt"):
            await log_message(scan_id, "⚠️ httpx failed, trying basic HTTP/HTTPS check")
            
            # Создаем базовые URL для проверки
            basic_urls = [f"http://{target}", f"https://{target}"]
            with open(f"{log_dir}/httpx_result.txt", "w") as f:
                for url in basic_urls:
                    # Проверяем доступность с curl
                    stdout_curl, stderr_curl, code_curl = await run_command(
                        scan_id,
                        f"curl -s -I -m 5 {url}",
                        f"Testing {url} with curl"
                    )
                    if code_curl == 0 and "HTTP" in stdout_curl:
                        f.write(url + "\n")
                        await log_message(scan_id, f"✅ Found web service: {url}")
    else:
        # Базовая проверка если нет списка портов
        stdout, stderr, code = await run_command(
            scan_id,
            f"{HTTPX_PATH} -u {target} -o {log_dir}/httpx_result.txt -silent -timeout 10",
            f"Probing web services on {target}"
        )
        
        if code != 0:
            await log_message(scan_id, "⚠️ httpx failed, trying basic HTTP/HTTPS check")
            basic_urls = [f"http://{target}", f"https://{target}"]
            with open(f"{log_dir}/httpx_result.txt", "w") as f:
                for url in basic_urls:
                    stdout_curl, stderr_curl, code_curl = await run_command(
                        scan_id,
                        f"curl -s -I -m 5 {url}",
                        f"Testing {url} with curl"
                    )
                    if code_curl == 0 and "HTTP" in stdout_curl:
                        f.write(url + "\n")
    
    # Анализ веб-технологий с помощью whatweb
    if os.path.exists(f"{log_dir}/httpx_result.txt"):
        stdout, stderr, code = await run_command(
            scan_id,
            f"{WHATWEB_PATH} -i {log_dir}/httpx_result.txt --log-verbose={log_dir}/whatweb_result.txt",
            "Analyzing web technologies with whatweb"
        )
        
        # Поиск CMS
        if os.path.exists(f"{log_dir}/whatweb_result.txt"):
            with open(f"{log_dir}/whatweb_result.txt", "r") as f:
                whatweb_output = f.read().lower()
                if "bitrix" in whatweb_output:
                    scans[scan_id]["cms_detected"] = "Bitrix"
                    await log_message(scan_id, "🎯 Detected CMS: Bitrix")
                elif "wordpress" in whatweb_output:
                    scans[scan_id]["cms_detected"] = "WordPress"
                    await log_message(scan_id, "🎯 Detected CMS: WordPress")
    
    scans[scan_id]["progress"] = 50
    scans[scan_id]["phase"] = ScanPhase.VULNERABILITY_SCAN
    
    await log_message(scan_id, f"✅ {ScanPhase.WEB_PROBE} phase completed")

async def phase_vulnerability_scan(scan_id: str, target: str):
    """Этап 4: Vulnerability Scan - поиск уязвимостей"""
    await log_message(scan_id, f"🔍 Starting {ScanPhase.VULNERABILITY_SCAN} phase for {target}")
    
    log_dir = scans[scan_id]['log_dir']
    cms_detected = scans[scan_id].get('cms_detected')
    
    # Основное сканирование с nuclei
    if os.path.exists(f"{log_dir}/httpx_result.txt"):
        stdout, stderr, code = await run_command(
            scan_id,
            f"{NUCLEI_PATH} -l {log_dir}/httpx_result.txt -o {log_dir}/nuclei_results.txt -silent",
            "Running nuclei vulnerability scanner"
        )
    
    # Специализированные проверки для Bitrix
    if cms_detected == 'Bitrix':
        await log_message(scan_id, "🎯 Running Bitrix-specific scans...")
        
        # Получаем webhook URL
        webhook_url = await get_webhook_url()
        if webhook_url:
            await log_message(scan_id, f"📡 Using webhook: {webhook_url}")
        
        # Клонируем и запускаем check_bitrix
        bitrix_dir = os.path.join(log_dir, 'check_bitrix')
        stdout, stderr, code = await run_command(
            scan_id,
            f"cd {log_dir} && git clone https://github.com/k1rurk/check_bitrix",
            "Cloning Bitrix vulnerability scanner"
        )
        
        # Устанавливаем зависимости для check_bitrix
        if os.path.exists(bitrix_dir):
            stdout, stderr, code = await run_command(
                scan_id,
                f"cd {bitrix_dir} && pip3 install -r requirements.txt",
                "Installing check_bitrix dependencies"
            )
            
            if webhook_url:
                cmd = f"cd {bitrix_dir} && python3 test_bitrix.py -t https://{target} scan -s {webhook_url} > {log_dir}/bitrix_scan.txt 2>&1"
            else:
                cmd = f"cd {bitrix_dir} && python3 test_bitrix.py -t https://{target} scan > {log_dir}/bitrix_scan.txt 2>&1"
            
            stdout, stderr, code = await run_command(
                scan_id,
                cmd,
                "Running specialized Bitrix vulnerability scan"
            )
        
        # Клонируем Bitrix nuclei templates
        stdout, stderr, code = await run_command(
            scan_id,
            f"cd {log_dir} && git clone https://github.com/jhonnybonny/nuclei-templates-bitrix",
            "Cloning Bitrix nuclei templates"
        )
        
        bitrix_templates_dir = os.path.join(log_dir, 'nuclei-templates-bitrix')
        if os.path.exists(bitrix_templates_dir) and os.path.exists(f"{log_dir}/httpx_result.txt"):
            stdout, stderr, code = await run_command(
                scan_id,
                f"{NUCLEI_PATH} -l {log_dir}/httpx_result.txt -t {bitrix_templates_dir} -o {log_dir}/nuclei_bitrix_results.txt -silent",
                "Running Bitrix-specific nuclei templates"
            )
    
    # Специализированные проверки для WordPress
    elif cms_detected == 'WordPress':
        await log_message(scan_id, "🎯 Running WordPress-specific scans...")
        
        # WPScan (если есть API токен)
        wp_api_token = os.getenv('WPSCAN_API_TOKEN', '')
        if wp_api_token:
            cmd = f"wpscan --url https://{target} --api-token {wp_api_token} --output {log_dir}/wpscan_results.txt"
        else:
            cmd = f"wpscan --url https://{target} --output {log_dir}/wpscan_results.txt"
        
        stdout, stderr, code = await run_command(
            scan_id,
            cmd,
            "Running WPScan for WordPress vulnerabilities"
        )
    
    # Парсинг результатов nuclei
    await parse_nuclei_results(scan_id, log_dir)
    
    scans[scan_id]['progress'] = 70
    scans[scan_id]['phase'] = ScanPhase.FUZZING
    
    await log_message(scan_id, f"✅ {ScanPhase.VULNERABILITY_SCAN} phase completed")

async def phase_fuzzing(scan_id: str, target: str):
    """Этап 5: Directory Fuzzing - поиск скрытых директорий"""
    await log_message(scan_id, f"🔍 Starting {ScanPhase.FUZZING} phase for {target}")
    
    log_dir = scans[scan_id]['log_dir']
    
    # Читаем веб-сервисы из httpx_result.txt
    httpx_file = os.path.join(log_dir, 'httpx_result.txt')
    if os.path.exists(httpx_file):
        with open(httpx_file, 'r') as f:
            web_targets = [line.strip() for line in f if line.strip()]
        
        await log_message(scan_id, f"📡 Found {len(web_targets)} web services for fuzzing")
        
        # Запускаем фазинг для каждого веб-сервиса
        for i, web_target in enumerate(web_targets):
            await log_message(scan_id, f"🔍 Fuzzing {web_target} ({i+1}/{len(web_targets)})")
            
            # Используем dirsearch со стандартным словарем
            stdout, stderr, code = await run_command(
                scan_id,
                f"{DIRSEARCH_PATH} -u {web_target} -o {log_dir}/dirsearch_{i}.txt --format=simple -q",
                f"Running directory fuzzing on {web_target}"
            )
            
    
    scans[scan_id]['progress'] = 85
    scans[scan_id]['phase'] = ScanPhase.DEEP_ANALYSIS
    
    await log_message(scan_id, f"✅ {ScanPhase.FUZZING} phase completed")

async def parse_nuclei_results(scan_id: str, log_dir: str):
    """Парсинг результатов nuclei"""
    nuclei_files = [
        'nuclei_results.txt',
        'nuclei_bitrix_results.txt'
    ]
    
    for nuclei_file in nuclei_files:
        file_path = os.path.join(log_dir, nuclei_file)
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    
                lines = content.strip().split('\n')
                for line in lines:
                    if line.strip() and '[' in line and ']' in line:
                        try:
                            # Парсинг формата: [template-id] [protocol] [severity] URL
                            parts = []
                            temp_line = line
                            
                            # Извлекаем все части в квадратных скобках
                            while '[' in temp_line and ']' in temp_line:
                                start = temp_line.find('[')
                                end = temp_line.find(']', start)
                                if start != -1 and end != -1:
                                    parts.append(temp_line[start+1:end])
                                    temp_line = temp_line[end+1:]
                                else:
                                    break
                            
                            # Остальная часть строки - это URL и дополнительная информация
                            remaining = temp_line.strip()
                            
                            if len(parts) >= 3:
                                template_id = parts[0]
                                protocol = parts[1]
                                severity = parts[2]
                                
                                # Извлекаем URL из оставшейся части
                                url_parts = remaining.split()
                                url = url_parts[0] if url_parts else 'N/A'
                                
                                # Дополнительная информация (если есть)
                                extra_info = ' '.join(url_parts[1:]) if len(url_parts) > 1 else ''
                                
                                vulnerability = {
                                    'title': template_id,
                                    'description': f'Vulnerability found by nuclei: {line}',
                                    'severity': severity,
                                    'url': url,
                                    'method': 'GET',
                                    'source': nuclei_file,
                                    'protocol': protocol,
                                    'extra_info': extra_info
                                }
                                
                                scans[scan_id]['vulnerabilities'].append(vulnerability)
                                await log_message(scan_id, f"🚨 Found vulnerability: {template_id} [{severity}]")
                        except Exception as e:
                            await log_message(scan_id, f"❌ Error parsing line: {line} - {str(e)}")
                            
            except Exception as e:
                await log_message(scan_id, f"❌ Error parsing {nuclei_file}: {str(e)}")

async def phase_deep_analysis(scan_id: str, target: str):
    """Этап 6: Deep Analysis - финальный анализ и отчеты"""
    await log_message(scan_id, f"🔍 Starting {ScanPhase.DEEP_ANALYSIS} phase for {target}")
    
    log_dir = scans[scan_id]['log_dir']
    
    # Анализ результатов фаззинга
    fuzzing_files = [f for f in os.listdir(log_dir) if f.startswith('dirsearch_') or f.startswith('removed_ffuf_')]
    for fuzzing_file in fuzzing_files:
        file_path = os.path.join(log_dir, fuzzing_file)
        if os.path.exists(file_path):
            await log_message(scan_id, f"📄 Processing fuzzing results from {fuzzing_file}")
    
    # Генерация HTML отчета
    await generate_html_report(scan_id, target)
    
    scans[scan_id]['progress'] = 100
    scans[scan_id]['status'] = 'completed'
    scans[scan_id]['completed_at'] = datetime.now().isoformat()
    
    await log_message(scan_id, f"🎉 Scan completed successfully!")
    await log_message(scan_id, f"📊 Total vulnerabilities found: {len(scans[scan_id]['vulnerabilities'])}")
    await log_message(scan_id, f"📊 Total ports found: {len(scans[scan_id]['ports'])}")

async def generate_html_report(scan_id: str, target: str):
    """Генерация HTML отчета"""
    log_dir = scans[scan_id]['log_dir']
    report_path = os.path.join(log_dir, 'report.html')
    
    scan_data = scans[scan_id]
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>AKUMA Scan Report - {target}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            .header {{ background: #1a1a1a; color: #00ff41; padding: 20px; }}
            .section {{ margin: 20px 0; padding: 20px; border: 1px solid #ddd; }}
            .vulnerability {{ background: #ffebee; padding: 10px; margin: 10px 0; }}
            .critical {{ border-left: 5px solid #f44336; }}
            .high {{ border-left: 5px solid #ff9800; }}
            .medium {{ border-left: 5px solid #ffeb3b; }}
            .low {{ border-left: 5px solid #4caf50; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>AKUMA Web Scanner Report</h1>
            <p>Target: {target}</p>
            <p>Scan ID: {scan_id}</p>
            <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
        </div>
        
        <div class="section">
            <h2>Summary</h2>
            <p>Vulnerabilities found: {len(scan_data['vulnerabilities'])}</p>
            <p>Open ports: {len(scan_data['ports'])}</p>
            <p>CMS detected: {scan_data.get('cms_detected', 'None')}</p>
        </div>
        
        <div class="section">
            <h2>Vulnerabilities</h2>
    """
    
    for vuln in scan_data['vulnerabilities']:
        severity_class = vuln.get('severity', 'low')
        html_content += f"""
            <div class="vulnerability {severity_class}">
                <h3>{vuln.get('title', 'Unknown')}</h3>
                <p><strong>Severity:</strong> {vuln.get('severity', 'unknown')}</p>
                <p><strong>URL:</strong> {vuln.get('url', 'N/A')}</p>
                <p><strong>Description:</strong> {vuln.get('description', 'N/A')}</p>
            </div>
        """
    
    html_content += """
        </div>
        
        <div class="section">
            <h2>Open Ports</h2>
            <ul>
    """
    
    for port in scan_data['ports']:
        html_content += f"<li>Port {port['port']}/{port['protocol']} - {port['service']}</li>"
    
    html_content += """
            </ul>
        </div>
    </body>
    </html>
    """
    
    try:
        with open(report_path, 'w') as f:
            f.write(html_content)
        await log_message(scan_id, f"📄 HTML report generated: {report_path}")
    except Exception as e:
        await log_message(scan_id, f"❌ Failed to generate HTML report: {str(e)}")

async def perform_scan(scan_id: str, target: str):
    """Основная функция сканирования"""
    try:
        await log_message(scan_id, f"🚀 Starting comprehensive scan of {target}")
        
        # Этап 1: Discovery
        await phase_discovery(scan_id, target)
        
        # Этап 2: Port Scan
        await phase_port_scan(scan_id, target)
        
        # Этап 3: Web Probe
        await phase_web_probe(scan_id, target)
        
        # Этап 4: Vulnerability Scan
        await phase_vulnerability_scan(scan_id, target)
        
        # Этап 5: Directory Fuzzing
        await phase_fuzzing(scan_id, target)
        
        # Этап 6: Deep Analysis
        await phase_deep_analysis(scan_id, target)
        
    except Exception as e:
        await log_message(scan_id, f"❌ Scan failed: {str(e)}")
        scans[scan_id]['status'] = 'failed'
        scans[scan_id]['error'] = str(e)

# API Endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/stats")
async def get_stats():
    total_scans = len(scans)
    active_scans = len([s for s in scans.values() if s['status'] == 'running'])
    total_vulnerabilities = sum(len(s['vulnerabilities']) for s in scans.values())
    critical_issues = sum(len([v for v in s['vulnerabilities'] if v.get('severity') == 'critical']) for s in scans.values())
    
    return {
        "total_scans": total_scans,
        "active_scans": active_scans,
        "vulnerabilities_found": total_vulnerabilities,
        "critical_vulns": critical_issues
    }

@app.get("/api/vulnerabilities")
async def get_vulnerabilities():
    all_vulnerabilities = []
    for scan_id, scan_data in scans.items():
        for vuln in scan_data.get("vulnerabilities", []):
            vuln_copy = vuln.copy()
            vuln_copy["scan_id"] = scan_id
            vuln_copy["target"] = scan_data.get("target", "Unknown")
            all_vulnerabilities.append(vuln_copy)
    return all_vulnerabilities

@app.get("/api/scans")
async def get_scans():
    return list(scans.values())

@app.get("/api/scans/{scan_id}")
async def get_scan(scan_id: str):
    if scan_id not in scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scans[scan_id]

@app.delete("/api/scans/{scan_id}")
async def delete_scan(scan_id: str):
    if scan_id not in scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    # Удаляем все связанные данные
    if scan_id in scans:
        del scans[scan_id]
    if scan_id in scan_logs:
        del scan_logs[scan_id]
    if scan_id in scan_results:
        del scan_results[scan_id]
    
    # Останавливаем задачу если она выполняется
    if scan_id in running_tasks:
        running_tasks[scan_id].cancel()
        del running_tasks[scan_id]
    
    return {"message": "Scan deleted successfully"}

@app.post("/api/scans")
async def create_scan(scan_request: ScanRequest, background_tasks: BackgroundTasks):
    scan_id = str(uuid.uuid4())
    
    # Создание временной директории для лога
    log_dir = f"/tmp/akuma_scan_{scan_id}"
    os.makedirs(log_dir, exist_ok=True)
    
    scan_data = {
        "id": scan_id,
        "target": scan_request.targets[0],
        "targets": scan_request.targets,
        "scan_type": "comprehensive",
        "status": "running",
        "progress": 0,
        "phase": ScanPhase.DISCOVERY,
        "created_at": datetime.now().isoformat(),
        "config": {
            "max_depth": 3,
            "threads": 10,
            "timeout": 30,
            "rate_limit": 60
        },
        "vulnerabilities": [],
        "ports": [],
        "log_dir": log_dir
    }
    
    scans[scan_id] = scan_data
    scan_logs[scan_id] = []
    
    # Запускаем сканирование в фоне
    background_tasks.add_task(perform_scan, scan_id, scan_request.targets[0])
    
    return {
        "scan_id": scan_id,
        "status": "created",
        "message": "Scan started"
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket_connections.append(websocket)
    
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_connections.remove(websocket)

@app.get("/api/scans/{scan_id}/ports")
async def get_scan_ports(scan_id: str):
    """Get ports for a specific scan"""
    if scan_id not in scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan = scans[scan_id]
    return scan.get('ports', [])

@app.get("/api/scans/{scan_id}/logs")
async def get_scan_logs(scan_id: str):
    """Get logs for a specific scan"""
    if scan_id not in scan_logs:
        return []
    
    return scan_logs[scan_id]

@app.get("/api/scans/{scan_id}/vulnerabilities")
async def get_scan_vulnerabilities(scan_id: str):
    """Get vulnerabilities for a specific scan"""
    if scan_id not in scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan = scans[scan_id]
    return scan.get('vulnerabilities', [])

@app.get("/api/scans/{scan_id}/fuzzing")
async def get_scan_fuzzing(scan_id: str):
    """Get fuzzing results for a specific scan"""
    if scan_id not in scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    log_dir = scans[scan_id].get('log_dir')
    if not log_dir:
        return {"error": "Log directory not found"}
    
    fuzzing_results = {}
    
    # Читаем результаты dirsearch
    for file in os.listdir(log_dir):
        if file.startswith('dirsearch_'):
            file_path = os.path.join(log_dir, file)
            try:
                with open(file_path, 'r') as f:
                    fuzzing_results[file] = f.read()
            except Exception as e:
                fuzzing_results[f'{file}_error'] = str(e)
    
    # Читаем результаты ffuf
    for file in os.listdir(log_dir):
        if file.startswith('removed_ffuf_'):
            file_path = os.path.join(log_dir, file)
            try:
                with open(file_path, 'r') as f:
                    ffuf_data = json.load(f)
                    fuzzing_results[file] = ffuf_data
            except Exception as e:
                fuzzing_results[f'{file}_error'] = str(e)
    
    # Читаем результаты check_bitrix
    bitrix_file = os.path.join(log_dir, 'bitrix_scan.txt')
    if os.path.exists(bitrix_file):
        try:
            with open(bitrix_file, 'r') as f:
                fuzzing_results['bitrix_scan'] = f.read()
        except Exception as e:
            fuzzing_results['bitrix_scan_error'] = str(e)
    
    return fuzzing_results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.get("/api/scans/{scan_id}/dirsearch")
async def get_scan_dirsearch(scan_id: str):
    """Get dirsearch results for a specific scan"""
    if scan_id not in scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    log_dir = scans[scan_id].get('log_dir')
    if not log_dir:
        return {"error": "Log directory not found"}
    
    dirsearch_results = {}
    
    # Читаем результаты dirsearch
    for file in os.listdir(log_dir):
        if file.startswith('dirsearch_'):
            file_path = os.path.join(log_dir, file)
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                    dirsearch_results['raw_output'] = content
                    
                    # Попытка парсинга результатов
                    results = []
                    for line in content.split('\n'):
                        if ' - ' in line and ('200' in line or '301' in line or '302' in line or '403' in line):
                            parts = line.split()
                            if len(parts) >= 3:
                                try:
                                    status = int(parts[0])
                                    size = parts[1] if parts[1].isdigit() else '0'
                                    url = ' '.join(parts[2:])
                                    results.append({
                                        'status': status,
                                        'size': size,
                                        'url': url
                                    })
                                except:
                                    continue
                    
                    dirsearch_results['results'] = results
            except Exception as e:
                dirsearch_results['error'] = str(e)
    
    return dirsearch_results

@app.get("/api/scans/{scan_id}/scanner-results")
async def get_scan_scanner_results(scan_id: str):
    """Get scanner results (Bitrix, WPScan, etc.) for a specific scan"""
    if scan_id not in scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    log_dir = scans[scan_id].get('log_dir')
    if not log_dir:
        return {"error": "Log directory not found"}
    
    scanner_results = {}
    
    # Читаем результаты Bitrix Scanner
    bitrix_file = os.path.join(log_dir, 'bitrix_scan.txt')
    if os.path.exists(bitrix_file):
        try:
            with open(bitrix_file, 'r') as f:
                scanner_results['bitrix_scan'] = f.read()
        except Exception as e:
            scanner_results['bitrix_scan_error'] = str(e)
    
    # Читаем результаты WPScan
    wpscan_file = os.path.join(log_dir, 'wpscan.txt')
    if os.path.exists(wpscan_file):
        try:
            with open(wpscan_file, 'r') as f:
                scanner_results['wpscan'] = f.read()
        except Exception as e:
            scanner_results['wpscan_error'] = str(e)
    
    return scanner_results

@app.get("/api/vulnerabilities")
async def get_all_vulnerabilities():
    """Get all vulnerabilities from all scans"""
    all_vulnerabilities = []
    
    for scan_id, scan in scans.items():
        vulnerabilities = scan.get('vulnerabilities', [])
        for vuln in vulnerabilities:
            vuln_copy = vuln.copy()
            vuln_copy['scan_id'] = scan_id
            vuln_copy['target'] = scan.get('target', 'Unknown')
            all_vulnerabilities.append(vuln_copy)
    
    # Сортируем по критичности
    severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3, 'info': 4}
    all_vulnerabilities.sort(key=lambda x: severity_order.get(x.get('severity', '').lower(), 999))
    
    return all_vulnerabilities

@app.get("/api/config")
async def get_config():
    """Get scanner configuration"""
    # Дефолтная конфигурация
    default_config = {
        "scan_timeout": 3600,
        "max_concurrent_scans": 3,
        "nmap_options": "-sS -sV -O",
        "dirsearch_wordlist": "/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt",
        "user_agent": "AKUMA-Scanner/2.0",
        "request_delay": 0.1,
        "thread_count": 10,
        "enable_aggressive_scan": False,
        "enable_service_detection": True,
        "enable_os_detection": True,
        "save_raw_output": True,
        "auto_update_wordlists": False,
        "notification_email": "",
        "webhook_url": ""
    }
    
    return default_config

@app.post("/api/config")
async def save_config(config_data: dict):
    """Save scanner configuration"""
    # В реальной реализации здесь бы сохранялась конфигурация в файл
    # Для демо просто возвращаем успех
    return {"status": "success", "message": "Configuration saved"}

@app.post("/api/scans/{scan_id}/report")
async def generate_report(scan_id: str, report_request: dict):
    """Generate report for a specific scan"""
    if scan_id not in scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan = scans[scan_id]
    report_type = report_request.get('format', 'summary')
    
    # Генерируем простой HTML отчет
    html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>AKUMA Scanner Report</title>
    <style>
        body {{ font-family: 'Courier New', monospace; background: #0d1117; color: #00ff00; }}
        .header {{ border-bottom: 2px solid #00ff00; padding: 20px; }}
        .section {{ margin: 20px 0; padding: 15px; border: 1px solid #00ff00; }}
        .critical {{ color: #ff0000; }}
        .high {{ color: #ff9800; }}
        .medium {{ color: #ffeb3b; }}
        .low {{ color: #4caf50; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>🔍 AKUMA Scanner Report</h1>
        <p><strong>Target:</strong> {scan.get('target', 'Unknown')}</p>
        <p><strong>Scan Type:</strong> {scan.get('scan_type', 'Unknown')}</p>
        <p><strong>Date:</strong> {scan.get('created_at', 'Unknown')}</p>
        <p><strong>Status:</strong> {scan.get('status', 'Unknown')}</p>
    </div>
    
    <div class="section">
        <h2>📊 Executive Summary</h2>
        <p>Security assessment completed for {scan.get('target', 'target')}.</p>
        <p>Total vulnerabilities found: {len(scan.get('vulnerabilities', []))}</p>
        <p>Open ports discovered: {len(scan.get('ports', []))}</p>
    </div>
    
    <div class="section">
        <h2>🛡️ Vulnerabilities</h2>
        <ul>
    """
    
    for vuln in scan.get('vulnerabilities', []):
        severity_class = vuln.get('severity', '').lower()
        html_content += f"""
            <li class="{severity_class}">
                <strong>[{vuln.get('severity', 'UNKNOWN').upper()}]</strong> 
                {vuln.get('title', 'Unknown Vulnerability')}<br>
                <small>URL: {vuln.get('url', 'N/A')}</small>
            </li>
        """
    
    html_content += """
        </ul>
    </div>
    
    <div class="section">
        <h2>🔌 Network Analysis</h2>
        <ul>
    """
    
    for port in scan.get('ports', []):
        html_content += f"""
            <li>{port.get('port', 'Unknown')}/{port.get('protocol', 'tcp')} - {port.get('service', 'Unknown')}</li>
        """
    
    html_content += """
        </ul>
    </div>
    
    <div class="section">
        <h2>💡 Recommendations</h2>
        <ul>
            <li>Patch all critical and high severity vulnerabilities immediately</li>
            <li>Review and close unnecessary open ports</li>
            <li>Implement regular security scanning</li>
            <li>Keep all software components updated</li>
        </ul>
    </div>
    
    <div class="section">
        <p><small>Report generated by AKUMA Scanner v2.0</small></p>
    </div>
</body>
</html>
    """
    
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html_content)

@app.get("/api/stats")
async def get_stats():
    """Get system statistics"""
    total_scans = len(scans)
    active_scans = len([s for s in scans.values() if s.get('status') == 'running'])
    
    # Подсчитываем уязвимости
    all_vulns = []
    for scan in scans.values():
        all_vulns.extend(scan.get('vulnerabilities', []))
    
    total_vulnerabilities = len(all_vulns)
    critical_issues = len([v for v in all_vulns if v.get('severity', '').lower() == 'critical'])
    
    return {
        "totalScans": total_scans,
        "activeScans": active_scans,
        "vulnerabilities": total_vulnerabilities,
        "criticalIssues": critical_issues
    }

def find_tool_path(tool_name):
    """Находит полный путь к инструменту"""
    import shutil
    
    # Стандартные пути поиска
    search_paths = [
        f"/usr/bin/{tool_name}",
        f"/usr/local/bin/{tool_name}",
        f"/root/go/bin/{tool_name}",
        f"/opt/{tool_name}",
        shutil.which(tool_name)
    ]
    
    for path in search_paths:
        if path and os.path.exists(path) and os.access(path, os.X_OK):
            return path
    
    return tool_name  # Fallback to command name

# Глобальные пути к инструментам
HTTPX_PATH = find_tool_path("httpx")
NUCLEI_PATH = find_tool_path("nuclei")
DIRSEARCH_PATH = find_tool_path("dirsearch")
WHATWEB_PATH = find_tool_path("whatweb")
