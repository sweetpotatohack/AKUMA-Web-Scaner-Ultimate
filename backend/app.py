import asyncio
import json
import os
import subprocess
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

# Глобальные переменные
scans: Dict[str, dict] = {}
scan_logs: Dict[str, List[str]] = {}

class AkumaScanRequest(BaseModel):
    target: str

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

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/scans")
async def get_scans():
    return list(scans.values())

@app.get("/api/scans/{scan_id}")
async def get_scan(scan_id: str):
    if scan_id not in scans:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scans[scan_id]

@app.get("/api/scans/{scan_id}/logs")
async def get_scan_logs(scan_id: str):
    if scan_id not in scan_logs:
        return []
    return scan_logs[scan_id]

@app.post("/api/akuma-scan")
async def run_akuma_scan(scan_request: AkumaScanRequest, background_tasks: BackgroundTasks):
    """Запуск полного AKUMA скана с киберпанк интерфейсом"""
    scan_id = str(uuid.uuid4())
    target = scan_request.target
    
    log_dir = f"/tmp/akuma_scan_{scan_id}"
    os.makedirs(log_dir, exist_ok=True)

    scan_data = {
        "id": scan_id,
        "name": f"AKUMA Full Scan for {target}",
        "target": target,
        "status": "running",
        "created_at": datetime.now().isoformat(),
        "log_dir": log_dir,
        "type": "akuma_full",
        "vulnerabilities": [],
        "ports": []
    }
    scans[scan_id] = scan_data
    scan_logs[scan_id] = []

    background_tasks.add_task(run_akuma_script, scan_id, target, log_dir)
    
    return {
        "scan_id": scan_id,
        "status": "created",
        "message": f"🔥 AKUMA Full Scan started for {target}"
    }

async def run_akuma_script(scan_id: str, target: str, log_dir: str):
    """Выполнение полного AKUMA скана"""
    await log_message(scan_id, "🔥 AKUMA Full Scan initiated!")
    await log_message(scan_id, "💀 Entering the cyber matrix...")
    
    # Запускаем наш киберпанк-скрипт!
    script_path = "/app/akuma_scanner.sh"
    if not os.path.exists(script_path):
        script_path = "./akuma_scanner.sh"
    
    command = f"chmod +x {script_path} && {script_path} {target}"
    
    try:
        process = await asyncio.create_subprocess_shell(
            command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=os.path.dirname(script_path) or "."
        )
        
        # Читаем вывод построчно и отправляем в логи
        while True:
            line = await process.stdout.readline()
            if not line:
                break
            decoded_line = line.decode().strip()
            if decoded_line:
                await log_message(scan_id, decoded_line)
        
        await process.wait()

        if process.returncode == 0:
            scans[scan_id]['status'] = 'completed'
            scans[scan_id]['completed_at'] = datetime.now().isoformat()
            await log_message(scan_id, "✅ AKUMA Full Scan completed successfully!")
        else:
            scans[scan_id]['status'] = 'failed'
            stderr_output = await process.stderr.read()
            await log_message(scan_id, f"❌ AKUMA Full Scan failed with exit code {process.returncode}")
            if stderr_output:
                await log_message(scan_id, f"Error: {stderr_output.decode()}")

    except Exception as e:
        scans[scan_id]['status'] = 'failed'
        await log_message(scan_id, f"❌ Exception during AKUMA scan: {str(e)}")

@app.get("/api/akuma-scans")
async def get_akuma_scans():
    """Получить все AKUMA сканы"""
    akuma_scans = [scan for scan in scans.values() if scan.get('type') == 'akuma_full']
    return akuma_scans

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.get("/api/stats")
async def get_stats():
    """Получить статистику системы"""
    total_scans = len(scans)
    active_scans = len([s for s in scans.values() if s['status'] == 'running'])
    completed_scans = len([s for s in scans.values() if s['status'] == 'completed'])
    failed_scans = len([s for s in scans.values() if s['status'] == 'failed'])
    
    return {
        "totalScans": total_scans,
        "activeScans": active_scans,
        "completedScans": completed_scans,
        "failedScans": failed_scans,
        "vulnerabilities": 0,
        "criticalIssues": 0
    }

@app.get("/api/config")
async def get_config():
    """Получить конфигурацию сканера"""
    return {
        "scanner_version": "3.0",
        "max_concurrent_scans": 5,
        "default_scan_timeout": 3600,
        "supported_scan_types": ["akuma_full"],
        "features": {
            "matrix_ui": True,
            "real_time_logs": True,
            "cyber_punk_theme": True,
            "docker_integration": True
        }
    }
