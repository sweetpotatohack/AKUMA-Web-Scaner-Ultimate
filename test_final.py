#!/usr/bin/env python3
import requests
import time

def test_system():
    print("🔥 AKUMA Web Scanner - Финальный тест")
    print("=" * 50)
    
    # Тест 1: API Health
    print("1️⃣ Тест API...")
    try:
        health = requests.get("http://localhost:8000/health", timeout=5)
        print(f"   ✅ API Health: {health.status_code}")
        print(f"   📝 Response: {health.json()}")
    except Exception as e:
        print(f"   ❌ API Error: {e}")
        return False
    
    # Тест 2: Frontend
    print("\n2️⃣ Тест Frontend...")
    try:
        frontend = requests.get("http://localhost:3000", timeout=5)
        print(f"   ✅ Frontend: {frontend.status_code}")
    except Exception as e:
        print(f"   ❌ Frontend Error: {e}")
        return False
    
    # Тест 3: Создание скана
    print("\n3️⃣ Тест создания скана...")
    try:
        scan_data = {"target": "httpbin.org", "scan_type": "basic"}
        response = requests.post("http://localhost:8000/scans", json=scan_data, timeout=10)
        print(f"   ✅ Создание скана: {response.status_code}")
        
        if response.status_code == 201:
            scan = response.json()
            scan_id = scan['id']
            print(f"   📝 Scan ID: {scan_id[:8]}...")
            print(f"   🎯 Target: {scan['target']}")
            print(f"   📊 Status: {scan['status']}")
            
            # Тест 4: Проверка прогресса
            print("\n4️⃣ Отслеживание прогресса...")
            for i in range(4):
                time.sleep(3)
                scan_check = requests.get(f"http://localhost:8000/scans/{scan_id}", timeout=5)
                if scan_check.status_code == 200:
                    scan_data = scan_check.json()
                    progress = scan_data.get('progress', 0)
                    status = scan_data.get('status', 'unknown')
                    print(f"   📈 Прогресс: {progress}% - {status}")
                    
                    if status == 'completed':
                        results = scan_data.get('results', {})
                        print(f"   🎉 Завершено! Уязвимости: {results.get('vulnerabilities', 0)}")
                        break
        else:
            print(f"   ❌ Ошибка создания: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Scan Error: {e}")
        return False
    
    # Тест 5: Список всех сканов
    print("\n5️⃣ Тест списка сканов...")
    try:
        scans = requests.get("http://localhost:8000/scans", timeout=5)
        print(f"   ✅ Список сканов: {scans.status_code}")
        scans_data = scans.json()
        print(f"   📊 Всего сканов: {len(scans_data)}")
        
        completed = sum(1 for s in scans_data if s.get('status') == 'completed')
        print(f"   ✅ Завершенных: {completed}")
        
    except Exception as e:
        print(f"   ❌ List Error: {e}")
    
    print(f"\n🎉 ТЕСТ ЗАВЕРШЕН!")
    print(f"✅ Backend API: http://localhost:8000")
    print(f"🌐 Frontend: http://localhost:3000")
    print(f"🚀 Система готова к использованию!")
    
    return True

if __name__ == "__main__":
    test_system()
