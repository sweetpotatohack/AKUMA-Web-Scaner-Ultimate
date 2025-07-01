"""
AKUMA Scanner - Менеджер инструментов безопасности
Логика взята из script_scaner.sh и адаптирована для Python
"""

import asyncio
import logging
import os
import subprocess
import shutil
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

class ToolsManager:
    """Менеджер установки и проверки инструментов безопасности"""
    
    def __init__(self):
        self.tools_paths = {}
        self.go_tools = [
            "github.com/projectdiscovery/httpx/cmd/httpx@latest",
            "github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest", 
            "github.com/jaeles-project/jaeles@latest",
            "github.com/tomnomnom/waybackurls@latest",
            "github.com/tomnomnom/gf@latest"
        ]
        
        self.apt_tools = [
            "nmap", "git", "curl", "wget", "python3", "python3-pip", 
            "ruby", "jq", "whatweb", "build-essential", "libssl-dev"
        ]
        
        self.pip_tools = [
            "requests", "beautifulsoup4", "lxml"
        ]
        
        # Пути для поиска инструментов
        self.search_paths = {
            'httpx': ['/usr/local/bin/httpx', '/usr/bin/httpx', '/usr/bin/httpx-toolkit'],
            'nuclei': ['/usr/local/bin/nuclei', '/usr/bin/nuclei', '/go/bin/nuclei'],
            'nmap': ['/usr/bin/nmap', '/usr/local/bin/nmap'],
            'whatweb': ['/usr/bin/whatweb', '/usr/local/bin/whatweb'],
            'wpscan': ['/usr/bin/wpscan', '/usr/local/bin/wpscan', '/var/lib/gems/*/bin/wpscan'],
            'gobuster': ['/usr/bin/gobuster', '/usr/local/bin/gobuster'],
            'nikto': ['/usr/bin/nikto', '/usr/local/bin/nikto'],
            'dirsearch': ['/usr/local/bin/dirsearch', '/opt/dirsearch/dirsearch.py'],
            'testssl': ['/usr/bin/testssl', '/opt/testssl/testssl.sh']
        }
        
        # Команды установки
        self.install_commands = {
            'httpx': 'go install -v github.com/projectdiscovery/httpx/cmd/httpx@latest',
            'nuclei': 'go install -v github.com/projectdiscovery/nuclei/v2/cmd/nuclei@latest',
            'whatweb': 'apt install -y whatweb',
            'wpscan': 'gem install wpscan',
            'gobuster': 'apt install -y gobuster',
            'nikto': 'apt install -y nikto',
            'jaeles': 'GO111MODULE=on go install github.com/jaeles-project/jaeles@latest',
            'waybackurls': 'go install github.com/tomnomnom/waybackurls@latest'
        }

    def find_tool(self, tool_name: str) -> Optional[str]:
        """Найти путь к инструменту"""
        # Сначала ищем в известных путях
        if tool_name in self.search_paths:
            for path in self.search_paths[tool_name]:
                # Поддержка glob-паттернов для wpscan
                if '*' in path:
                    import glob
                    matches = glob.glob(path)
                    for match in matches:
                        if os.path.exists(match) and os.access(match, os.X_OK):
                            return match
                elif os.path.exists(path) and os.access(path, os.X_OK):
                    return path
        
        # Проверяем в PATH
        path = shutil.which(tool_name)
        if path:
            return path
            
        return None

    async def run_command(self, command: str, description: str = "") -> tuple:
        """Выполнить команду асинхронно"""
        logger.info(f"🔧 {description}: {command}")
        
        try:
            process = await asyncio.create_subprocess_shell(
                command,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            return (
                stdout.decode() if stdout else "",
                stderr.decode() if stderr else "",
                process.returncode
            )
        except Exception as e:
            logger.error(f"❌ Command failed: {command} - {str(e)}")
            return "", str(e), 1

    async def install_go_tools(self) -> bool:
        """Установка Go инструментов"""
        logger.info("🔧 Установка Go инструментов...")
        
        # Проверяем Go
        go_path = shutil.which('go')
        if not go_path:
            logger.error("❌ Go не установлен!")
            return False
            
        success_count = 0
        for tool in self.go_tools:
            tool_name = os.path.basename(tool).split('@')[0]
            
            if not self.find_tool(tool_name):
                logger.info(f"📦 Устанавливаем {tool_name}...")
                stdout, stderr, code = await self.run_command(
                    f"go install -v {tool}",
                    f"Installing {tool_name}"
                )
                
                if code == 0:
                    logger.info(f"✅ {tool_name} успешно установлен")
                    success_count += 1
                else:
                    logger.error(f"❌ Ошибка установки {tool_name}: {stderr}")
            else:
                logger.info(f"ℹ️ {tool_name} уже установлен")
                success_count += 1
                
        return success_count == len(self.go_tools)

    async def install_apt_tools(self) -> bool:
        """Установка APT пакетов"""
        logger.info("🔧 Установка APT пакетов...")
        
        # Обновляем пакеты
        stdout, stderr, code = await self.run_command(
            "apt update -y",
            "Updating package lists"
        )
        
        if code != 0:
            logger.error(f"❌ Ошибка обновления пакетов: {stderr}")
            return False
            
        # Устанавливаем базовые пакеты
        apt_packages = " ".join(self.apt_tools)
        stdout, stderr, code = await self.run_command(
            f"apt install -y --no-install-recommends {apt_packages}",
            "Installing APT packages"
        )
        
        return code == 0

    async def install_specialized_tools(self) -> bool:
        """Установка специализированных инструментов"""
        logger.info("🔧 Установка специализированных инструментов...")
        
        success = True
        
        # WPScan через gem
        if not self.find_tool('wpscan'):
            stdout, stderr, code = await self.run_command(
                "gem install wpscan",
                "Installing WPScan"
            )
            if code != 0:
                logger.warning("⚠️ Не удалось установить WPScan")
                success = False
                
        # cloud_enum
        if not os.path.exists("/root/cloud_enum/cloud_enum.py"):
            stdout, stderr, code = await self.run_command(
                "git clone https://github.com/initstring/cloud_enum.git /root/cloud_enum",
                "Cloning cloud_enum"
            )
            if code == 0:
                stdout, stderr, code = await self.run_command(
                    "pip3 install -r /root/cloud_enum/requirements.txt --break-system-packages",
                    "Installing cloud_enum dependencies"
                )
                
        # nuclei-templates-bitrix
        if not os.path.exists("/root/nuclei-templates-bitrix"):
            stdout, stderr, code = await self.run_command(
                "git clone https://github.com/jhonnybonny/nuclei-templates-bitrix.git /root/nuclei-templates-bitrix",
                "Cloning Bitrix Nuclei templates"
            )
            
        # check_bitrix
        if not os.path.exists("/root/check_bitrix/test_bitrix.py"):
            stdout, stderr, code = await self.run_command(
                "git clone https://github.com/k1rurk/check_bitrix.git /root/check_bitrix",
                "Cloning check_bitrix scanner"
            )
            if code == 0:
                stdout, stderr, code = await self.run_command(
                    "pip3 install -r /root/check_bitrix/requirements.txt --break-system-packages",
                    "Installing check_bitrix dependencies"
                )
                
        # testssl
        if not self.find_tool('testssl'):
            stdout, stderr, code = await self.run_command(
                "git clone --depth 1 https://github.com/drwetter/testssl.sh.git /opt/testssl",
                "Cloning testssl"
            )
            if code == 0:
                stdout, stderr, code = await self.run_command(
                    "ln -sf /opt/testssl/testssl.sh /usr/bin/testssl",
                    "Creating testssl symlink"
                )
                
        return success

    async def check_all_tools(self) -> Dict[str, str]:
        """Проверка всех инструментов и возврат их путей"""
        logger.info("🔍 Проверка установленных инструментов...")
        
        tools_status = {}
        required_tools = [
            'nmap', 'httpx', 'nuclei', 'whatweb', 'wpscan', 
            'gobuster', 'nikto', 'jaeles', 'waybackurls'
        ]
        
        for tool in required_tools:
            path = self.find_tool(tool)
            if path:
                tools_status[tool] = path
                logger.info(f"✅ {tool}: {path}")
            else:
                tools_status[tool] = None
                logger.warning(f"❌ {tool}: не найден")
                
        # Проверяем специальные инструменты
        special_tools = {
            'cloud_enum': '/root/cloud_enum/cloud_enum.py',
            'check_bitrix': '/root/check_bitrix/test_bitrix.py',
            'bitrix_templates': '/root/nuclei-templates-bitrix',
            'testssl': self.find_tool('testssl')
        }
        
        for tool, path in special_tools.items():
            if path and os.path.exists(path):
                tools_status[tool] = path
                logger.info(f"✅ {tool}: {path}")
            else:
                tools_status[tool] = None
                logger.warning(f"❌ {tool}: не найден")
                
        self.tools_paths = tools_status
        return tools_status

    async def install_missing_tools(self, required_tools: List[str] = None) -> bool:
        """Установка отсутствующих инструментов"""
        if required_tools is None:
            required_tools = ['nmap', 'httpx', 'nuclei', 'whatweb']
            
        logger.info("🚀 Начинаем установку отсутствующих инструментов...")
        
        # Проверяем права root
        if os.geteuid() != 0:
            logger.error("❌ Требуются root права для установки!")
            return False
            
        success = True
        
        try:
            # Устанавливаем APT пакеты
            if not await self.install_apt_tools():
                success = False
                
            # Устанавливаем Go инструменты
            if not await self.install_go_tools():
                success = False
                
            # Устанавливаем специализированные инструменты
            if not await self.install_specialized_tools():
                success = False
                
            # Финальная проверка
            await self.check_all_tools()
            
            logger.info("🎉 Установка завершена!")
            return success
            
        except Exception as e:
            logger.error(f"❌ Ошибка установки: {str(e)}")
            return False

    def get_tool_path(self, tool_name: str) -> Optional[str]:
        """Получить путь к инструменту"""
        return self.tools_paths.get(tool_name) or self.find_tool(tool_name)

    async def verify_installation(self) -> Dict[str, bool]:
        """Верификация установки всех инструментов"""
        verification = {}
        
        critical_tools = ['nmap', 'httpx', 'nuclei', 'whatweb']
        
        for tool in critical_tools:
            path = self.get_tool_path(tool)
            if path and os.access(path, os.X_OK):
                # Проверяем версию
                if tool == 'httpx':
                    stdout, stderr, code = await self.run_command(f"{path} -version", f"Checking {tool}")
                elif tool == 'nuclei':
                    stdout, stderr, code = await self.run_command(f"{path} -version", f"Checking {tool}")
                elif tool == 'nmap':
                    stdout, stderr, code = await self.run_command(f"{path} --version", f"Checking {tool}")
                else:
                    code = 0  # Для whatweb просто проверяем наличие
                    
                verification[tool] = code == 0
            else:
                verification[tool] = False
                
        return verification


# Глобальный экземпляр менеджера
tools_manager = ToolsManager()
