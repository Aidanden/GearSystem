'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  useCreateSaleInvoiceMutation,
  useUpdateSaleInvoiceMutation,
  CreateSaleInvoiceData,
  SaleInvoice,
  PaymentMethod,
  SaleType
} from '@/state/apiSlices/salesApi';
import { useGetCustomersQuery } from '@/state/apiSlices/customersApi';
import { useGetActiveStoresQuery } from '@/state/apiSlices/storesApi';
import { useGetProductsQuery } from '@/state/apiSlices/productsApi';
import { 
  X, 
  Plus, 
  Trash2, 
  Search,
  User,
  Building,
  Calculator,
  Save,
  Package
} from 'lucide-react';

interface CreateSaleInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingInvoice?: SaleInvoice | null;
  onSuccess: () => void;
}

interface InvoiceItem {
  sparePartId: string;
  sparePartName: string;
  sparePartCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

const CreateSaleInvoiceModal: React.FC<CreateSaleInvoiceModalProps> = ({
  isOpen,
  onClose,
  editingInvoice,
  onSuccess
}) => {
  // Form state
  const [formData, setFormData] = useState({
    saleType: SaleType.REGULAR, // نوع البيع أول خانة
    customerId: '',
    storeId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    paymentMethod: PaymentMethod.CASH,
    discount: 0,
    notes: ''
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [storeSearchTerm, setStoreSearchTerm] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);

  // API Hooks
  const { data: customersResponse } = useGetCustomersQuery();
  const { data: storesResponse } = useGetActiveStoresQuery();
  const { data: productsResponse } = useGetProductsQuery();
  const [createInvoice, { isLoading: isCreating }] = useCreateSaleInvoiceMutation();
  const [updateInvoice, { isLoading: isUpdating }] = useUpdateSaleInvoiceMutation();

  const customers = customersResponse?.data || [];
  const stores = storesResponse?.data || [];
  const products = Array.isArray((productsResponse as any)?.data) ? (productsResponse as any).data : [];

  // Filter customers, stores and products
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
    customer.code.toLowerCase().includes(customerSearchTerm.toLowerCase())
  );

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(storeSearchTerm.toLowerCase()) ||
    store.code.toLowerCase().includes(storeSearchTerm.toLowerCase())
  );

