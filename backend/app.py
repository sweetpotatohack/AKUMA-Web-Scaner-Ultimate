from fastapi import FastAPI, HTTPException, File, UploadFile, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import uuid
import asyncio
from datetime import datetime
import json
import time
import random

app = FastAPI(
    title="AKUMA Advanced Scanner API",
    description="Advanced Cybersecurity Vulnerability Assessment Tool",
    version="2.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (in production, use a proper database)
scans_storage: Dict[str, Dict] = {}
notification_settings = {
    "email_notifications": False,
    "telegram_notifications": False,
    "email": "",
    "telegram_chat_id": ""
}

# Models
class ScanOptions(BaseModel):
    max_depth: int = 3
    threads: int = 10
    timeout: int = 30
    include_subdomains: bool = False

class ScanRequest(BaseModel):
    name: str
    target: str
    scan_type: str = "basic"
    options: ScanOptions = ScanOptions()

class NotificationSettings(BaseModel):
    email_notifications: bool = False
    telegram_notifications: bool = False
    email: str = ""
    telegram_chat_id: str = ""

# Vulnerability simulation data
VULNERABILITY_TEMPLATES = [
    {
        "title": "SQL Injection",
        "type": "sql_injection",
        "severity": "high",
        "description": "Potential SQL injection vulnerability detected in parameter",
        "recommendation": "Use parameterized queries and input validation"
    },
    {
        "title": "Cross-Site Scripting (XSS)",
        "type": "xss",
        "severity": "medium",
        "description": "Reflected XSS vulnerability found",
        "recommendation": "Implement proper input sanitization and output encoding"
    },
    {
        "title": "Directory Traversal",
        "type": "directory_traversal",
        "severity": "high",
        "description": "Directory traversal vulnerability detected",
        "recommendation": "Validate and sanitize file path inputs"
    },
    {
        "title": "Insecure HTTP Headers",
        "type": "security_headers",
        "severity": "low",
        "description": "Missing security headers detected",
        "recommendation": "Implement security headers like CSP, HSTS, X-Frame-Options"
    },
    {
        "title": "Weak SSL/TLS Configuration",
        "type": "ssl_tls",
        "severity": "medium",
        "description": "Weak SSL/TLS configuration detected",
        "recommendation": "Update SSL/TLS configuration to use secure protocols"
    }
]

SCAN_PHASES = [
    "Инициализация",
    "Обнаружение портов",
    "Сканирование веб-сервисов",
    "Анализ уязвимостей",
    "Генерация отчета",
    "Завершение"
]

# Background task for scan simulation
async def simulate_scan_progress(scan_id: str):
    """Simulate scan progress"""
    if scan_id not in scans_storage:
        return
    
    scan = scans_storage[scan_id]
    
    for i, phase in enumerate(SCAN_PHASES):
        if scan["status"] != "running":
            break
            
        # Update progress
        progress = int((i + 1) / len(SCAN_PHASES) * 100)
        scan.update({
            "progress": progress,
            "current_phase": phase,
            "updated_at": datetime.now().isoformat()
        })
        
        # Simulate work
        await asyncio.sleep(random.uniform(2, 5))
        
        # Sometimes add vulnerabilities during scanning
        if i >= 2 and random.random() < 0.3:  # 30% chance to find vulnerability
            vuln_template = random.choice(VULNERABILITY_TEMPLATES)
            vulnerability = {
                **vuln_template,
                "url": f"{scan['target']}/vulnerable-endpoint-{len(scan['vulnerabilities']) + 1}",
                "discovered_at": datetime.now().isoformat()
            }
            scan["vulnerabilities"].append(vulnerability)
            scan["vulnerability_count"] = len(scan["vulnerabilities"])
    
    # Complete scan
    if scan["status"] == "running":
        scan.update({
            "status": "completed",
            "progress": 100,
            "current_phase": "Завершен",
            "updated_at": datetime.now().isoformat(),
            "completed_at": datetime.now().isoformat()
        })

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "AKUMA Advanced Scanner API",
        "version": "2.0",
        "features": [
            "vulnerability_scanning",
            "reporting",
            "notifications"
        ]
    }

@app.post("/scans")
async def create_scan(scan_request: ScanRequest, background_tasks: BackgroundTasks):
    """Create new security scan"""
    
    # Handle multiple targets
    targets = [t.strip() for t in scan_request.target.replace('\n', ',').split(',') if t.strip()]
    created_scans = []
    
    for target in targets:
        scan_id = str(uuid.uuid4())
        scan_data = {
            "id": scan_id,
            "name": f"{scan_request.name}" + (f" - {target}" if len(targets) > 1 else ""),
            "target": target,
            "scan_type": scan_request.scan_type,
            "scan_profile": "web_application",
            "status": "running",
            "progress": 0,
            "current_phase": "Инициализация",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "options": scan_request.options.dict(),
            "vulnerabilities": [],
            "vulnerability_count": 0
        }
        
        scans_storage[scan_id] = scan_data
        created_scans.append(scan_data)
        
        # Start background scanning task
        background_tasks.add_task(simulate_scan_progress, scan_id)
    
    return {
        "created_scans": created_scans,
        "message": f"Created {len(created_scans)} scans"
    }

