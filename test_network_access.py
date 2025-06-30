#!/usr/bin/env python3
"""
Тестовый скрипт для проверки сетевого доступа к AKUMA Scanner
"""

import requests
import json
import sys

def test_network_access():
    """Тестирование доступа с внешних IP"""
    
    # IP адрес сервера в сети
    server_ip = "192.168.1.24"
    
    print(f"🌐 Testing network access to AKUMA Scanner on {server_ip}")
    print("=" * 60)
    
    # Тест фронтенда
    try:
        response = requests.get(f"http://{server_ip}:3000", timeout=5)
        if response.status_code == 200 and "AKUMA" in response.text:
            print(f"✅ Frontend accessible on http://{server_ip}:3000")
        else:
            print(f"❌ Frontend issue: {response.status_code}")
    except Exception as e:
        print(f"❌ Frontend error: {e}")
    
    # Тест бэкенда API
    try:
        response = requests.get(f"http://{server_ip}:8001/api/stats", timeout=5)
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Backend API accessible on http://{server_ip}:8001")
            print(f"   Stats: {stats}")
        else:
            print(f"❌ Backend API issue: {response.status_code}")
    except Exception as e:
        print(f"❌ Backend API error: {e}")
    
    # Тест создания скана
    try:
        scan_data = {
            "target": "httpbin.org",
            "scan_type": "basic"
        }
        
        response = requests.post(
            f"http://{server_ip}:8001/api/scans", 
            json=scan_data,
            timeout=10
        )
        
        if response.status_code == 200:
            scan = response.json()
            print(f"✅ Scan creation works: {scan['id'][:8]}...")
        else:
            print(f"⚠️ Scan creation issue: {response.status_code}")
            print(f"   Response: {response.text}")
            
    except Exception as e:
        print(f"❌ Scan creation error: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 Access URLs for external machines:")
    print(f"📊 Dashboard: http://{server_ip}:3000/dashboard")
    print(f"🎯 New Scan: http://{server_ip}:3000/new-scan")
    print(f"🔍 API Docs: http://{server_ip}:8001/docs")
    
    # Тест CORS
    try:
        response = requests.options(f"http://{server_ip}:8001/api/stats")
        cors_headers = response.headers.get('Access-Control-Allow-Origin', 'Not set')
        print(f"🔒 CORS Headers: {cors_headers}")
    except Exception as e:
        print(f"⚠️ CORS test error: {e}")

if __name__ == "__main__":
    test_network_access()
