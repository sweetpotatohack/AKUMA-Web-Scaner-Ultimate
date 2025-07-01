import asyncio
import json
import os
import subprocess
import tempfile
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scan_types import get_scan_config, ScanTypes
from tools_manager import tools_manager

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="AKUMA Web Scanner API v3.0", version="3.0")

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

class ScanRequest(BaseModel):
    targets: List[str]
    scanTypes: Optional[List[str]] = ["full"]
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
            output = stdout.decode()[:500]
            await log_message(scan_id, f"✅ Output: {output}")
        if stderr:
            error = stderr.decode()[:500]
            await log_message(scan_id, f"⚠️ Error: {error}")
            
        return stdout.decode(), stderr.decode(), process.returncode
    except Exception as e:
        await log_message(scan_id, f"❌ Command failed: {str(e)}")
        return "", str(e), 1

async def phase_discovery(scan_id: str, target: str, scan_type: str):
    """Этап 1: Discovery - базовое обнаружение цели"""
    config = get_scan_config(scan_type)
    await log_message(scan_id, f"🔍 Starting {ScanPhase.DISCOVERY} phase for {target}")
    await log_message(scan_id, f"📋 Using scan type: {config['name']}")
    
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

async def phase_port_scan(scan_id: str, target: str, scan_type: str):
    """Этап 2: Port Scan - сканирование портов"""
    config = get_scan_config(scan_type)
    await log_message(scan_id, f"🔍 Starting {ScanPhase.PORT_SCAN} phase for {target}")
    
    log_dir = scans[scan_id]['log_dir']
    nmap_output = os.path.join(log_dir, 'nmap_result')
    
    # Получаем путь к nmap
    nmap_path = tools_manager.get_tool_path('nmap') or 'nmap'
    
    # Используем конфигурацию nmap из типа скана
    nmap_cmd = f"{nmap_path} {config['nmap_options']} -oN {nmap_output} -oG {nmap_output}.gnmap {target}"
    
    stdout, stderr, code = await run_command(
        scan_id,
        nmap_cmd,
        f"Running {config['name']} port scan"
    )
    
    # Парсинг результатов nmap
    if os.path.exists(f"{nmap_output}.gnmap"):
        await parse_nmap_results(scan_id, f"{nmap_output}.gnmap")
    
    scans[scan_id]['progress'] = 40
    scans[scan_id]['phase'] = ScanPhase.WEB_PROBE
    
    await log_message(scan_id, f"✅ {ScanPhase.PORT_SCAN} phase completed")

async def phase_web_probe(scan_id: str, target: str, scan_type: str):
    """Этап 3: Web Probe - проверка веб-сервисов"""
    config = get_scan_config(scan_type)
    await log_message(scan_id, f"🔍 Starting {ScanPhase.WEB_PROBE} phase for {target}")
    
    log_dir = scans[scan_id]['log_dir']
    
    # Получаем путь к httpx
    httpx_path = tools_manager.get_tool_path('httpx')
    if not httpx_path:
        await log_message(scan_id, "❌ httpx not found! Installing...")
        await tools_manager.install_missing_tools(['httpx'])
        httpx_path = tools_manager.get_tool_path('httpx') or 'httpx'
    
    # Проверка веб-сервисов с httpx
    if os.path.exists(f"{log_dir}/open_ports.txt"):
        httpx_cmd = f"{httpx_path} {config['httpx_options']} -l {log_dir}/open_ports.txt -o {log_dir}/httpx_result.txt"
    else:
        # Базовая проверка
        httpx_cmd = f"echo 'https://{target}' | {httpx_path} {config['httpx_options']} -o {log_dir}/httpx_result.txt"
    
    stdout, stderr, code = await run_command(scan_id, httpx_cmd, "Probing web services with httpx")
    
    # Анализ веб-технологий с whatweb
    whatweb_path = tools_manager.get_tool_path('whatweb') or 'whatweb'
    if os.path.exists(f"{log_dir}/httpx_result.txt"):
        whatweb_cmd = f"{whatweb_path} {config['whatweb_options']} -i {log_dir}/httpx_result.txt --log-verbose={log_dir}/whatweb_result.txt"
        stdout, stderr, code = await run_command(scan_id, whatweb_cmd, "Analyzing web technologies")
        
        # Определение CMS
        await detect_cms(scan_id, log_dir)
    
    scans[scan_id]['progress'] = 50
    scans[scan_id]['phase'] = ScanPhase.VULNERABILITY_SCAN
    
    await log_message(scan_id, f"✅ {ScanPhase.WEB_PROBE} phase completed")