@app.get("/scans")
async def get_scans():
    """Get all scans"""
    scans_list = list(scans_storage.values())
    # Sort by creation date, newest first
    scans_list.sort(key=lambda x: x['created_at'], reverse=True)
    return scans_list

@app.get("/scans/{scan_id}")
async def get_scan(scan_id: str):
    """Get specific scan details"""
    if scan_id not in scans_storage:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scans_storage[scan_id]

@app.get("/scans/{scan_id}/progress")
async def get_scan_progress(scan_id: str):
    """Get scan progress"""
    if scan_id not in scans_storage:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan = scans_storage[scan_id]
    return {
        "scan_id": scan_id,
        "status": scan["status"],
        "progress": scan["progress"],
        "current_phase": scan["current_phase"],
        "percentage": scan["progress"],
        "current_step": scan["current_phase"],
        "urls_scanned": scan["progress"] * 2,  # Simulate URLs scanned
        "vulnerabilities_found": len(scan["vulnerabilities"])
    }

@app.get("/scans/{scan_id}/results")
async def get_scan_results(scan_id: str):
    """Get scan results"""
    if scan_id not in scans_storage:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan = scans_storage[scan_id]
    if scan["status"] != "completed":
        raise HTTPException(status_code=400, detail="Scan not completed yet")
    
    return {
        "scan_id": scan_id,
        "status": scan["status"],
        "vulnerabilities": scan["vulnerabilities"],
        "summary": {
            "total_vulnerabilities": len(scan["vulnerabilities"]),
            "critical": len([v for v in scan["vulnerabilities"] if v["severity"] == "critical"]),
            "high": len([v for v in scan["vulnerabilities"] if v["severity"] == "high"]),
            "medium": len([v for v in scan["vulnerabilities"] if v["severity"] == "medium"]),
            "low": len([v for v in scan["vulnerabilities"] if v["severity"] == "low"])
        }
    }

@app.get("/scans/{scan_id}/report")
async def generate_report(scan_id: str, format: str = "html"):
    """Generate scan report"""
    if scan_id not in scans_storage:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    scan = scans_storage[scan_id]
    
    if format == "html":
        html_report = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <title>AKUMA Scanner Report - {scan['name']}</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 40px; }}
                .header {{ text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }}
                .vulnerability {{ margin: 20px 0; padding: 15px; border-left: 4px solid #ff6600; background: #f9f9f9; }}
                .critical {{ border-color: #ff0000; }}
                .high {{ border-color: #ff6600; }}
                .medium {{ border-color: #ffff00; }}
                .low {{ border-color: #00ff00; }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>AKUMA Security Scan Report</h1>
                <h2>{scan['name']}</h2>
                <p>Target: {scan['target']}</p>
                <p>Scan Type: {scan['scan_type']}</p>
                <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            </div>
            
            <h3>Summary</h3>
            <p>Total Vulnerabilities Found: {len(scan['vulnerabilities'])}</p>
            
            <h3>Vulnerabilities</h3>
        """
        
        for vuln in scan['vulnerabilities']:
            html_report += f"""
            <div class="vulnerability {vuln['severity']}">
                <h4>{vuln['title']} ({vuln['severity'].upper()})</h4>
                <p><strong>URL:</strong> {vuln['url']}</p>
                <p><strong>Type:</strong> {vuln['type']}</p>
                <p><strong>Description:</strong> {vuln['description']}</p>
                <p><strong>Recommendation:</strong> {vuln['recommendation']}</p>
            </div>
            """
        
        html_report += """
        </body>
        </html>
        """
        
        return HTMLResponse(content=html_report)
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")

@app.post("/upload-targets")
async def upload_targets(file: UploadFile = File(...)):
    """Upload targets file"""
    if not file.filename.endswith(('.txt', '.csv')):
        raise HTTPException(status_code=400, detail="Only .txt and .csv files are supported")
    
    content = await file.read()
    targets = []
    
    try:
        text_content = content.decode('utf-8')
        lines = text_content.strip().split('\n')
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('#'):  # Skip empty lines and comments
                targets.append(line)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")
    
    return {
        "targets": targets,
        "count": len(targets),
        "message": f"Successfully parsed {len(targets)} targets"
    }

@app.get("/notifications/settings")
async def get_notification_settings():
    """Get notification settings"""
    return notification_settings

@app.put("/notifications/settings")
async def update_notification_settings(settings: NotificationSettings):
    """Update notification settings"""
    global notification_settings
    notification_settings.update(settings.dict())
    return {"message": "Settings updated successfully"}

@app.post("/notifications/test")
async def test_notification(request: dict):
    """Test notification"""
    notification_type = request.get("type", "email")
    return {
        "message": f"Test {notification_type} notification sent successfully",
        "status": "ok"
    }

@app.get("/stats")
async def get_stats():
    """Get system statistics"""
    running_scans = len([s for s in scans_storage.values() if s["status"] == "running"])
    completed_scans = len([s for s in scans_storage.values() if s["status"] == "completed"])
    total_vulnerabilities = sum(len(s["vulnerabilities"]) for s in scans_storage.values())
    
    return {
        "total_scans": len(scans_storage),
        "running_scans": running_scans,
        "completed_scans": completed_scans,
        "vulnerabilities_found": total_vulnerabilities,
        "targets_scanned": len(set(s["target"] for s in scans_storage.values())),
        "last_updated": datetime.now().isoformat()
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