  const filteredProducts = products.filter((product: any) =>
    product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product?.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const discountAmount = (subtotal * formData.discount) / 100;
  const netAmount = subtotal - discountAmount;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editingInvoice) {
        setFormData({
          saleType: editingInvoice.saleType,
          customerId: editingInvoice.customerId || '',
          storeId: editingInvoice.storeId || '',
          invoiceDate: editingInvoice.invoiceDate.split('T')[0],
          paymentMethod: editingInvoice.paymentMethod,
          discount: (editingInvoice.discount / editingInvoice.totalAmount) * 100,
          notes: editingInvoice.notes || ''
        });
        // تحديث search terms بناءً على البيانات الموجودة
        if (editingInvoice.customer) {
          setCustomerSearchTerm(editingInvoice.customer.name);
        }
        if (editingInvoice.store) {
          setStoreSearchTerm(editingInvoice.store.name);
        }
        setItems(editingInvoice.items.map(item => ({
          sparePartId: item.sparePartId,
          sparePartName: item.sparePart.name,
          sparePartCode: item.sparePart.code,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })));
      } else {
        setFormData({
          saleType: SaleType.REGULAR, // نوع البيع أول خانة
          customerId: '',
          storeId: '',
          invoiceDate: new Date().toISOString().split('T')[0],
          paymentMethod: PaymentMethod.CASH,
          discount: 0,
          notes: ''
        });
        setItems([]);
        setCustomerSearchTerm('');
        setStoreSearchTerm('');
        setShowCustomerDropdown(false);
        setShowStoreDropdown(false);
      }
    }
  }, [isOpen, editingInvoice]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // إذا تم تغيير نوع البيع، قم بإعادة تعيين العميل/المحل
    if (name === 'saleType') {
      setCustomerSearchTerm('');
      setStoreSearchTerm('');
      setShowCustomerDropdown(false);
      setShowStoreDropdown(false);
      setFormData(prev => ({
        ...prev,
        [name]: value as SaleType,
        customerId: '',
        storeId: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'discount' ? parseFloat(value) || 0 : value
      }));
    }
  };

  // Add product to invoice
  const addProduct = (product: any) => {
    const existingItem = items.find(item => item.sparePartId === product.id);
    
    if (existingItem) {
      setItems(items.map(item =>
        item.sparePartId === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
              totalPrice: (item.quantity + 1) * item.unitPrice
            }
          : item
      ));
    } else {
      // تحديد السعر حسب نوع البيع
      let unitPrice: number;
      if (product.unitPrice) {
        // استخدام سعر الوحدة إذا كان محدد
        unitPrice = Number(product.unitPrice);
      } else {
        // استخدام متوسط التكلفة كبديل
        unitPrice = Number(product.inventoryItems?.[0]?.averageCost || 0);
      }
      
      const newItem: InvoiceItem = {
        sparePartId: product.id,
        sparePartName: product.name,
        sparePartCode: product.code,
        quantity: 1,
        unitPrice: unitPrice,
        totalPrice: unitPrice
      };
      setItems([...items, newItem]);
    }
    setSearchTerm('');
  };

  // Update item quantity
  const updateItemQuantity = (sparePartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(sparePartId);
      return;
    }
    
    setItems(items.map(item =>
      item.sparePartId === sparePartId
        ? {
            ...item,
            quantity,
            totalPrice: quantity * item.unitPrice
          }
        : item
    ));
  };

  // Update item price
  const updateItemPrice = (sparePartId: string, unitPrice: number) => {
    setItems(items.map(item =>
      item.sparePartId === sparePartId
        ? {
            ...item,
            unitPrice,
            totalPrice: item.quantity * unitPrice
          }
        : item
    ));
  };


  // Remove item
  const removeItem = (sparePartId: string) => {
    setItems(items.filter(item => item.sparePartId !== sparePartId));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('يجب إضافة عنصر واحد على الأقل');
      return;
    }

    // التحقق من اختيار محل عند البيع للمحلات
    if (formData.saleType === SaleType.BRANCH && !formData.storeId) {
      toast.error('يجب اختيار محل عند البيع لمحلات الشركة');
      return;
    }

    try {
      const invoiceData: CreateSaleInvoiceData = {
        customerId: formData.saleType === SaleType.REGULAR ? (formData.customerId || undefined) : undefined,
        storeId: formData.saleType === SaleType.BRANCH ? (formData.storeId || undefined) : undefined,
        invoiceDate: formData.invoiceDate,
        saleType: formData.saleType,
        paymentMethod: formData.paymentMethod,
        discount: discountAmount,
        notes: formData.notes || undefined,
        items: items.map(item => ({
          sparePartId: item.sparePartId,
          quantity: item.quantity,
          unitPrice: item.unitPrice
        }))
      };

      if (editingInvoice) {
        await updateInvoice({ id: editingInvoice.id, data: invoiceData }).unwrap();
        toast.success('تم تحديث الفاتورة بنجاح');
      } else {
        await createInvoice(invoiceData).unwrap();
        toast.success('تم إنشاء الفاتورة بنجاح');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || 'خطأ في حفظ الفاتورة');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {editingInvoice ? 'تعديل فاتورة البيع' : 'إنشاء فاتورة بيع جديدة'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Invoice Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل الفاتورة</h3>
                
                {/* Sale Type - أول خانة */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نوع البيع *
                  </label>
                  <select
                    name="saleType"
                    value={formData.saleType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={SaleType.REGULAR}>بيع عادي للعملاء</option>
                    <option value={SaleType.BRANCH}>بيع لمحلات الشركة</option>
                  </select>
                </div>

                {/* Customer Selection - يظهر فقط للبيع العادي */}
                {formData.saleType === SaleType.REGULAR && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      العميل (اختياري للبيع النقدي)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="البحث عن عميل أو اضغط للاختيار..."
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                        onFocus={() => setShowCustomerDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {customerSearchTerm && (
                        <button
                          type="button"
                          onClick={() => {
                            setCustomerSearchTerm('');
                            setFormData(prev => ({ ...prev, customerId: '' }));
                            setShowCustomerDropdown(false);
                          }}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {showCustomerDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map(customer => (
                              <button
                                key={customer.id}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, customerId: customer.id }));
                                  setCustomerSearchTerm(customer.name);
                                  setShowCustomerDropdown(false);
                                }}
                                className="w-full text-right px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <User className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">{customer.name}</div>
                                  <div className="text-sm text-gray-500">{customer.code}</div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-gray-500 text-center">
                              لا توجد عملاء متاحين
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Store Selection - يظهر فقط للبيع لمحلات الشركة */}
                {formData.saleType === SaleType.BRANCH && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المحل *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="البحث عن محل أو اضغط للاختيار..."
                        value={storeSearchTerm}
                        onChange={(e) => setStoreSearchTerm(e.target.value)}
                        onFocus={() => setShowStoreDropdown(true)}
                        onBlur={() => setTimeout(() => setShowStoreDropdown(false), 200)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {storeSearchTerm && (
                        <button
                          type="button"
                          onClick={() => {
                            setStoreSearchTerm('');
                            setFormData(prev => ({ ...prev, storeId: '' }));
                            setShowStoreDropdown(false);
                          }}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {showStoreDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                          {filteredStores.length > 0 ? (
                            filteredStores.map(store => (
                              <button
                                key={store.id}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, storeId: store.id }));
                                  setStoreSearchTerm(store.name);
                                  setShowStoreDropdown(false);
                                }}
                                className="w-full text-right px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Building className="w-4 h-4" />
                                <div>
                                  <div className="font-medium">{store.name}</div>
                                  <div className="text-sm text-gray-500">{store.code}</div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-2 text-gray-500 text-center">
                              لا توجد محلات متاحة
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Invoice Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ الفاتورة
                  </label>
                  <input
                    type="date"
                    name="invoiceDate"
                    value={formData.invoiceDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>


                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    طريقة الدفع
                  </label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={PaymentMethod.CASH}>نقدي</option>
                    <option value={PaymentMethod.BANK}>مصرفي</option>
                    <option value={PaymentMethod.CHECK}>شيك</option>
                  </select>
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نسبة الخصم (%)
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={formData.discount}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Notes */}
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
                    placeholder="ملاحظات إضافية..."
                  />
                </div>

                {/* Totals */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">ملخص الفاتورة</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>المجموع الفرعي:</span>
                      <span>{subtotal.toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between">
                      <span>الخصم ({formData.discount}%):</span>
                      <span className="text-red-600">-{discountAmount.toFixed(2)} ج.م</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>الإجمالي:</span>
                      <span className="text-green-600">{netAmount.toFixed(2)} ج.م</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Products */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">إضافة المنتجات</h3>
                
                {/* Product Search */}
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="البحث عن منتج..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Product List */}
                {searchTerm && (
                  <div className="border border-gray-300 rounded-lg max-h-40 overflow-y-auto">
                    {filteredProducts.map((product: any) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => addProduct(product)}
                        className="w-full text-right px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.code}</div>
                          </div>
                          <div className="text-sm">
                            {product.unitPrice ? (
                              <div className="font-medium text-purple-600">{Number(product.unitPrice).toFixed(2)} ج.م (سعر الوحدة)</div>
                            ) : (
                              <div className="font-medium">{Number(product.inventoryItems?.[0]?.averageCost || 0).toFixed(2)} ج.م (متوسط التكلفة)</div>
                            )}
                            <div className="text-gray-500">متوفر: {product.inventoryItems?.[0]?.quantity || 0}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Items */}
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">المنتجات المحددة</h4>
                  {items.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="mx-auto w-12 h-12 mb-2" />
                      <p>لم يتم إضافة أي منتجات بعد</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {items.map(item => (
                        <div key={item.sparePartId} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <div className="font-medium">{item.sparePartName}</div>
                              <div className="text-sm text-gray-500">{item.sparePartCode}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(item.sparePartId)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">الكمية</label>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(item.sparePartId, parseInt(e.target.value) || 0)}
                                min="1"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">
                                {formData.saleType === SaleType.BRANCH ? 'سعر التحويل' : 'سعر البيع'}
                              </label>
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateItemPrice(item.sparePartId, parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-600 mb-1">الإجمالي</label>
                              <div className="px-2 py-1 text-sm bg-gray-100 rounded font-medium">
                                {item.totalPrice.toFixed(2)} ج.م
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-6">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating || items.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {isCreating || isUpdating ? 'جاري الحفظ...' : editingInvoice ? 'تحديث الفاتورة' : 'إنشاء الفاتورة'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSaleInvoiceModal;