async def phase_vulnerability_scan(scan_id: str, target: str, scan_type: str):
    """Этап 4: Vulnerability Scan - поиск уязвимостей"""
    config = get_scan_config(scan_type)
    await log_message(scan_id, f"🔍 Starting {ScanPhase.VULNERABILITY_SCAN} phase for {target}")
    
    log_dir = scans[scan_id]['log_dir']
    cms_detected = scans[scan_id].get('cms_detected')
    
    # Получаем путь к nuclei
    nuclei_path = tools_manager.get_tool_path('nuclei')
    if not nuclei_path:
        await log_message(scan_id, "❌ nuclei not found! Installing...")
        await tools_manager.install_missing_tools(['nuclei'])
        nuclei_path = tools_manager.get_tool_path('nuclei') or 'nuclei'
    
    # Основное сканирование с nuclei
    if os.path.exists(f"{log_dir}/httpx_result.txt"):
        severity_filter = ",".join(config['nuclei_severity'])
        nuclei_cmd = f"{nuclei_path} -l {log_dir}/httpx_result.txt -o {log_dir}/nuclei_results.txt -silent -severity {severity_filter}"
        stdout, stderr, code = await run_command(scan_id, nuclei_cmd, f"Running nuclei scanner (severity: {severity_filter})")
    
    # Специализированные сканеры для CMS
    if config.get('enable_cms_scan', True):
        if cms_detected == 'Bitrix':
            await scan_bitrix_vulnerabilities(scan_id, target, log_dir)
        elif cms_detected == 'WordPress':
            await scan_wordpress_vulnerabilities(scan_id, target, log_dir)
    
    # Парсинг результатов
    await parse_nuclei_results(scan_id, log_dir)
    
    scans[scan_id]['progress'] = 70
    if config.get('enable_directory_fuzzing', False):
        scans[scan_id]['phase'] = ScanPhase.FUZZING
    else:
        scans[scan_id]['phase'] = ScanPhase.DEEP_ANALYSIS
    
    await log_message(scan_id, f"✅ {ScanPhase.VULNERABILITY_SCAN} phase completed")

async def phase_fuzzing(scan_id: str, target: str, scan_type: str):
    """Этап 5: Directory Fuzzing - поиск скрытых директорий"""
    config = get_scan_config(scan_type)
    
    if not config.get('enable_directory_fuzzing', False):
        await log_message(scan_id, f"⏭️ Directory fuzzing disabled for {config['name']}")
        scans[scan_id]['progress'] = 85
        scans[scan_id]['phase'] = ScanPhase.DEEP_ANALYSIS
        return
        
    await log_message(scan_id, f"🔍 Starting {ScanPhase.FUZZING} phase for {target}")
    
    log_dir = scans[scan_id]['log_dir']
    
    # Выбор словаря
    wordlist = '/usr/share/wordlists/dirb/common.txt'
    if not os.path.exists(wordlist):
        wordlist = '/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt'
    
    # Читаем веб-сервисы из httpx_result.txt
    httpx_file = os.path.join(log_dir, 'httpx_result.txt')
    if os.path.exists(httpx_file):
        with open(httpx_file, 'r') as f:
            web_targets = [line.strip() for line in f if line.strip()]
        
        await log_message(scan_id, f"📡 Found {len(web_targets)} web services for fuzzing")
        
        # Запускаем фаззинг для первых 2 целей
        gobuster_path = tools_manager.get_tool_path('gobuster')
        if gobuster_path:
            for i, web_target in enumerate(web_targets[:2]):
                await log_message(scan_id, f"🔍 Fuzzing {web_target} ({i+1}/{min(2, len(web_targets))})")
                
                gobuster_cmd = f"{gobuster_path} dir -u {web_target} -w {wordlist} -o {log_dir}/gobuster_{i}.txt -q"
                stdout, stderr, code = await run_command(scan_id, gobuster_cmd, f"Running gobuster on {web_target}")
    
    scans[scan_id]['progress'] = 85
    scans[scan_id]['phase'] = ScanPhase.DEEP_ANALYSIS
    
    await log_message(scan_id, f"✅ {ScanPhase.FUZZING} phase completed")

