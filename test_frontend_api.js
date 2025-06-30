// Тест API вызовов как из фронтенда
const API_BASE = 'http://localhost:8000'\;

async function testAPI() {
    console.log('🧪 Testing Frontend API calls...\n');
    
    try {
        // Test stats  
        console.log('📊 Testing /api/stats...');
        const fetch = (await import('node-fetch')).default;
        const statsResponse = await fetch(`${API_BASE}/api/stats`);
        const stats = await statsResponse.json();
        console.log('✅ Stats:', stats);
        
        // Test scans
        console.log('\n📋 Testing /api/scans...');
        const scansResponse = await fetch(`${API_BASE}/api/scans`);
        const scans = await scansResponse.json();
        console.log(`✅ Found ${scans.length} scans`);
        
        if (scans.length > 0) {
            const firstScan = scans[0];
            console.log(`   - First scan: ${firstScan.target} (${firstScan.status})`);
        }
        
        console.log('\n🎉 All API tests passed!');
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

testAPI();
