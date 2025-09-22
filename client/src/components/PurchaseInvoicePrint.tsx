'use client';

import React, { useRef } from 'react';
import { PurchaseInvoicePrintData } from '../state/apiSlices/purchasesApi';

interface PurchaseInvoicePrintProps {
  invoice: PurchaseInvoicePrintData;
  onClose: () => void;
}

const PurchaseInvoicePrint: React.FC<PurchaseInvoicePrintProps> = ({ invoice, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (printRef.current) {
      const printContent = printRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // إعادة تحميل الصفحة لاستعادة الحالة الأصلية
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    // تنسيق التاريخ بالأرقام العربية (وليس الهندية)
    return `${day}/${month}/${year}`;
  };

  const formatCurrency = (amount: number) => {
    const number = Number(amount || 0);
    // تنسيق الرقم بدون عملة أولاً
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(number);
    
    // تحويل الأرقام الإنجليزية إلى العربية (وليس الهندية) واستبدال النقطة بالفاصلة وإضافة د.ل
    const arabicFormatted = formatted
      .replace('.', '،'); // استبدال النقطة بالفاصلة العربية فقط
    
    return `${arabicFormatted} د.ل`;
  };

  // الاحتفاظ بالأرقام العربية (وليس الهندية) كما هي
  const toArabicNumbers = (text: string) => {
    // الأرقام العربية هي نفسها الأرقام الإنجليزية: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9
    return text; // لا نحتاج تحويل
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-4 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        {/* أزرار التحكم */}
        <div className="flex justify-between items-center mb-4 no-print">
          <h2 className="text-xl font-bold text-gray-900">معاينة الطباعة</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              طباعة
            </button>
            <button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md"
            >
              إغلاق
            </button>
          </div>
        </div>

        {/* محتوى الفاتورة للطباعة */}
        <div ref={printRef} className="print-content bg-white p-8" style={{ direction: 'rtl' }}>
          {/* رأس الفاتورة */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{invoice.companyInfo.name}</h1>
            <p className="text-gray-600">{invoice.companyInfo.address}</p>
            <p className="text-gray-600">هاتف: {invoice.companyInfo.phone} | بريد إلكتروني: {invoice.companyInfo.email}</p>
            <p className="text-gray-600">الرقم الضريبي: {invoice.companyInfo.taxNumber}</p>
          </div>

          <hr className="border-gray-300 mb-6" />

          {/* عنوان الفاتورة */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">فاتورة شراء</h2>
          </div>

          {/* معلومات الفاتورة */}
          <div className="grid grid-cols-2 gap-8 mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">معلومات الفاتورة</h3>
              <div className="space-y-2">
                <p><span className="font-medium">رقم الفاتورة:</span> {invoice.invoiceNumber}</p>
                <p><span className="font-medium">تاريخ الفاتورة:</span> {formatDate(invoice.invoiceDate)}</p>
                {invoice.dueDate && (
                  <p><span className="font-medium">تاريخ الاستحقاق:</span> {formatDate(invoice.dueDate)}</p>
                )}
                <p><span className="font-medium">نوع الدفع:</span> {invoice.paymentType === 'CASH' ? 'نقدي' : 'آجل'}</p>
                {invoice.paymentMethod && (
                  <p><span className="font-medium">طريقة الدفع:</span> {
                    invoice.paymentMethod === 'CASH' ? 'نقدي' :
                    invoice.paymentMethod === 'BANK' ? 'تحويل بنكي' : 'شيك'
                  }</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">معلومات المورد</h3>
              <div className="space-y-2">
                <p><span className="font-medium">كود المورد:</span> {invoice.supplier.code}</p>
                <p><span className="font-medium">اسم المورد:</span> {invoice.supplier.name}</p>
              </div>
            </div>
          </div>

          {/* جدول البنود */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">بنود الفاتورة</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-right">م</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">كود المنتج</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">اسم المنتج</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">الوحدة</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">الكمية</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">سعر الوحدة</th>
                  <th className="border border-gray-300 px-4 py-2 text-right">المجموع</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-gray-300 px-4 py-2 text-center">{toArabicNumbers((index + 1).toString())}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.product.code}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.product.name}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{item.product.unit}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">{toArabicNumbers(item.quantity.toString())}</td>
                    <td className="border border-gray-300 px-4 py-2 text-left">{formatCurrency(item.unitPrice)}</td>
                    <td className="border border-gray-300 px-4 py-2 text-left font-medium">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* المجاميع */}
          <div className="flex justify-end mb-6">
            <div className="w-1/2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">المجموع الفرعي:</span>
                    <span>{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">المبلغ المدفوع:</span>
                    <span>{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">المبلغ المتبقي:</span>
                    <span>{formatCurrency(invoice.remainingAmount)}</span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع الكلي:</span>
                    <span>{formatCurrency(invoice.totalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* المبلغ بالكلمات */}
          <div className="mb-6">
            <p className="text-center font-medium">
              <span className="font-bold">المبلغ بالكلمات:</span> {invoice.totalInWords}
            </p>
          </div>

          {/* الملاحظات */}
          {invoice.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">ملاحظات:</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{invoice.notes}</p>
            </div>
          )}

          {/* التوقيعات */}
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="text-center">
              <div className="border-t border-gray-300 pt-2 mt-16">
                <p className="font-medium">توقيع المورد</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-gray-300 pt-2 mt-16">
                <p className="font-medium">توقيع المستلم</p>
              </div>
            </div>
          </div>

          {/* تاريخ الطباعة */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>تم طباعة هذه الفاتورة في: {formatDate(invoice.printDate)}</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .print-content {
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
};

export default PurchaseInvoicePrint;
