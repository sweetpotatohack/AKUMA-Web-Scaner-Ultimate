import re
import os

def parse_nmap_output(nmap_file, log_dir):
    """Улучшенный парсер результатов nmap"""
    ports = []
    
    if not os.path.exists(nmap_file):
        return ports
    
    try:
        with open(nmap_file, 'r') as f:
            content = f.read()
        
        # Парсим построчно результаты nmap
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            
            # Ищем строки с портами (формат: PORT STATE SERVICE VERSION)
            # Пример: 22/tcp open ssh OpenSSH 7.4 (protocol 2.0)
            port_pattern = r'(\d+)/(tcp|udp)\s+(open|closed|filtered)\s+(\S+)(?:\s+(.+))?'
            match = re.match(port_pattern, line)
            
            if match:
                port_num = int(match.group(1))
                protocol = match.group(2).upper()
                state = match.group(3)
                service = match.group(4) if match.group(4) else 'unknown'
                version = match.group(5) if match.group(5) else 'unknown'
                
                # Только открытые порты
                if state == 'open':
                    port_info = {
                        'port': port_num,
                        'protocol': protocol,
                        'status': state,
                        'service': service,
                        'version': version.strip() if version else 'unknown'
                    }
                    ports.append(port_info)
        
        # Дополнительно парсим из gnmap файла
        gnmap_file = nmap_file + '.gnmap'
        if os.path.exists(gnmap_file):
            with open(gnmap_file, 'r') as f:
                gnmap_content = f.read()
            
            # Парсим gnmap формат
            for line in gnmap_content.split('\n'):
                if 'Ports:' in line:
                    # Извлекаем IP
                    ip_match = re.search(r'Host: (\S+)', line)
                    ip = ip_match.group(1) if ip_match else 'unknown'
                    
                    # Извлекаем порты
                    ports_part = line.split('Ports: ')[1] if 'Ports: ' in line else ''
                    port_entries = ports_part.split(', ')
                    
                    for entry in port_entries:
                        if '/' in entry:
                            parts = entry.split('/')
                            if len(parts) >= 5:
                                try:
                                    port_num = int(parts[0])
                                    state = parts[1]
                                    protocol = parts[2].upper()
                                    owner = parts[3]
                                    service = parts[4]
                                    version = parts[6] if len(parts) > 6 else 'unknown'
                                    
                                    if state == 'open':
                                        # Проверяем, нет ли уже такого порта
                                        existing = next((p for p in ports if p['port'] == port_num), None)
                                        if not existing:
                                            port_info = {
                                                'port': port_num,
                                                'protocol': protocol,
                                                'status': state,
                                                'service': service,
                                                'version': version,
                                                'ip': ip
                                            }
                                            ports.append(port_info)
                                        elif existing and existing.get('version') == 'unknown' and version != 'unknown':
                                            # Обновляем версию если она была неизвестна
                                            existing['version'] = version
                                            if ip != 'unknown':
                                                existing['ip'] = ip
                                except (ValueError, IndexError):
                                    continue
        
        # Сохраняем улучшенные результаты
        ports_file = os.path.join(log_dir, 'parsed_ports.txt')
        with open(ports_file, 'w') as f:
            for port in ports:
                f.write(f"{port.get('ip', 'unknown')}:{port['port']}/{port['protocol']} - {port['service']} - {port['version']}\n")
        
    except Exception as e:
        print(f"Error parsing nmap output: {e}")
    
    return ports

def parse_httpx_output(httpx_file):
    """Парсер результатов httpx"""
    web_services = []
    
    if not os.path.exists(httpx_file):
        return web_services
    
    try:
        with open(httpx_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and line.startswith('http'):
                    web_services.append(line)
    except Exception as e:
        print(f"Error parsing httpx output: {e}")
    
    return web_services
