'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface CarType {
  id: string;
  code: string;
  name: string;
}

interface SparePart {
  id: string;
  code: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: string;
  carModel: string;
  carYear?: string;
  originalPartNumber?: string;
  unitPrice?: number | string | null; // سعر الوحدة الأساسي - قد يأتي كـ string من الخادم
  unit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category: CarType;
  inventoryItems: Array<{
    id: string;
    quantity: number;
    reservedQty: number;
    lastCostPrice: number;
    averageCost: number;
    lastUpdated: string;
  }>;
}

interface CreateSparePartData {
  code: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: string;
  carModel: string;
  carYear?: string;
  originalPartNumber?: string;
  unitPrice?: number; // سعر الوحدة الأساسي
  unit: string;
  initialQuantity?: number;
}

export default function SparePartsPage() {
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<CreateSparePartData>({
    code: '',
    barcode: '',
    name: '',
    description: '',
    categoryId: '',
    carModel: '',
    carYear: '',
    originalPartNumber: '',
    unitPrice: 0,
    unit: 'قطعة',
    initialQuantity: 0
  });

  // جلب قطع الغيار
  const fetchSpareParts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`);
      if (response.ok) {
        const result = await response.json();
        // معالجة البيانات للتأكد من تحويل الأسعار إلى أرقام
        const processedData = (result.data || []).map((part: any) => ({
          ...part,
          unitPrice: part.unitPrice ? Number(part.unitPrice) : null
        }));
        setSpareParts(processedData);
      } else {
        toast.error('فشل في جلب قطع الغيار');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // جلب أنواع السيارات
  const fetchCarTypes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories?active=true`);
      if (response.ok) {
        const result = await response.json();
        setCarTypes(result.data || []);
      }
    } catch (error) {
      console.error('خطأ في جلب أنواع السيارات:', error);
    }
  };

  // إضافة قطعة غيار جديدة
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('تم إضافة قطعة الغيار بنجاح');
        setShowModal(false);
        setFormData({
          code: '',
          barcode: '',
          name: '',
          description: '',
          categoryId: '',
          carModel: '',
          carYear: '',
          originalPartNumber: '',
          unitPrice: 0,
          unit: 'قطعة',
          initialQuantity: 0
        });
        fetchSpareParts();
      } else {
        const error = await response.json();
        toast.error(error.message || 'فشل في إضافة قطعة الغيار');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم');
    }
  };

  useEffect(() => {
    fetchSpareParts();
    fetchCarTypes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* العنوان والأزرار */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">🔧 إدارة قطع غيار السيارات</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة قطعة غيار جديدة
        </button>
      </div>

      {/* شريط البحث */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="البحث في قطع الغيار (الاسم، الكود، رقم القطعة الأصلي)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* إحصائيات سريعة */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="mr-4">
              <div className="text-sm font-medium text-gray-500">إجمالي القطع</div>
              <div className="text-2xl font-bold text-gray-900">{spareParts.length}</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mr-4">
              <div className="text-sm font-medium text-gray-500">متوفر</div>
              <div className="text-2xl font-bold text-gray-900">{spareParts.filter(p => p.isActive).length}</div>
            </div>
          </div>
        </div>


        <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="mr-4">
              <div className="text-sm font-medium text-gray-500">أنواع السيارات</div>
              <div className="text-2xl font-bold text-gray-900">{carTypes.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* جدول قطع الغيار */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الكود
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                اسم القطعة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نوع السيارة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                موديل السيارة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المخزون
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                سعر الوحدة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                سعر بيع المحل
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {spareParts.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-500 text-lg">لا توجد قطع غيار</p>
                    <p className="text-gray-400 text-sm mt-1">ابدأ بإضافة قطع الغيار الأولى</p>
                  </div>
                </td>
              </tr>
            ) : (
              spareParts.map((part) => (
                <tr key={part.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {part.code}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{part.name}</div>
                      {part.originalPartNumber && (
                        <div className="text-xs text-gray-500">رقم أصلي: {part.originalPartNumber}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {part.category?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {part.carModel} {part.carYear && `(${part.carYear})`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                      {part.inventoryItems?.[0]?.quantity || 0} {part.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {part.unitPrice && !isNaN(Number(part.unitPrice)) && Number(part.unitPrice) > 0 ? (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        {Number(part.unitPrice).toFixed(2)} ج.م
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">غير محدد</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="text-gray-400 text-xs">سيتم إدارته لاحقاً</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      part.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {part.isActive ? 'متوفر' : 'غير متوفر'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors">
                        تعديل
                      </button>
                      <button className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors">
                        مخزون
                      </button>
                      <button className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors">
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* نموذج إضافة قطعة غيار */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                إضافة قطعة غيار جديدة
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* الكود */}
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                      كود القطعة *
                    </label>
                    <input
                      type="text"
                      id="code"
                      required
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثل: BRK001"
                    />
                  </div>

                  {/* الباركود */}
                  <div>
                    <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-1">
                      الباركود
                    </label>
                    <input
                      type="text"
                      id="barcode"
                      value={formData.barcode}
                      onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1234567890123"
                    />
                  </div>
                </div>

                {/* اسم القطعة */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    اسم القطعة *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="مثل: فرامل أمامية"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* نوع السيارة */}
                  <div>
                    <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-1">
                      نوع السيارة *
                    </label>
                    <select
                      id="categoryId"
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">اختر نوع السيارة</option>
                      {carTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* موديل السيارة */}
                  <div>
                    <label htmlFor="carModel" className="block text-sm font-medium text-gray-700 mb-1">
                      موديل السيارة *
                    </label>
                    <input
                      type="text"
                      id="carModel"
                      required
                      value={formData.carModel}
                      onChange={(e) => setFormData(prev => ({ ...prev, carModel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="مثل: كامري، كورولا"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* سنة السيارة */}
                  <div>
                    <label htmlFor="carYear" className="block text-sm font-medium text-gray-700 mb-1">
                      سنة السيارة
                    </label>
                    <input
                      type="text"
                      id="carYear"
                      value={formData.carYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, carYear: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="2020-2024"
                    />
                  </div>

                  {/* الوحدة */}
                  <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                      الوحدة *
                    </label>
                    <select
                      id="unit"
                      required
                      value={formData.unit}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="قطعة">قطعة</option>
                      <option value="زوج">زوج</option>
                      <option value="طقم">طقم</option>
                      <option value="لتر">لتر</option>
                      <option value="كيلو">كيلو</option>
                    </select>
                  </div>
                </div>

                {/* رقم القطعة الأصلي */}
                <div>
                  <label htmlFor="originalPartNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    رقم القطعة الأصلي
                  </label>
                  <input
                    type="text"
                    id="originalPartNumber"
                    value={formData.originalPartNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPartNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="رقم القطعة من الشركة المصنعة"
                  />
                </div>

                {/* الوصف */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="وصف تفصيلي للقطعة"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* سعر الوحدة */}
                  <div>
                    <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      سعر الوحدة (ج.م)
                    </label>
                    <input
                      type="number"
                      id="unitPrice"
                      min="0"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, unitPrice: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="سعر الوحدة الأساسي"
                    />
                  </div>

                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* الكمية الأولية */}
                  <div>
                    <label htmlFor="initialQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                      الكمية الأولية
                    </label>
                    <input
                      type="number"
                      id="initialQuantity"
                      min="0"
                      value={formData.initialQuantity}
                      onChange={(e) => setFormData(prev => ({ ...prev, initialQuantity: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    إضافة قطعة الغيار
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({
                        code: '',
                        barcode: '',
                        name: '',
                        description: '',
                        categoryId: '',
                        carModel: '',
                        carYear: '',
                        originalPartNumber: '',
                        unitPrice: 0,
                        unit: 'قطعة',
                        initialQuantity: 0
                      });
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