async def phase_deep_analysis(scan_id: str, target: str, scan_type: str):
    """Этап 6: Deep Analysis - финальный анализ и отчеты"""
    await log_message(scan_id, f"🔍 Starting {ScanPhase.DEEP_ANALYSIS} phase for {target}")
    
    log_dir = scans[scan_id]['log_dir']
    
    # Генерация HTML отчета
    await generate_html_report(scan_id, target)
    
    scans[scan_id]['progress'] = 100
    scans[scan_id]['status'] = 'completed'
    scans[scan_id]['completed_at'] = datetime.now().isoformat()
    
    await log_message(scan_id, f"🎉 Scan completed successfully!")
    await log_message(scan_id, f"📊 Total vulnerabilities found: {len(scans[scan_id]['vulnerabilities'])}")
    await log_message(scan_id, f"📊 Total ports found: {len(scans[scan_id]['ports'])}")

async def detect_cms(scan_id: str, log_dir: str):
    """Определение CMS из результатов whatweb"""
    whatweb_file = os.path.join(log_dir, 'whatweb_result.txt')
    if os.path.exists(whatweb_file):
        try:
            with open(whatweb_file, 'r') as f:
                whatweb_output = f.read().lower()
                
            if 'bitrix' in whatweb_output or 'bitrix24' in whatweb_output:
                scans[scan_id]['cms_detected'] = 'Bitrix'
                await log_message(scan_id, "🎯 Detected CMS: Bitrix")
            elif 'wordpress' in whatweb_output or 'wp-' in whatweb_output:
                scans[scan_id]['cms_detected'] = 'WordPress'
                await log_message(scan_id, "🎯 Detected CMS: WordPress")
            elif 'drupal' in whatweb_output:
                scans[scan_id]['cms_detected'] = 'Drupal'
                await log_message(scan_id, "🎯 Detected CMS: Drupal")
            elif 'joomla' in whatweb_output:
                scans[scan_id]['cms_detected'] = 'Joomla'
                await log_message(scan_id, "🎯 Detected CMS: Joomla")
        except Exception as e:
            await log_message(scan_id, f"❌ Error detecting CMS: {str(e)}")

async def scan_bitrix_vulnerabilities(scan_id: str, target: str, log_dir: str):
    """Специализированное сканирование Bitrix"""
    await log_message(scan_id, "🎯 Running Bitrix-specific vulnerability scans...")
    
    check_bitrix_path = tools_manager.get_tool_path('check_bitrix')
    if check_bitrix_path:
        cmd = f"cd {os.path.dirname(check_bitrix_path)} && python3 test_bitrix.py -t https://{target} scan > {log_dir}/bitrix_scan.txt 2>&1"
        stdout, stderr, code = await run_command(scan_id, cmd, "Running Bitrix vulnerability scan")
    
    # Nuclei для Bitrix
    nuclei_path = tools_manager.get_tool_path('nuclei')
    bitrix_templates_path = tools_manager.get_tool_path('bitrix_templates')
    if nuclei_path and bitrix_templates_path:
        cmd = f"{nuclei_path} -u https://{target} -t {bitrix_templates_path}/ -o {log_dir}/bitrix_nuclei.txt"
        stdout, stderr, code = await run_command(scan_id, cmd, "Running Nuclei for Bitrix")

async def scan_wordpress_vulnerabilities(scan_id: str, target: str, log_dir: str):
    """Специализированное сканирование WordPress"""
    await log_message(scan_id, "🎯 Running WordPress-specific vulnerability scans...")
    
    wpscan_path = tools_manager.get_tool_path('wpscan')
    if wpscan_path:
        cmd = f"{wpscan_path} --url https://{target} --output {log_dir}/wpscan_results.txt"
        stdout, stderr, code = await run_command(scan_id, cmd, "Running WPScan for WordPress vulnerabilities")
    else:
        await log_message(scan_id, "⚠️ WPScan not installed, skipping WordPress scan")

