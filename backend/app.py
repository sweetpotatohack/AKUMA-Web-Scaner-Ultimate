from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, HTMLResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import asyncio
import logging
import time
import uuid
import os
from datetime import datetime, timedelta
import re
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AKUMA Web Scanner API",
    description="Advanced Web Vulnerability Scanner",
    version="2.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class ScanRequest(BaseModel):
    targets: List[str]
    scan_type: str = "comprehensive"
    max_depth: int = 3
    threads: int = 10
    timeout: int = 30
    rate_limit: int = 60  # requests per minute

class ScanUpdate(BaseModel):
    scan_id: str
    status: str
    progress: int
    current_phase: str
    message: str

class Vulnerability(BaseModel):
    title: str
    description: str
    severity: str
    url: str
    method: str = "GET"
    parameter: Optional[str] = None
    payload: Optional[str] = None
    solution: Optional[str] = None

class Port(BaseModel):
    port: int
    protocol: str = "TCP"
    status: str
    service: Optional[str] = None
    version: Optional[str] = None

# In-memory storage (in production, use proper database)
scans_db = {}
websocket_connections = {}

# WebSocket manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, scan_id: str):
        await websocket.accept()
        if scan_id not in self.active_connections:
            self.active_connections[scan_id] = []
        self.active_connections[scan_id].append(websocket)

    def disconnect(self, websocket: WebSocket, scan_id: str):
        if scan_id in self.active_connections:
            self.active_connections[scan_id].remove(websocket)

    async def send_message(self, message: dict, scan_id: str):
        if scan_id in self.active_connections:
            for connection in self.active_connections[scan_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except:
                    pass

manager = ConnectionManager()

# Vulnerability patterns for simulation
VULNERABILITY_PATTERNS = {
    'sql_injection': {
        'payloads': ["' OR '1'='1", "1; DROP TABLE users--", "' UNION SELECT 1,2,3--"],
        'indicators': ['sql syntax', 'mysql error', 'postgresql error'],
        'severity': 'critical'
    },
    'xss': {
        'payloads': ["<script>alert('XSS')</script>", "<img src=x onerror=alert(1)>"],
        'indicators': ['<script>', 'onerror=', 'javascript:'],
        'severity': 'high'
    },
    'directory_traversal': {
        'payloads': ["../../../etc/passwd", "..\\..\\..\\windows\\system32\\"],
        'indicators': ['root:x:', '[system process]'],
        'severity': 'high'
    },
    'csrf': {
        'payloads': [],
        'indicators': ['no csrf token', 'missing anti-csrf'],
        'severity': 'medium'
    }
}

COMMON_PORTS = [21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 993, 995, 1723, 3306, 3389, 5432, 5900, 8080]

async def simulate_scan_phase(scan_id: str, phase: str, target: str):
    """Simulate a scanning phase with realistic progress"""
    phases = {
        'discovery': {'duration': 15, 'steps': ['Resolving DNS', 'Checking connectivity', 'Detecting web server']},
        'port_scan': {'duration': 20, 'steps': ['Scanning common ports', 'Service detection', 'Version enumeration']},
        'web_probe': {'duration': 25, 'steps': ['HTTP/HTTPS detection', 'Crawling web pages', 'Technology detection']},
        'vulnerability_scan': {'duration': 30, 'steps': ['SQL injection tests', 'XSS detection', 'Directory traversal']},
        'deep_analysis': {'duration': 10, 'steps': ['Analyzing results', 'Generating report', 'Finalizing scan']}
    }
    
    if phase not in phases:
        return
    
    phase_info = phases[phase]
    total_steps = len(phase_info['steps'])
    
    for i, step in enumerate(phase_info['steps']):
        # Send log message
        await manager.send_message({
            'type': 'log',
            'level': 'info',
            'message': f"[{phase.upper()}] {step} for {target}",
            'phase': phase
        }, scan_id)
        
        # Simulate work
        await asyncio.sleep(phase_info['duration'] / total_steps)
        
        # Update progress
        phase_progress = ((i + 1) / total_steps) * 100
        await manager.send_message({
            'type': 'progress',
            'progress': phase_progress,
            'current_phase': f"{phase} ({step})"
        }, scan_id)
        
        # Simulate finding vulnerabilities
        if phase == 'vulnerability_scan' and random.random() < 0.3:
            vuln_type = random.choice(list(VULNERABILITY_PATTERNS.keys()))
            pattern = VULNERABILITY_PATTERNS[vuln_type]
            
            vulnerability = {
                'title': f"{vuln_type.replace('_', ' ').title()} Vulnerability",
                'description': f"Potential {vuln_type.replace('_', ' ')} vulnerability detected",
                'severity': pattern['severity'],
                'url': f"{target}/{random.choice(['admin', 'login', 'search', 'contact'])}",
                'method': random.choice(['GET', 'POST']),
                'parameter': random.choice(['id', 'username', 'search', 'file']) if random.random() < 0.7 else None,
                'payload': random.choice(pattern['payloads']) if pattern['payloads'] else None,
                'solution': f"Implement proper input validation and sanitization for {vuln_type.replace('_', ' ')}"
            }
            
            await manager.send_message({
                'type': 'vulnerability',
                'vulnerability': vulnerability
            }, scan_id)
            
            # Add to scan data
            if scan_id in scans_db:
                if 'vulnerabilities' not in scans_db[scan_id]:
                    scans_db[scan_id]['vulnerabilities'] = []
                scans_db[scan_id]['vulnerabilities'].append(vulnerability)
        
        # Simulate port discovery
        if phase == 'port_scan' and random.random() < 0.4:
            port = random.choice(COMMON_PORTS)
            port_info = {
                'port': port,
                'protocol': 'TCP',
                'status': 'open',
                'service': {21: 'ftp', 22: 'ssh', 80: 'http', 443: 'https', 3306: 'mysql'}.get(port, 'unknown'),
                'version': f"v{random.randint(1,3)}.{random.randint(0,9)}.{random.randint(0,9)}" if random.random() < 0.6 else None
            }
            
            if 'ports' not in scans_db[scan_id]:
                scans_db[scan_id]['ports'] = []
            scans_db[scan_id]['ports'].append(port_info)
            
            await manager.send_message({
                'type': 'ports',
                'ports': [port_info]
            }, scan_id)

async def run_scan(scan_id: str, targets: List[str], config: dict):
    """Run a complete scan simulation"""
    try:
        scans_db[scan_id]['status'] = 'running'
        scans_db[scan_id]['progress'] = 0
        
        phases = ['discovery', 'port_scan', 'web_probe', 'vulnerability_scan', 'deep_analysis']
        total_phases = len(phases)
        
        for i, phase in enumerate(phases):
            for target in targets:
                await simulate_scan_phase(scan_id, phase, target)
                
                # Update overall progress
                overall_progress = ((i + 1) / total_phases) * 100
                scans_db[scan_id]['progress'] = int(overall_progress)
                
                await manager.send_message({
                    'type': 'progress',
                    'progress': overall_progress,
                    'status': 'running',
                    'current_phase': phase
                }, scan_id)
        
        # Complete scan
        scans_db[scan_id]['status'] = 'completed'
        scans_db[scan_id]['progress'] = 100
        scans_db[scan_id]['completed_at'] = datetime.now().isoformat()
        
        await manager.send_message({
            'type': 'log',
            'level': 'success',
            'message': f"Scan completed successfully for {len(targets)} target(s)",
            'phase': 'completed'
        }, scan_id)
        
        await manager.send_message({
            'type': 'progress',
            'progress': 100,
            'status': 'completed',
            'current_phase': 'completed'
        }, scan_id)
        
    except Exception as e:
        scans_db[scan_id]['status'] = 'failed'
        scans_db[scan_id]['error'] = str(e)
        
        await manager.send_message({
            'type': 'log',
            'level': 'error',
            'message': f"Scan failed: {str(e)}",
            'phase': 'error'
        }, scan_id)

# API Routes

@app.get("/")
async def root():
    return {"message": "AKUMA Web Scanner API v2.0.0", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}

@app.get("/api/stats")
async def get_stats():
    """Get overall statistics"""
    total_scans = len(scans_db)
    active_scans = len([s for s in scans_db.values() if s['status'] == 'running'])
    
    total_vulnerabilities = 0
    critical_issues = 0
    
    for scan in scans_db.values():
        if 'vulnerabilities' in scan:
            total_vulnerabilities += len(scan['vulnerabilities'])
            critical_issues += len([v for v in scan['vulnerabilities'] if v['severity'] == 'critical'])
    
    return {
        "totalScans": total_scans,
        "activeScans": active_scans,
        "vulnerabilities": total_vulnerabilities,
        "criticalIssues": critical_issues
    }

@app.post("/api/scans")
async def create_scan(scan_request: ScanRequest, background_tasks: BackgroundTasks):
    """Create a new scan"""
    scan_id = str(uuid.uuid4())
    
    scan_data = {
        "id": scan_id,
        "target": ", ".join(scan_request.targets),
        "targets": scan_request.targets,
        "scan_type": scan_request.scan_type,
        "status": "pending",
        "progress": 0,
        "created_at": datetime.now().isoformat(),
        "config": {
            "max_depth": scan_request.max_depth,
            "threads": scan_request.threads,
            "timeout": scan_request.timeout,
            "rate_limit": scan_request.rate_limit
        },
        "vulnerabilities": [],
        "ports": []
    }
    
    scans_db[scan_id] = scan_data
    
    # Start scan in background
    background_tasks.add_task(run_scan, scan_id, scan_request.targets, scan_data['config'])
    
    return {"scan_id": scan_id, "status": "created", "message": "Scan started"}

@app.post("/api/scans/upload")
async def create_scan_from_file(
    file: UploadFile = File(...),
    scan_type: str = Form("comprehensive"),
    max_depth: int = Form(3),
    threads: int = Form(10),
    timeout: int = Form(30),
    rate_limit: int = Form(60),
    background_tasks: BackgroundTasks = None
):
    """Create scan from uploaded file"""
    content = await file.read()
    targets = [line.strip() for line in content.decode().split('\n') if line.strip()]
    
    scan_request = ScanRequest(
        targets=targets,
        scan_type=scan_type,
        max_depth=max_depth,
        threads=threads,
        timeout=timeout,
        rate_limit=rate_limit
    )
    
    return await create_scan(scan_request, background_tasks)

@app.get("/api/scans")
async def get_scans():
    """Get all scans"""
    return list(scans_db.values())

@app.get("/api/scans/{scan_id}")
async def get_scan(scan_id: str):
    """Get specific scan details"""
    if scan_id not in scans_db:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scans_db[scan_id]

@app.delete("/api/scans/{scan_id}")
async def delete_scan(scan_id: str):
    """Delete a scan"""
    if scan_id not in scans_db:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    del scans_db[scan_id]
    return {"message": "Scan deleted successfully"}

@app.get("/api/scans/{scan_id}/ports")
async def get_scan_ports(scan_id: str):
    """Get ports discovered in scan"""
    if scan_id not in scans_db:
        raise HTTPException(status_code=404, detail="Scan not found")
    
    return scans_db[scan_id].get('ports', [])

@app.get("/api/vulnerabilities")
async def get_all_vulnerabilities():
    """Get all vulnerabilities from all scans"""
    all_vulns = []
    for scan in scans_db.values():
        if 'vulnerabilities' in scan:
            for vuln in scan['vulnerabilities']:
                vuln_copy = vuln.copy()
                vuln_copy['scan_id'] = scan['id']
                vuln_copy['target'] = scan['target']
                all_vulns.append(vuln_copy)
    
    return all_vulns

@app.post("/api/reports/generate")
async def generate_report(scan_ids: List[str]):
    """Generate HTML report for selected scans"""
    if not scan_ids:
        raise HTTPException(status_code=400, detail="No scan IDs provided")
    
    report_data = {
        'scans': [],
        'total_vulnerabilities': 0,
        'generated_at': datetime.now().isoformat()
    }
    
    for scan_id in scan_ids:
        if scan_id in scans_db:
            scan = scans_db[scan_id]
            report_data['scans'].append(scan)
            if 'vulnerabilities' in scan:
                report_data['total_vulnerabilities'] += len(scan['vulnerabilities'])
    
    # Generate HTML report
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>AKUMA Scanner Report</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; background: #0a0a0a; color: #ffffff; }}
            .header {{ background: #1a1a1a; color: #00ffff; padding: 20px; border: 2px solid #00ffff; }}
            .scan-section {{ margin: 20px 0; padding: 15px; border: 1px solid #333; background: #151515; }}
            .vulnerability {{ margin: 10px 0; padding: 10px; border-left: 4px solid #ff4757; background: #1a1a1a; }}
            .critical {{ border-left-color: #ff4757; }}
            .high {{ border-left-color: #ffa502; }}
            .medium {{ border-left-color: #3742fa; }}
            .low {{ border-left-color: #2ed573; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔥 AKUMA Web Scanner Report</h1>
            <p>Generated: {report_data['generated_at']}</p>
            <p>Total Vulnerabilities: {report_data['total_vulnerabilities']}</p>
        </div>
    """
    
    for scan in report_data['scans']:
        html_content += f"""
        <div class="scan-section">
            <h2>Scan: {scan['target']}</h2>
            <p>Status: {scan['status']}</p>
            <p>Created: {scan['created_at']}</p>
        """
        
        if 'vulnerabilities' in scan and scan['vulnerabilities']:
            html_content += "<h3>Vulnerabilities:</h3>"
            for vuln in scan['vulnerabilities']:
                html_content += f"""
                <div class="vulnerability {vuln['severity']}">
                    <h4>{vuln['title']}</h4>
                    <p><strong>Severity:</strong> {vuln['severity']}</p>
                    <p><strong>URL:</strong> {vuln['url']}</p>
                    <p><strong>Description:</strong> {vuln['description']}</p>
                    {f"<p><strong>Solution:</strong> {vuln['solution']}</p>" if vuln.get('solution') else ""}
                </div>
                """
        
        html_content += "</div>"
    
    html_content += "</body></html>"
    
    return HTMLResponse(content=html_content)

@app.websocket("/ws/scan/{scan_id}")
async def websocket_endpoint(websocket: WebSocket, scan_id: str):
    """WebSocket endpoint for real-time scan updates"""
    await manager.connect(websocket, scan_id)
    try:
        while True:
            # Keep connection alive
            await asyncio.sleep(1)
    except WebSocketDisconnect:
        manager.disconnect(websocket, scan_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
