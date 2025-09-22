// اختبار بسيط للخادم
const fetch = require('node-fetch');

async function testServer() {
  try {
    console.log('🧪 اختبار الخادم...');
    
    // اختبار health endpoint
    const healthResponse = await fetch('http://localhost:5000/health');
    console.log('🏥 Health check:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ الخادم يعمل:', healthData);
    }
    
    // اختبار purchases endpoint
    const purchasesResponse = await fetch('http://localhost:5000/api/purchases');
    console.log('📋 Purchases endpoint:', purchasesResponse.status);
    
    if (purchasesResponse.ok) {
      const purchasesData = await purchasesResponse.json();
      console.log('✅ Purchases API يعمل');
    } else {
      console.log('❌ Purchases API لا يعمل');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال بالخادم:', error.message);
    console.log('💡 تأكد من تشغيل الخادم: npm run dev في مجلد server');
  }
}

testServer();
