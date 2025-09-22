'use client';

import React, { useState } from 'react';
import { 
  useGetCustomersQuery, 
  useCreateCustomerMutation, 
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
  useToggleCustomerStatusMutation,
  Customer,
  CreateCustomerData,
  UpdateCustomerData,
  CustomerType
} from '@/state/apiSlices/customersApi';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Power,
  User,
  Building,
  Wrench,
  ShoppingCart,
  Store,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';

const CustomersPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<CustomerType | 'ALL'>('ALL');

  // API Hooks
  const { data: customersResponse, isLoading, error, refetch } = useGetCustomersQuery();
  const [createCustomer] = useCreateCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();
  const [deleteCustomer] = useDeleteCustomerMutation();
  const [toggleStatus] = useToggleCustomerStatusMutation();

  const customers = customersResponse?.data || [];

  // Form state
  const [formData, setFormData] = useState<CreateCustomerData>({
    name: '',
    code: '',
    phone: '',
    email: '',
    address: '',
    customerType: CustomerType.INDIVIDUAL,
    notes: '',
    isActive: true
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      phone: '',
      email: '',
      address: '',
      customerType: CustomerType.INDIVIDUAL,
      notes: '',
      isActive: true
    });
    setEditingCustomer(null);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || customer.customerType === filterType;
    
    return matchesSearch && matchesType;
  });

  // Handle create/update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCustomer) {
        await updateCustomer({
          id: editingCustomer.id,
          data: formData as UpdateCustomerData
        }).unwrap();
        toast.success('تم تحديث العميل بنجاح');
      } else {
        const dataToSend: CreateCustomerData = {
          name: formData.name.trim()
        };

        if (formData.code && formData.code.trim()) dataToSend.code = formData.code.trim();
        if (formData.phone && formData.phone.trim()) dataToSend.phone = formData.phone.trim();
        if (formData.email && formData.email.trim()) dataToSend.email = formData.email.trim();
        if (formData.address && formData.address.trim()) dataToSend.address = formData.address.trim();
        if (formData.customerType) dataToSend.customerType = formData.customerType;
        if (formData.notes && formData.notes.trim()) dataToSend.notes = formData.notes.trim();
        if (typeof formData.isActive === 'boolean') dataToSend.isActive = formData.isActive;

        await createCustomer(dataToSend).unwrap();
        toast.success('تم إنشاء العميل بنجاح');
      }
      
      setShowModal(false);
      resetForm();
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'حدث خطأ أثناء حفظ العميل');
    }
  };

  // Handle edit
  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      code: customer.code,
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
      customerType: customer.customerType,
      notes: customer.notes || '',
      isActive: customer.isActive
    });
    setEditingCustomer(customer);
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل؟')) {
      try {
        await deleteCustomer(id).unwrap();
        toast.success('تم حذف العميل بنجاح');
        refetch();
      } catch (error: any) {
        toast.error(error?.data?.message || 'حدث خطأ أثناء حذف العميل');
      }
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: string) => {
    try {
      await toggleStatus(id).unwrap();
      toast.success('تم تحديث حالة العميل بنجاح');
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || 'حدث خطأ أثناء تحديث حالة العميل');
    }
  };

  // Get customer type icon
  const getCustomerTypeIcon = (type: CustomerType) => {
    switch (type) {
      case CustomerType.INDIVIDUAL: return <User className="w-4 h-4" />;
      case CustomerType.COMPANY: return <Building className="w-4 h-4" />;
      case CustomerType.WORKSHOP: return <Wrench className="w-4 h-4" />;
      case CustomerType.RETAILER: return <ShoppingCart className="w-4 h-4" />;
      case CustomerType.STORE: return <Store className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  // Get customer type label
  const getCustomerTypeLabel = (type: CustomerType) => {
    switch (type) {
      case CustomerType.INDIVIDUAL: return 'فردي';
      case CustomerType.COMPANY: return 'شركة';
      case CustomerType.WORKSHOP: return 'ورشة';
      case CustomerType.RETAILER: return 'تاجر تجزئة';
      case CustomerType.STORE: return 'محل';
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
          <h2 className="text-2xl font-bold mb-2">خطأ في تحميل البيانات</h2>
          <p>حدث خطأ أثناء تحميل بيانات العملاء</p>
          <button 
            onClick={() => refetch()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">إدارة العملاء</h1>
          <p className="text-gray-600 mt-1">إدارة بيانات العملاء والمشترين</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة عميل جديد
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">إجمالي العملاء</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <User className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">العملاء النشطين</p>
              <p className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.isActive).length}
              </p>
            </div>
            <Power className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الشركات</p>
              <p className="text-2xl font-bold text-purple-600">
                {customers.filter(c => c.customerType === CustomerType.COMPANY).length}
              </p>
            </div>
            <Building className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">المحلات</p>
              <p className="text-2xl font-bold text-orange-600">
                {customers.filter(c => c.customerType === CustomerType.STORE).length}
              </p>
            </div>
            <Store className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-lg shadow border mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث في العملاء..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as CustomerType | 'ALL')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">جميع الأنواع</option>
            <option value={CustomerType.INDIVIDUAL}>فردي</option>
            <option value={CustomerType.COMPANY}>شركة</option>
            <option value={CustomerType.WORKSHOP}>ورشة</option>
            <option value={CustomerType.RETAILER}>تاجر تجزئة</option>
            <option value={CustomerType.STORE}>محل</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  معلومات الاتصال
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الرصيد
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
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">كود: {customer.code}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getCustomerTypeIcon(customer.customerType)}
                      <span className="text-sm text-gray-900">
                        {getCustomerTypeLabel(customer.customerType)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {customer.phone && (
                        <div className="flex items-center gap-1 mb-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      )}
                      {customer.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className={`font-medium ${(Number(customer.currentBalance) || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {(Number(customer.currentBalance) || 0).toFixed(2)} د.ل
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      customer.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {customer.isActive ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="تعديل"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(customer.id)}
                        className={`p-1 rounded ${
                          customer.isActive 
                            ? 'text-red-600 hover:text-red-900' 
                            : 'text-green-600 hover:text-green-900'
                        }`}
                        title={customer.isActive ? 'إلغاء التفعيل' : 'تفعيل'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer.id)}
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

        {filteredCustomers.length === 0 && (
          <div className="text-center py-8">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد عملاء</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterType !== 'ALL' 
                ? 'لا توجد نتائج تطابق البحث' 
                : 'ابدأ بإضافة عميل جديد'}
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingCustomer ? 'تعديل العميل' : 'إضافة عميل جديد'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم العميل *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل اسم العميل"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      كود العميل (اختياري)
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="سيتم توليد كود تلقائياً إذا ترك فارغاً"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      نوع العميل
                    </label>
                    <select
                      name="customerType"
                      value={formData.customerType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={CustomerType.INDIVIDUAL}>فردي</option>
                      <option value={CustomerType.COMPANY}>شركة</option>
                      <option value={CustomerType.WORKSHOP}>ورشة</option>
                      <option value={CustomerType.RETAILER}>تاجر تجزئة</option>
                      <option value={CustomerType.STORE}>محل</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل رقم الهاتف"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل البريد الإلكتروني"
                    />
                  </div>


                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل العنوان الكامل"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="أدخل أي ملاحظات إضافية"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="mr-2 block text-sm text-gray-900">
                    العميل نشط
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {editingCustomer ? 'تحديث' : 'إنشاء'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