async def parse_nmap_results(scan_id: str, gnmap_file: str):
    """Парсинг результатов nmap"""
    try:
        with open(gnmap_file, 'r') as f:
            content = f.read()
        
        # Создаем файл с открытыми портами для httpx
        log_dir = scans[scan_id]['log_dir']
        open_ports_file = os.path.join(log_dir, 'open_ports.txt')
        
        with open(open_ports_file, 'w') as f:
            for line in content.split('\n'):
                if 'Ports:' in line:
                    ip_match = line.split()[1] if len(line.split()) > 1 else None
                    if ip_match:
                        ports_section = line.split('Ports: ')[1] if 'Ports: ' in line else ''
                        if ports_section:
                            port_entries = ports_section.split(', ')
                            for entry in port_entries:
                                if '/' in entry:
                                    parts = entry.split('/')
                                    if len(parts) >= 2 and parts[1] == 'open':
                                        port = parts[0]
                                        f.write(f"{ip_match}:{port}\n")
                                        
                                        # Добавляем порт в результаты
                                        port_info = {
                                            'port': int(port),
                                            'protocol': parts[2] if len(parts) > 2 else 'tcp',
                                            'status': 'open',
                                            'service': parts[4] if len(parts) > 4 else 'unknown',
                                            'version': parts[6] if len(parts) > 6 else 'unknown'
                                        }
                                        scans[scan_id]['ports'].append(port_info)
        
        await log_message(scan_id, f"📊 Found {len(scans[scan_id]['ports'])} open ports")
        
    except Exception as e:
        await log_message(scan_id, f"❌ Error parsing nmap results: {str(e)}")

