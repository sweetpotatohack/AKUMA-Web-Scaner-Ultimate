"""
AKUMA Scanner - Парсер результатов httpx
Чистим весь этот хлам с цветными кодами и метаданными
"""

import re
import os
from typing import List, Dict, Optional

class HttpxParser:
    """Парсер результатов httpx с очисткой от мусора"""
    
    def __init__(self):
        # Регексы для очистки ANSI цветовых кодов
        self.ansi_escape = re.compile(r'\x1B(?:[@-Z\\-_]|\[[0-?]*[ -/]*[@-~])')
        
        # Регексы для парсинга httpx output
        self.httpx_pattern = re.compile(r'^(https?://[^\s\[\]]+)')
        self.status_pattern = re.compile(r'\[(\d+)\s+([^\]]+)\]')
        self.tech_pattern = re.compile(r'\[([^\]]+)\](?:\s*\[([^\]]+)\])*')
        
    def clean_ansi_codes(self, text: str) -> str:
        """Удаляем ANSI цветовые коды"""
        return self.ansi_escape.sub('', text)
    
    def parse_httpx_line(self, line: str) -> Optional[Dict]:
        """Парсим одну строку из httpx результата"""
        if not line.strip():
            return None
            
        # Очищаем от ANSI кодов
        clean_line = self.clean_ansi_codes(line.strip())
        
        # Извлекаем URL
        url_match = self.httpx_pattern.match(clean_line)
        if not url_match:
            return None
            
        url = url_match.group(1)
        
        # Парсим статус код и заголовок
        status_code = None
        status_text = None
        status_match = self.status_pattern.search(clean_line)
        if status_match:
            status_code = int(status_match.group(1))
            status_text = status_match.group(2)
        
        # Извлекаем технологии
        tech_info = []
        remaining_line = clean_line[len(url):] if url else clean_line
        
        # Убираем статус из строки
        if status_match:
            remaining_line = remaining_line.replace(status_match.group(0), '', 1)
        
        # Парсим технологии из оставшихся скобок
        brackets = re.findall(r'\[([^\]]+)\]', remaining_line)
        for bracket in brackets:
            # Разделяем по запятым для технологий вроде [Basic,Nginx]
            techs = [tech.strip() for tech in bracket.split(',')]
            tech_info.extend(techs)
        
        # Определяем CMS из технологий
        cms_detected = None
        for tech in tech_info:
            tech_lower = tech.lower()
            if 'bitrix' in tech_lower or '1c-bitrix' in tech_lower:
                cms_detected = 'Bitrix'
                break
            elif 'wordpress' in tech_lower or 'wp-' in tech_lower:
                cms_detected = 'WordPress'
                break
            elif 'drupal' in tech_lower:
                cms_detected = 'Drupal'
                break
            elif 'joomla' in tech_lower:
                cms_detected = 'Joomla'
                break
        
        return {
            'url': url,
            'status_code': status_code,
            'status_text': status_text,
            'technologies': tech_info,
            'cms_detected': cms_detected,
            'raw_line': clean_line
        }
    
    def parse_httpx_file(self, file_path: str) -> List[Dict]:
        """Парсим весь файл httpx результатов"""
        results = []
        
        if not os.path.exists(file_path):
            return results
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                for line in f:
                    parsed = self.parse_httpx_line(line)
                    if parsed:
                        results.append(parsed)
        except Exception as e:
            print(f"Error parsing httpx file {file_path}: {e}")
            
        return results
    
    def extract_clean_urls(self, file_path: str, output_file: str = None) -> List[str]:
        """Извлекаем чистые URL'ы без метаданных"""
        results = self.parse_httpx_file(file_path)
        clean_urls = [result['url'] for result in results]
        
        if output_file:
            try:
                with open(output_file, 'w') as f:
                    for url in clean_urls:
                        f.write(f"{url}\n")
            except Exception as e:
                print(f"Error writing clean URLs to {output_file}: {e}")
        
        return clean_urls
    
    def detect_cms_from_results(self, results: List[Dict]) -> Dict[str, str]:
        """Определяем CMS для каждого URL'а"""
        cms_mapping = {}
        
        for result in results:
            if result['cms_detected']:
                cms_mapping[result['url']] = result['cms_detected']
                
        return cms_mapping
    
    def get_targets_by_cms(self, results: List[Dict], cms_type: str) -> List[str]:
        """Получаем URL'ы для конкретного типа CMS"""
        targets = []
        
        for result in results:
            if result['cms_detected'] and result['cms_detected'].lower() == cms_type.lower():
                targets.append(result['url'])
                
        return targets

# Глобальный экземпляр парсера
httpx_parser = HttpxParser()
