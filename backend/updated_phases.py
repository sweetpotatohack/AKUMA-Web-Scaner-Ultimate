"""
Обновленные фазы сканирования с полным набором инструментов
"""
import os
import asyncio
from scan_types import get_scan_config

# Пути к инструментам
TOOLS = {
    'nmap': '/usr/bin/nmap',
    'httpx': '/usr/bin/httpx', 
    'nuclei': '/usr/bin/nuclei',
    'dirsearch': '/usr/bin/dirsearch',
    'whatweb': '/usr/bin/whatweb',
    'subfinder': '/usr/bin/subfinder',
    'assetfinder': '/usr/bin/assetfinder',
    'ffuf': '/usr/bin/ffuf',
    'gobuster': '/usr/bin/gobuster',
    'nikto': '/usr/bin/nikto',
    'wpscan': '/usr/bin/wpscan'
}

async def phase_port_scan_enhanced(scan_id: str, target: str, scan_type: str, run_command, log_message):
    """Улучшенное сканирование портов с учетом типа скана"""
    config = get_scan_config(scan_type)
    await log_message(scan_id, f"🔍 Starting Enhanced Port Scan phase for {target}")
    
    log_dir = scans[scan_id]['log_dir']
    nmap_output = os.path.join(log_dir, 'nmap_result')
    
    # Используем конфигурацию из типа скана
    nmap_cmd = f"{TOOLS['nmap']} {config['nmap_options']} -oN {nmap_output} -oG {nmap_output}.gnmap {target}"
    
    stdout, stderr, code = await run_command(
        scan_id,
        nmap_cmd,
        f"Running {config['name']} port scan on {target}"
    )
    
    # Парсинг результатов nmap
    if os.path.exists(f"{nmap_output}.gnmap"):
        await parse_nmap_results(scan_id, f"{nmap_output}.gnmap", log_message)
    
    await log_message(scan_id, f"✅ Enhanced Port Scan phase completed")

async def phase_web_probe_enhanced(scan_id: str, target: str, scan_type: str, run_command, log_message):
    """Улучшенное сканирование веб-сервисов"""
    config = get_scan_config(scan_type)
    await log_message(scan_id, f"🔍 Starting Enhanced Web Probe phase for {target}")
    
    log_dir = scans[scan_id]['log_dir']
    
    # Проверка веб-сервисов с httpx
    if os.path.exists(f"{log_dir}/open_ports.txt"):
        httpx_cmd = f"{TOOLS['httpx']} -l {log_dir}/open_ports.txt -o {log_dir}/httpx_result.txt -silent -follow-redirects -title -tech-detect -status-code"
    else:
        # Базовая проверка если нет списка портов
        httpx_cmd = f"echo 'https://{target}' | {TOOLS['httpx']} -o {log_dir}/httpx_result.txt -silent -follow-redirects -title -tech-detect -status-code"
    
    stdout, stderr, code = await run_command(scan_id, httpx_cmd, "Probing web services with httpx")
    
    # Анализ веб-технологий с whatweb
    if os.path.exists(f"{log_dir}/httpx_result.txt"):
        whatweb_cmd = f"{TOOLS['whatweb']} -i {log_dir}/httpx_result.txt --log-verbose={log_dir}/whatweb_result.txt --color=never"
        stdout, stderr, code = await run_command(scan_id, whatweb_cmd, "Analyzing web technologies with whatweb")
        
        # Определение CMS
        await detect_cms(scan_id, log_dir, log_message)
    
    await log_message(scan_id, f"✅ Enhanced Web Probe phase completed")

async def phase_vulnerability_scan_enhanced(scan_id: str, target: str, scan_type: str, run_command, log_message):
    """Улучшенное сканирование уязвимостей"""
    config = get_scan_config(scan_type)
    await log_message(scan_id, f"🔍 Starting Enhanced Vulnerability Scan phase for {target}")
    
    log_dir = scans[scan_id]['log_dir']
    cms_detected = scans[scan_id].get('cms_detected')
    
    # Основное сканирование с nuclei
    if os.path.exists(f"{log_dir}/httpx_result.txt"):
        severity_filter = ",".join(config['nuclei_severity'])
        nuclei_cmd = f"{TOOLS['nuclei']} -l {log_dir}/httpx_result.txt -o {log_dir}/nuclei_results.txt -silent -severity {severity_filter} -rate-limit {config.get('max_threads', 10)}"
        stdout, stderr, code = await run_command(scan_id, nuclei_cmd, f"Running nuclei vulnerability scanner (severity: {severity_filter})")
    
    # Специализированные сканеры по типу CMS
    if cms_detected == 'Bitrix' and config.get('enable_cms_scan', True):
        await scan_bitrix_vulnerabilities(scan_id, target, log_dir, run_command, log_message)
    elif cms_detected == 'WordPress' and config.get('enable_cms_scan', True):
        await scan_wordpress_vulnerabilities(scan_id, target, log_dir, run_command, log_message)
    
    # Nikto сканирование для веб-уязвимостей
    if config.get('enable_web_vuln_scan', True):
        nikto_cmd = f"{TOOLS['nikto']} -h {target} -output {log_dir}/nikto_results.txt"
        stdout, stderr, code = await run_command(scan_id, nikto_cmd, "Running Nikto web vulnerability scanner")
    
    # Парсинг результатов
    await parse_nuclei_results_enhanced(scan_id, log_dir, log_message)
    
    await log_message(scan_id, f"✅ Enhanced Vulnerability Scan phase completed")

