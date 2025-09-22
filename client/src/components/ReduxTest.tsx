'use client';

import React from 'react';
import { useAppSelector } from '@/app/redux';
import { useGetHealthQuery } from '@/state/api';

const ReduxTest: React.FC = () => {
  const { isDarkMode, isSidebarCollapsed } = useAppSelector((state) => state.global);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  
  // Test API connection
  const { data: healthData, error: healthError, isLoading: healthLoading } = useGetHealthQuery();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        اختبار Redux و API
      </h2>
      
      <div className="space-y-3">
        <div>
          <strong>حالة الشريط الجانبي:</strong> {isSidebarCollapsed ? 'مطوي' : 'مفتوح'}
        </div>
        
        <div>
          <strong>الوضع المظلم:</strong> {isDarkMode ? 'مفعل' : 'معطل'}
        </div>
        
        <div>
          <strong>حالة المصادقة:</strong> {isAuthenticated ? 'مسجل دخول' : 'غير مسجل'}
        </div>
        
        {user && (
          <div>
            <strong>المستخدم:</strong> {user.username} ({user.email})
          </div>
        )}
        
        <div className="border-t pt-3">
          <h3 className="font-semibold mb-2">اختبار الاتصال بالخادم:</h3>
          <p className="text-sm text-gray-600 mb-2">
            عنوان API: {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'}
          </p>
          {healthLoading && <p>جاري التحقق من الاتصال...</p>}
          {healthError && (
            <div className="text-red-600">
              <p>❌ خطأ في الاتصال:</p>
              <pre className="text-xs bg-red-50 p-2 rounded mt-1">
                {JSON.stringify(healthError, null, 2)}
              </pre>
            </div>
          )}
          {healthData && (
            <div className="text-green-600">
              <p>✅ الاتصال ناجح!</p>
              <p>الرسالة: {healthData.message}</p>
              <p>الإصدار: {healthData.version}</p>
            </div>
          )}
          
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReduxTest;
