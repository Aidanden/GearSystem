'use client';

export default function SparePartsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          🔧 إدارة قطع غيار السيارات
        </h1>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            ✅ تم التحويل بنجاح!
          </h2>
          <p className="text-green-700">
            تم تحويل شاشة المنتجات إلى شاشة قطع الغيار المتخصصة
          </p>
          <div className="mt-4 text-sm text-green-600">
            <p>الميزات المتاحة:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>إدارة قطع الغيار حسب نوع السيارة</li>
              <li>ربط القطع بموديلات السيارات</li>
              <li>أرقام القطع الأصلية</li>
              <li>معلومات الماركات والموردين</li>
              <li>تتبع المخزون والكميات</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