async def phase_directory_fuzzing_enhanced(scan_id: str, target: str, scan_type: str, run_command, log_message):
    """Улучшенное сканирование директорий"""
    config = get_scan_config(scan_type)
    
    if not config.get('enable_directory_fuzzing', True):
        await log_message(scan_id, f"⏭️ Directory fuzzing disabled for {config['name']}")
        return
        
    await log_message(scan_id, f"🔍 Starting Enhanced Directory Fuzzing phase for {target}")
    
    log_dir = scans[scan_id]['log_dir']
    
    # Выбор словаря в зависимости от типа скана
    wordlist_map = {
        'small': '/usr/share/wordlists/dirb/small.txt',
        'medium': '/usr/share/wordlists/dirb/common.txt', 
        'large': '/usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt',
        'mega': '/usr/share/wordlists/dirbuster/directory-list-2.3-big.txt'
    }
    
    wordlist = wordlist_map.get(config.get('fuzzing_wordlist', 'medium'), wordlist_map['medium'])
    
    # Читаем веб-сервисы из httpx_result.txt
    httpx_file = os.path.join(log_dir, 'httpx_result.txt')
    if os.path.exists(httpx_file):
        with open(httpx_file, 'r') as f:
            web_targets = [line.strip() for line in f if line.strip()]
        
        await log_message(scan_id, f"📡 Found {len(web_targets)} web services for fuzzing")
        
        # Запускаем фаззинг для каждого веб-сервиса
        for i, web_target in enumerate(web_targets[:3]):  # Ограничиваем количество
            await log_message(scan_id, f"🔍 Fuzzing {web_target} ({i+1}/{len(web_targets[:3])})")
            
            # Dirsearch
            dirsearch_cmd = f"python3 {TOOLS['dirsearch']} -u {web_target} -w {wordlist} -o {log_dir}/dirsearch_{i}.txt --format=simple -q --threads={config.get('max_threads', 10)}"
            stdout, stderr, code = await run_command(scan_id, dirsearch_cmd, f"Running dirsearch on {web_target}")
            
            # Gobuster (если установлен)
            if os.path.exists(TOOLS.get('gobuster', '')):
                gobuster_cmd = f"{TOOLS['gobuster']} dir -u {web_target} -w {wordlist} -o {log_dir}/gobuster_{i}.txt -t {config.get('max_threads', 10)} -q"
                stdout, stderr, code = await run_command(scan_id, gobuster_cmd, f"Running gobuster on {web_target}")
    
    await log_message(scan_id, f"✅ Enhanced Directory Fuzzing phase completed")

async def detect_cms(scan_id: str, log_dir: str, log_message):
    """Определение CMS из результатов whatweb"""
    whatweb_file = os.path.join(log_dir, 'whatweb_result.txt')
    if os.path.exists(whatweb_file):
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

async def scan_bitrix_vulnerabilities(scan_id: str, target: str, log_dir: str, run_command, log_message):
    """Специализированное сканирование Bitrix"""
    await log_message(scan_id, "🎯 Running Bitrix-specific vulnerability scans...")
    
    # Клонируем специализированные инструменты для Bitrix
    bitrix_dir = os.path.join(log_dir, 'bitrix_tools')
    
    # check_bitrix
    stdout, stderr, code = await run_command(
        scan_id,
        f"cd {log_dir} && git clone https://github.com/k1rurk/check_bitrix {bitrix_dir}",
        "Cloning Bitrix vulnerability scanner"
    )
    
    if os.path.exists(bitrix_dir):
        # Устанавливаем зависимости
        stdout, stderr, code = await run_command(
            scan_id,
            f"cd {bitrix_dir} && pip3 install -r requirements.txt",
            "Installing Bitrix scanner dependencies"
        )
        
        # Запускаем сканирование
        cmd = f"cd {bitrix_dir} && python3 test_bitrix.py -t https://{target} scan > {log_dir}/bitrix_scan.txt 2>&1"
        stdout, stderr, code = await run_command(scan_id, cmd, "Running Bitrix vulnerability scan")

