'use client';

import React, { useState, useEffect } from 'react';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

const ServerConnectionTest: React.FC = () => {
  const [serverStatus, setServerStatus] = useState<string>('جاري الفحص...');
  const [serverData, setServerData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testDirectConnection = async () => {
    setServerStatus('جاري اختبار الاتصال المباشر...');
    setError(null);
    
    try {
      // اختبار الاتصال المباشر بالسيرفر
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setServerData(data);
      setServerStatus('✅ الاتصال ناجح!');
    } catch (err: any) {
      console.error('خطأ في الاتصال:', err);
      setError(err.message);
      setServerStatus('❌ فشل الاتصال');
    }
  };

  const testApiEndpoint = async () => {
    setServerStatus('جاري اختبار نقطة نهاية API...');
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('بيانات الاختبار:', data);
      setServerData(data);
      setServerStatus('✅ API يعمل بنجاح!');
    } catch (err: any) {
      console.error('خطأ في API:', err);
      setError(err.message);
      setServerStatus('❌ فشل في API');
    }
  };

  const testCategoriesEndpoint = async () => {
    setServerStatus('جاري اختبار endpoint الفئات...');
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('بيانات الفئات:', data);
      setServerData(data);
      setServerStatus('✅ الفئات تعمل بنجاح!');
    } catch (err: any) {
      console.error('خطأ في الفئات:', err);
      setError(err.message);
      setServerStatus('❌ فشل في الفئات');
    }
  };

  useEffect(() => {
    testDirectConnection();
  }, []);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white text-center">
        اختبار الاتصال بالسيرفر
      </h2>
      
      <div className="space-y-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">حالة الاتصال:</h3>
          <p className={`text-lg ${serverStatus.includes('✅') ? 'text-green-600' : serverStatus.includes('❌') ? 'text-red-600' : 'text-yellow-600'}`}>
            {serverStatus}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2">تفاصيل الخطأ:</h3>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {serverData && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">بيانات السيرفر:</h3>
            <pre className="text-sm text-green-700 whitespace-pre-wrap">
              {JSON.stringify(serverData, null, 2)}
            </pre>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={testDirectConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            اختبار الاتصال
          </button>
          
          <button 
            onClick={testApiEndpoint}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            اختبار API
          </button>

          <button 
            onClick={testCategoriesEndpoint}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
          >
            اختبار الفئات
          </button>
        </div>

        <div className="p-4 bg-gray-50 border rounded-lg">
          <h3 className="font-semibold mb-2">معلومات التكوين:</h3>
          <ul className="text-sm space-y-1">
            <li><strong>عنوان السيرفر:</strong> http://localhost:5000</li>
            <li><strong>عنوان العميل:</strong> http://localhost:3000</li>
            <li><strong>متغير البيئة:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || 'غير محدد'}</li>
          </ul>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">✅ تم إصلاح الربط!</h3>
          <p className="text-blue-700 text-sm">
            تم إصلاح مشكلة الربط بين العميل والسيرفر. الآن يمكنك:
          </p>
          <ul className="text-blue-700 text-sm mt-2 list-disc list-inside space-y-1">
            <li>زيارة صفحة المنتجات: <a href="/products" className="underline hover:text-blue-900">/products</a></li>
            <li>زيارة صفحة الفئات: <a href="/categories" className="underline hover:text-blue-900">/categories</a></li>
            <li>جميع استدعاءات API تستخدم العنوان الصحيح</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ServerConnectionTest;
