'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import PurchaseInvoicePrint from '../../components/PurchaseInvoicePrint';
import { PurchaseInvoicePrintData, useGenerateInvoiceNumberQuery } from '../../state/apiSlices/purchasesApi';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

interface Supplier {
  id: string;
  code: string;
  name: string;
}

interface Product {
  id: string;
  code: string;
  name: string;
  unit: string;
}

interface PurchaseInvoiceItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: Product;
}

interface PurchaseInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  userId: string;
  invoiceDate: string;
  dueDate?: string;
  paymentType: string;
  paymentMethod?: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  supplier: Supplier;
  user: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  items: PurchaseInvoiceItem[];
}

interface CreatePurchaseItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface CreatePurchaseData {
  invoiceNumber: string;
  supplierId: string;
  invoiceDate: string;
  dueDate?: string;
  paymentType: 'CASH' | 'CREDIT';
  paymentMethod?: 'CASH' | 'BANK' | 'CHECK';
  notes?: string;
  items: CreatePurchaseItem[];
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printInvoiceData, setPrintInvoiceData] = useState<PurchaseInvoicePrintData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<CreatePurchaseData>({
    invoiceNumber: '',
    supplierId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentType: 'CASH',
    paymentMethod: 'CASH',
    notes: '',
    items: []
  });

  // جلب فواتير الشراء
  const fetchPurchases = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/purchases`);
      if (response.ok) {
        const result = await response.json();
        setPurchases(result.data);
      } else {
        toast.error('فشل في جلب فواتير الشراء');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  // جلب الموردين
  const fetchSuppliers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/suppliers?active=true`);
      if (response.ok) {
        const result = await response.json();
        setSuppliers(result.data);
      }
    } catch (error) {
      console.error('خطأ في جلب الموردين:', error);
    }
  };

  // جلب المنتجات
  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products?active=true`);
      if (response.ok) {
        const result = await response.json();
        setProducts(result.data);
      }
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error);
    }
  };

  // البحث
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPurchases();
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/purchases/search/${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const result = await response.json();
        setPurchases(result.data);
      }
    } catch (error) {
      toast.error('خطأ في البحث');
    }
  };

  // إنشاء فاتورة شراء
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      toast.error('يجب إضافة بند واحد على الأقل');
      return;
    }

    try {
      console.log('📤 إرسال بيانات الفاتورة:', formData);
      console.log('🌐 URL الخادم:', `${API_BASE_URL}/api/purchases`);
      
      // اختبار الاتصال بالخادم أولاً
      try {
        const healthCheck = await fetch(`${API_BASE_URL}/health`);
        console.log('🏥 فحص صحة الخادم:', healthCheck.status);
      } catch (healthError) {
        console.error('❌ الخادم غير متاح:', healthError);
        toast.error('الخادم غير متاح. تأكد من تشغيل الخادم على المنفذ 5000');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('تم إنشاء فاتورة الشراء بنجاح');
        setShowModal(false);
        resetForm();
        fetchPurchases();
      } else {
        console.error('❌ خطأ HTTP:', response.status, response.statusText);
        
        let error;
        try {
          error = await response.json();
          console.error('❌ خطأ من الخادم:', error);
        } catch (parseError) {
          console.error('❌ فشل في تحليل استجابة الخادم:', parseError);
          error = { message: `خطأ HTTP ${response.status}: ${response.statusText}` };
        }
        
        toast.error(error.message || `خطأ HTTP ${response.status}: فشل في إنشاء الفاتورة`);
        
        // إظهار تفاصيل الأخطاء إذا كانت متاحة
        if (error.errors && Array.isArray(error.errors)) {
          error.errors.forEach((err: any) => {
            toast.error(`${err.path}: ${err.msg}`);
          });
        }
      }
    } catch (error) {
      console.error('❌ خطأ في الاتصال:', error);
      toast.error('خطأ في الاتصال بالخادم');
    }
  };

  // حذف فاتورة
  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/purchases/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('تم حذف الفاتورة بنجاح');
        fetchPurchases();
      } else {
        const error = await response.json();
        toast.error(error.message || 'فشل في حذف الفاتورة');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم');
    }
  };

  // طباعة فاتورة
  const handlePrint = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/purchases/${id}/print`);
      if (response.ok) {
        const result = await response.json();
        setPrintInvoiceData(result.data);
        setShowPrintModal(true);
      } else {
        toast.error('فشل في جلب بيانات الطباعة');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال بالخادم');
    }
  };

  // إضافة بند جديد
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  // حذف بند
  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // تحديث بند
  const updateItem = (index: number, field: keyof CreatePurchaseItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  // حساب المجموع الكلي
  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  // إعادة تعيين النموذج
  const resetForm = () => {
    setFormData({
      invoiceNumber: '',
      supplierId: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      dueDate: '',
      paymentType: 'CASH',
      paymentMethod: 'CASH',
      notes: '',
      items: []
    });
  };

  // توليد رقم فاتورة جديد
  const generateNewInvoiceNumber = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/purchases/generate-invoice-number`);
      if (response.ok) {
        const result = await response.json();
        return result.data.invoiceNumber;
      }
    } catch (error) {
      console.error('خطأ في توليد رقم الفاتورة:', error);
    }
    return '';
  };

  // فتح نموذج إنشاء جديد
  const handleCreate = async () => {
    const newInvoiceNumber = await generateNewInvoiceNumber();
    resetForm();
    setFormData(prev => ({
      ...prev,
      invoiceNumber: newInvoiceNumber
    }));
    setShowModal(true);
  };

  // تنسيق التاريخ بالأرقام العربية (وليس الهندية)
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US');
  };

  // ترجمة حالة الفاتورة
  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'PENDING': 'معلقة',
      'PARTIAL': 'مدفوعة جزئياً',
      'PAID': 'مدفوعة بالكامل',
      'CANCELLED': 'ملغية'
    };
    return statusMap[status] || status;
  };

  // تنسيق العملة بالأرقام العربية والفاصلة الصحيحة
  const formatCurrency = (amount: any) => {
    const number = Number(amount || 0);
    // تنسيق الرقم ثم استبدال النقطة بالفاصلة
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
    
    // تحويل الأرقام الإنجليزية إلى العربية (وليس الهندية) واستبدال النقطة بالفاصلة
    const arabicNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    return formatted
      .replace('.', '،'); // استبدال النقطة بالفاصلة العربية فقط
  };

  // ترجمة طريقة الدفع
  const getPaymentMethodText = (method?: string) => {
    const methodMap: { [key: string]: string } = {
      'CASH': 'نقدي',
      'BANK': 'مصرفي',
      'CHECK': 'شيك'
    };
    return method ? methodMap[method] || method : '-';
  };

  useEffect(() => {
    fetchPurchases();
    fetchSuppliers();
    fetchProducts();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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
        <h1 className="text-3xl font-bold text-gray-800">إدارة المشتريات</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          إضافة فاتورة شراء
        </button>
      </div>

      {/* شريط البحث */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="البحث في فواتير الشراء..."
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

      {/* جدول فواتير الشراء */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الفاتورة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المورد
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  تاريخ الفاتورة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ الكلي
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المدفوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المتبقي
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
              {purchases.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {purchase.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div className="font-medium">{purchase.supplier.name}</div>
                      <div className="text-xs text-gray-500">{purchase.supplier.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(purchase.invoiceDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-medium">{formatCurrency(purchase.totalAmount)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="text-green-600 font-medium">{formatCurrency(purchase.paidAmount)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className={`font-medium ${Number(purchase.remainingAmount) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(purchase.remainingAmount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      purchase.status === 'PAID'
                        ? 'bg-green-100 text-green-800'
                        : purchase.status === 'PARTIAL'
                        ? 'bg-yellow-100 text-yellow-800'
                        : purchase.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusText(purchase.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePrint(purchase.id)}
                        className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition-colors text-xs flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        طباعة
                      </button>
                      <button
                        onClick={() => handleDelete(purchase.id)}
                        className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors text-xs"
                        disabled={purchase.status !== 'PENDING'}
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {purchases.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-lg mt-4">لا توجد فواتير شراء</p>
          </div>
        )}
      </div>

      {/* نموذج إضافة فاتورة شراء */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-5 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                إضافة فاتورة شراء جديدة
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* بيانات الفاتورة الأساسية */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">بيانات الفاتورة</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        رقم الفاتورة *
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="invoiceNumber"
                          required
                          value={formData.invoiceNumber}
                          onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="أدخل رقم الفاتورة"
                          readOnly
                        />
                        <button
                          type="button"
                          onClick={async () => {
                            const newNumber = await generateNewInvoiceNumber();
                            setFormData(prev => ({ ...prev, invoiceNumber: newNumber }));
                          }}
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm flex items-center gap-1"
                          title="توليد رقم جديد"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          توليد
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700 mb-1">
                        المورد *
                      </label>
                      <select
                        id="supplierId"
                        required
                        value={formData.supplierId}
                        onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">اختر المورد</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier.id} value={supplier.id}>
                            {supplier.name} ({supplier.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="invoiceDate" className="block text-sm font-medium text-gray-700 mb-1">
                        تاريخ الفاتورة *
                      </label>
                      <input
                        type="date"
                        id="invoiceDate"
                        required
                        value={formData.invoiceDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label htmlFor="paymentType" className="block text-sm font-medium text-gray-700 mb-1">
                        نوع الدفع *
                      </label>
                      <select
                        id="paymentType"
                        required
                        value={formData.paymentType}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentType: e.target.value as 'CASH' | 'CREDIT' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="CASH">نقدي</option>
                        <option value="CREDIT">آجل</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                        طريقة الدفع
                      </label>
                      <select
                        id="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData(prev => ({ ...prev, paymentMethod: e.target.value as 'CASH' | 'BANK' | 'CHECK' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="CASH">نقدي</option>
                        <option value="BANK">مصرفي</option>
                        <option value="CHECK">شيك</option>
                      </select>
                    </div>

                    {formData.paymentType === 'CREDIT' && (
                      <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                          تاريخ الاستحقاق
                        </label>
                        <input
                          type="date"
                          id="dueDate"
                          value={formData.dueDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                      ملاحظات
                    </label>
                    <textarea
                      id="notes"
                      rows={2}
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل ملاحظات (اختياري)"
                    />
                  </div>
                </div>

                {/* بنود الفاتورة */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-gray-900">بنود الفاتورة</h4>
                    <button
                      type="button"
                      onClick={addItem}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                    >
                      إضافة بند
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-gray-50 p-3 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            المنتج *
                          </label>
                          <select
                            required
                            value={item.productId}
                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">اختر المنتج</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} ({product.code})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            الكمية *
                          </label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            سعر الوحدة *
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            المجموع
                          </label>
                          <input
                            type="number"
                            readOnly
                            value={(item.quantity * item.unitPrice).toFixed(2)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                          />
                        </div>

                        <div>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md transition-colors"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {formData.items.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      لم يتم إضافة أي بنود بعد
                    </div>
                  )}
                </div>

                {/* المجموع الكلي */}
                {formData.items.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-right">
                      <span className="text-lg font-bold text-blue-800">
                        المجموع الكلي: {calculateTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={formData.items.length === 0}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-md transition-colors"
                  >
                    إنشاء الفاتورة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
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

      {/* مكون الطباعة */}
      {showPrintModal && printInvoiceData && (
        <PurchaseInvoicePrint
          invoice={printInvoiceData}
          onClose={() => {
            setShowPrintModal(false);
            setPrintInvoiceData(null);
          }}
        />
      )}
    </div>
  );
}