async def parse_nuclei_results(scan_id: str, log_dir: str):
    """Парсинг результатов nuclei"""
    nuclei_files = ['nuclei_results.txt', 'bitrix_nuclei.txt']
    
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
                            # Парсинг формата nuclei: URL [template-id] [severity]
                            if ' [' in line:
                                parts = line.split(' [')
                                url = parts[0].strip()
                                
                                # Извлекаем template-id и severity
                                template_info = ' ['.join(parts[1:])
                                brackets = []
                                temp = template_info
                                while '[' in temp and ']' in temp:
                                    start = temp.find('[')
                                    end = temp.find(']', start)
                                    if start != -1 and end != -1:
                                        brackets.append(temp[start+1:end])
                                        temp = temp[end+1:]
                                    else:
                                        break
                                
                                if len(brackets) >= 1:
                                    template_id = brackets[0]
                                    severity = brackets[1] if len(brackets) > 1 else 'info'
                                    
                                    vulnerability = {
                                        'title': template_id,
                                        'description': f'Vulnerability detected: {line}',
                                        'severity': severity.lower(),
                                        'url': url,
                                        'method': 'GET',
                                        'source': nuclei_file,
                                        'raw_output': line
                                    }
                                    
                                    scans[scan_id]['vulnerabilities'].append(vulnerability)
                                    await log_message(scan_id, f"🚨 Found vulnerability: {template_id} [{severity}] at {url}")
                            
                        except Exception as e:
                            await log_message(scan_id, f"❌ Error parsing nuclei line: {line[:50]}... - {str(e)}")
                            
            except Exception as e:
                await log_message(scan_id, f"❌ Error reading {nuclei_file}: {str(e)}")

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
            body {{ font-family: 'Courier New', monospace; background: #0d1117; color: #00ff00; margin: 20px; }}
            .header {{ border-bottom: 2px solid #00ff00; padding: 20px; }}
            .section {{ margin: 20px 0; padding: 20px; border: 1px solid #00ff00; }}
            .vulnerability {{ background: rgba(255,0,0,0.1); padding: 10px; margin: 10px 0; border-left: 5px solid #ff0000; }}
            .critical {{ border-left-color: #ff0000; }}
            .high {{ border-left-color: #ff9800; }}
            .medium {{ border-left-color: #ffeb3b; }}
            .low {{ border-left-color: #4caf50; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔥 AKUMA Web Scanner Report 🔥</h1>
            <p><strong>Target:</strong> {target}</p>
            <p><strong>Scan Type:</strong> {scan_data.get('scan_type', 'Unknown')}</p>
            <p><strong>Date:</strong> {scan_data.get('created_at', 'Unknown')}</p>
            <p><strong>Status:</strong> {scan_data.get('status', 'Unknown')}</p>
        </div>
        
        <div class="section">
            <h2>📊 Executive Summary</h2>
            <p>Security assessment completed for {target}.</p>
            <p>Total vulnerabilities found: {len(scan_data.get('vulnerabilities', []))}</p>
            <p>Open ports discovered: {len(scan_data.get('ports', []))}</p>
            <p>CMS detected: {scan_data.get('cms_detected', 'None')}</p>
        </div>
        
        <div class="section">
            <h2>🛡️ Vulnerabilities</h2>
    """
    
    for vuln in scan_data.get('vulnerabilities', []):
        severity_class = vuln.get('severity', 'low')
        html_content += f"""
            <div class="vulnerability {severity_class}">
                <h3>{vuln.get('title', 'Unknown')}</h3>
                <p><strong>Severity:</strong> {vuln.get('severity', 'unknown').upper()}</p>
                <p><strong>URL:</strong> {vuln.get('url', 'N/A')}</p>
                <p><strong>Description:</strong> {vuln.get('description', 'N/A')}</p>
            </div>
        """
    
    html_content += """
        </div>
        
        <div class="section">
            <h2>🔌 Network Analysis</h2>
            <ul>
    """
    
    for port in scan_data.get('ports', []):
        html_content += f"<li>{port.get('port', 'Unknown')}/{port.get('protocol', 'tcp')} - {port.get('service', 'Unknown')}</li>"
    
    html_content += """
            </ul>
        </div>
        
        <div class="section">
            <p><small>Report generated by AKUMA Scanner v3.0</small></p>
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

async def perform_scan(scan_id: str, target: str, scan_type: str):
    """Основная функция сканирования"""
    try:
        await log_message(scan_id, f"🚀 Starting {scan_type.upper()} scan of {target}")
        
        # Проверяем инструменты перед началом
        await log_message(scan_id, "🔧 Checking required tools...")
        tools_status = await tools_manager.check_all_tools()
        missing_tools = [tool for tool, path in tools_status.items() if not path]
        
        if missing_tools:
            await log_message(scan_id, f"⚠️ Missing tools: {', '.join(missing_tools)}")
            await log_message(scan_id, "🔧 Installing missing tools...")
            await tools_manager.install_missing_tools(missing_tools)
        
        # Этап 1: Discovery
        await phase_discovery(scan_id, target, scan_type)
        
        # Этап 2: Port Scan
        await phase_port_scan(scan_id, target, scan_type)
        
        # Этап 3: Web Probe
        await phase_web_probe(scan_id, target, scan_type)
        
        # Этап 4: Vulnerability Scan
        await phase_vulnerability_scan(scan_id, target, scan_type)
        
        # Этап 5: Directory Fuzzing (только для Full)
        await phase_fuzzing(scan_id, target, scan_type)
        
        # Этап 6: Deep Analysis
        await phase_deep_analysis(scan_id, target, scan_type)
        
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
        "totalScans": total_scans,
        "activeScans": active_scans,
        "vulnerabilities": total_vulnerabilities,
        "criticalIssues": critical_issues
    }

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
    
    # Определяем тип скана
    scan_type = scan_request.scanTypes[0] if scan_request.scanTypes else "full"
    if scan_type not in [ScanTypes.QUICK, ScanTypes.FULL]:
        scan_type = ScanTypes.FULL
    
    scan_data = {
        "id": scan_id,
        "name": scan_request.description,
        "target": scan_request.targets[0],
        "targets": scan_request.targets,
        "scan_type": scan_type,
        "status": "running",
        "progress": 0,
        "phase": ScanPhase.DISCOVERY,
        "created_at": datetime.now().isoformat(),
        "vulnerabilities": [],
        "ports": [],
        "log_dir": log_dir
    }
    
    scans[scan_id] = scan_data
    scan_logs[scan_id] = []
    
    # Запускаем сканирование в фоне
    task = asyncio.create_task(perform_scan(scan_id, scan_request.targets[0], scan_type))
    running_tasks[scan_id] = task
    
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
    if scan_id not in scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scans[scan_id].get('ports', [])

@app.get("/api/scans/{scan_id}/logs")
async def get_scan_logs(scan_id: str):
    if scan_id not in scan_logs:
        return []
    return scan_logs[scan_id]

@app.get("/api/scans/{scan_id}/vulnerabilities")
async def get_scan_vulnerabilities(scan_id: str):
    if scan_id not in scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scans[scan_id].get('vulnerabilities', [])

@app.get("/api/tools/status")
async def get_tools_status():
    """Проверка статуса инструментов"""
    tools_status = await tools_manager.check_all_tools()
    verification = await tools_manager.verify_installation()
    
    return {
        "tools_paths": tools_status,
        "verification": verification
    }

@app.post("/api/tools/install")
async def install_tools():
    """Установка отсутствующих инструментов"""
    try:
        success = await tools_manager.install_missing_tools()
        tools_status = await tools_manager.check_all_tools()
        
        return {
            "success": success,
            "tools_status": tools_status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