async def scan_wordpress_vulnerabilities(scan_id: str, target: str, log_dir: str, run_command, log_message):
    """Специализированное сканирование WordPress"""
    await log_message(scan_id, "🎯 Running WordPress-specific vulnerability scans...")
    
    # WPScan
    wp_api_token = os.getenv('WPSCAN_API_TOKEN', '')
    if wp_api_token and os.path.exists(TOOLS.get('wpscan', '')):
        cmd = f"{TOOLS['wpscan']} --url https://{target} --api-token {wp_api_token} --output {log_dir}/wpscan_results.txt"
    elif os.path.exists(TOOLS.get('wpscan', '')):
        cmd = f"{TOOLS['wpscan']} --url https://{target} --output {log_dir}/wpscan_results.txt"
    else:
        await log_message(scan_id, "⚠️ WPScan not installed, skipping WordPress scan")
        return
    
    stdout, stderr, code = await run_command(scan_id, cmd, "Running WPScan for WordPress vulnerabilities")

async def parse_nmap_results(scan_id: str, gnmap_file: str, log_message):
    """Парсинг результатов nmap"""
    try:
        with open(gnmap_file, 'r') as f:
            content = f.read()
        
        open_ports = []
        for line in content.split('\n'):
            if 'Ports:' in line:
                # Извлекаем информацию о портах
                ports_section = line.split('Ports: ')[1] if 'Ports: ' in line else ''
                if ports_section:
                    port_entries = ports_section.split(', ')
                    for entry in port_entries:
                        if '/' in entry:
                            parts = entry.split('/')
                            if len(parts) >= 3 and parts[1] == 'open':
                                port = {
                                    'port': int(parts[0]),
                                    'protocol': parts[2] if len(parts) > 2 else 'tcp',
                                    'status': 'open',
                                    'service': parts[4] if len(parts) > 4 else 'unknown',
                                    'version': parts[6] if len(parts) > 6 else 'unknown'
                                }
                                open_ports.append(port)
        
        scans[scan_id]['ports'] = open_ports
        await log_message(scan_id, f"📊 Parsed {len(open_ports)} open ports from nmap results")
        
    except Exception as e:
        await log_message(scan_id, f"❌ Error parsing nmap results: {str(e)}")

async def parse_nuclei_results_enhanced(scan_id: str, log_dir: str, log_message):
    """Улучшенный парсинг результатов nuclei"""
    nuclei_files = [
        'nuclei_results.txt',
        'nuclei_bitrix_results.txt'
    ]
    
    vulnerabilities = []
    
    for nuclei_file in nuclei_files:
        file_path = os.path.join(log_dir, nuclei_file)
        if os.path.exists(file_path):
            try:
                with open(file_path, 'r') as f:
                    content = f.read()
                
                # Парсинг новых форматов nuclei
                lines = content.strip().split('\n')
                for line in lines:
                    if line.strip() and '[' in line and ']' in line:
                        try:
                            # Новый формат nuclei v3
                            if ' [' in line and '] ' in line:
                                parts = line.split(' [')
                                if len(parts) >= 2:
                                    url = parts[0].strip()
                                    remaining = ' [' + parts[1]
                                    
                                    # Извлекаем все части в квадратных скобках
                                    brackets_content = []
                                    temp = remaining
                                    while '[' in temp and ']' in temp:
                                        start = temp.find('[')
                                        end = temp.find(']', start)
                                        if start != -1 and end != -1:
                                            brackets_content.append(temp[start+1:end])
                                            temp = temp[end+1:]
                                        else:
                                            break
                                    
                                    if len(brackets_content) >= 2:
                                        template_id = brackets_content[0]
                                        severity = brackets_content[1] if len(brackets_content) > 1 else 'info'
                                        
                                        vulnerability = {
                                            'title': template_id,
                                            'description': f'Vulnerability detected: {line}',
                                            'severity': severity.lower(),
                                            'url': url,
                                            'method': 'GET',
                                            'source': nuclei_file,
                                            'raw_output': line
                                        }
                                        
                                        vulnerabilities.append(vulnerability)
                                        await log_message(scan_id, f"🚨 Found vulnerability: {template_id} [{severity}] at {url}")
                            
                        except Exception as e:
                            await log_message(scan_id, f"❌ Error parsing nuclei line: {line[:100]}... - {str(e)}")
                            
            except Exception as e:
                await log_message(scan_id, f"❌ Error reading {nuclei_file}: {str(e)}")
    
    # Обновляем результаты скана
    scans[scan_id]['vulnerabilities'].extend(vulnerabilities)
    await log_message(scan_id, f"📊 Total vulnerabilities found: {len(scans[scan_id]['vulnerabilities'])}")
