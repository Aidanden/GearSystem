'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  useGetSaleInvoicesQuery,
  useDeleteSaleInvoiceMutation,
  useGetSalesStatsQuery,
  SaleInvoice,
  PaymentMethod,
  SaleType
} from '@/state/apiSlices/salesApi';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  Filter,
  Download,
  Printer,
  Package
} from 'lucide-react';
import CreateSaleInvoiceModal from './components/CreateSaleInvoiceModal';

const SalesPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<SaleInvoice | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<PaymentMethod | 'ALL'>('ALL');
  const [filterSaleType, setFilterSaleType] = useState<SaleType | 'ALL'>('ALL');

  // API Hooks
  const { data: invoicesResponse, isLoading, error, refetch } = useGetSaleInvoicesQuery();
  const { data: statsResponse } = useGetSalesStatsQuery();
  const [deleteInvoice] = useDeleteSaleInvoiceMutation();

  const invoices = invoicesResponse?.data || [];
  const stats = statsResponse?.data;

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.store?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPaymentMethod = filterPaymentMethod === 'ALL' || invoice.paymentMethod === filterPaymentMethod;
    const matchesSaleType = filterSaleType === 'ALL' || invoice.saleType === filterSaleType;
    
    return matchesSearch && matchesPaymentMethod && matchesSaleType;
  });

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
      try {
        await deleteInvoice(id).unwrap();
        toast.success('تم حذف الفاتورة بنجاح');
        refetch();
      } catch (error) {
        toast.error('خطأ في حذف الفاتورة');
      }
    }
  };

  // Handle edit
  const handleEdit = (invoice: SaleInvoice) => {
    setEditingInvoice(invoice);
    setShowCreateModal(true);
  };

  // Get payment method label
  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH: return 'نقدي';
      case PaymentMethod.BANK: return 'مصرفي';
      case PaymentMethod.CHECK: return 'شيك';
      default: return 'غير محدد';
    }
  };

  // Get sale type label
  const getSaleTypeLabel = (type: SaleType) => {
    switch (type) {
      case SaleType.REGULAR: return 'عادي';
      case SaleType.BRANCH: return 'محل تابع';
      default: return 'غير محدد';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold mb-2">خطأ في تحميل البيانات</p>
          <button 
            onClick={() => refetch()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">المبيعات</h1>
          <p className="text-gray-600 mt-1">إدارة فواتير البيع والمبيعات</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            فاتورة جديدة
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المبيعات</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalSales}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalRevenue.toFixed(2)} د.ل
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط قيمة الفاتورة</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.averageOrderValue.toFixed(2)} د.ل
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">فواتير اليوم</p>
                <p className="text-2xl font-bold text-orange-600">
                  {invoices.filter(inv => 
                    new Date(inv.createdAt).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث في الفواتير..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterPaymentMethod}
            onChange={(e) => setFilterPaymentMethod(e.target.value as PaymentMethod | 'ALL')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">جميع طرق الدفع</option>
            <option value={PaymentMethod.CASH}>نقدي</option>
            <option value={PaymentMethod.BANK}>مصرفي</option>
            <option value={PaymentMethod.CHECK}>شيك</option>
          </select>

          <select
            value={filterSaleType}
            onChange={(e) => setFilterSaleType(e.target.value as SaleType | 'ALL')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">جميع أنواع البيع</option>
            <option value={SaleType.REGULAR}>بيع عادي</option>
            <option value={SaleType.BRANCH}>بيع للمحلات</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  رقم الفاتورة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل / المحل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نوع البيع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  طريقة الدفع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المبلغ الإجمالي
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الصافي
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.invoiceNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {invoice.saleType === SaleType.BRANCH && invoice.store ? (
                        <div>
                          <div className="font-medium">{invoice.store.name}</div>
                          <div className="text-gray-500">{invoice.store.code}</div>
                        </div>
                      ) : invoice.customer ? (
                        <div>
                          <div className="font-medium">{invoice.customer.name}</div>
                          <div className="text-gray-500">{invoice.customer.code}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">بيع نقدي</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(invoice.invoiceDate).toLocaleDateString('ar-SA')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      invoice.saleType === SaleType.REGULAR 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {getSaleTypeLabel(invoice.saleType)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      invoice.paymentMethod === PaymentMethod.CASH 
                        ? 'bg-green-100 text-green-800' 
                        : invoice.paymentMethod === PaymentMethod.BANK
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getPaymentMethodLabel(invoice.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {invoice.totalAmount.toFixed(2)} د.ل
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">
                      {invoice.netAmount.toFixed(2)} د.ل
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(invoice)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(invoice.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد فواتير</h3>
            <p className="mt-1 text-sm text-gray-500">ابدأ بإنشاء فاتورة بيع جديدة</p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                فاتورة جديدة
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <CreateSaleInvoiceModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingInvoice(null);
        }}
        editingInvoice={editingInvoice}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default SalesPage;
