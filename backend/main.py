from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uuid
import datetime
import os
import shutil

app = FastAPI()

# CORS настройка
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# Данные сканов
scans_db = {}

# Статистика и отчеты
stats_db = {}

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "AKUMA FastAPI"}

@app.post("/scans")
async def create_scan(target: str):
    scan_id = str(uuid.uuid4())
    scan_data = {
        "id": scan_id,
        "target": target,
        "status": "running",
        "progress": 0,
        "created_at": datetime.datetime.now().isoformat(),
        "results": {}
    }
    scans_db[scan_id] = scan_data
    stats_db[target] = scan_data  # Обновляем статистику
    return scan_data

@app.post("/upload")
async def upload_targets(file: UploadFile = File(...)):
    try:
        content = await file.read()
        targets = content.decode().splitlines()
        for target in targets:
            await create_scan(target=target)
        return {"message": f"Uploaded {len(targets)} targets."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/scans")
async def get_scans():
    return list(scans_db.values())

@app.get("/scan/{scan_id}/details")
async def get_scan_details(scan_id: str):
    if scan_id in scans_db:
        return scans_db[scan_id]
    raise HTTPException(status_code=404, detail="Scan not found")

@app.get("/reports/{scan_id}")
async def generate_report(scan_id: str):
    if scan_id not in scans_db:
        raise HTTPException(status_code=404, detail="Scan not found")
    report_file = f"/reports/report_{scan_id}.html"
    with open(report_file, 'w') as file:
        file.write(f"<h1>Report for Scan ID: {scan_id}</h1>")
        file.write(f"<p>Status: {scans_db[scan_id]['status']}</p>")
        file.write(f"<p>Target: {scans_db[scan_id]['target']}</p>")
        # Добавить сюда больше деталей отчета
    return FileResponse(report_file, media_type='text/html')

@app.get("/dashboard")
async def dashboard():
    # Заглушка для информации на дашборде
    dashboard_info = {
        "total_scans": len(scans_db),
        "completed_scans": len([s for s in scans_db.values() if s['status'] == 'completed']),
        "active_scans": len([s for s in scans_db.values() if s['status'] != 'completed'])
    }
    return dashboard_info
