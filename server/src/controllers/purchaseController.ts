import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { PurchaseService } from '../services/purchaseService.js';
import { CreatePurchaseInvoiceData, UpdatePurchaseInvoiceData } from '../types/purchase.js';
import { body, validationResult } from 'express-validator';

const purchaseService = new PurchaseService();
const prisma = new PrismaClient();

// تحديد قواعد التحقق للإنشاء
export const createPurchaseValidation = [
  body('invoiceNumber')
    .notEmpty()
    .withMessage('رقم الفاتورة مطلوب')
    .isLength({ min: 1, max: 50 })
    .withMessage('رقم الفاتورة يجب أن يكون بين 1-50 حرف'),
  body('supplierId')
    .notEmpty()
    .withMessage('المورد مطلوب'),
  body('invoiceDate')
    .notEmpty()
    .withMessage('تاريخ الفاتورة مطلوب')
    .isISO8601()
    .withMessage('تاريخ الفاتورة غير صحيح'),
  body('dueDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('تاريخ الاستحقاق غير صحيح'),
  body('paymentType')
    .notEmpty()
    .withMessage('نوع الدفع مطلوب')
    .isIn(['CASH', 'CREDIT'])
    .withMessage('نوع الدفع يجب أن يكون CASH أو CREDIT'),
  body('paymentMethod')
    .optional()
    .isIn(['CASH', 'BANK', 'CHECK'])
    .withMessage('طريقة الدفع يجب أن تكون CASH أو BANK أو CHECK'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الملاحظات لا يجب أن تتجاوز 500 حرف'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('يجب إضافة بند واحد على الأقل'),
  body('items.*.productId')
    .notEmpty()
    .withMessage('المنتج مطلوب'),
  body('items.*.quantity')
    .notEmpty()
    .withMessage('الكمية مطلوبة')
    .isInt({ min: 1 })
    .withMessage('الكمية يجب أن تكون رقماً موجباً'),
  body('items.*.unitPrice')
    .notEmpty()
    .withMessage('سعر الوحدة مطلوب')
    .isFloat({ min: 0.01 })
    .withMessage('سعر الوحدة يجب أن يكون رقماً موجباً')
];

// تحديد قواعد التحقق للتحديث
export const updatePurchaseValidation = [
  body('invoiceNumber')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('رقم الفاتورة يجب أن يكون بين 1-50 حرف'),
  body('supplierId')
    .optional(),
  body('invoiceDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('تاريخ الفاتورة غير صحيح'),
  body('dueDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('تاريخ الاستحقاق غير صحيح'),
  body('paymentType')
    .optional()
    .isIn(['CASH', 'CREDIT'])
    .withMessage('نوع الدفع يجب أن يكون CASH أو CREDIT'),
  body('paymentMethod')
    .optional()
    .isIn(['CASH', 'BANK', 'CHECK'])
    .withMessage('طريقة الدفع يجب أن تكون CASH أو BANK أو CHECK'),
  body('status')
    .optional()
    .isIn(['PENDING', 'PARTIAL', 'PAID', 'CANCELLED'])
    .withMessage('حالة الفاتورة غير صحيحة'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الملاحظات لا يجب أن تتجاوز 500 حرف')
];

export class PurchaseController {
  // GET /api/purchases
  async getAllPurchaseInvoices(req: Request, res: Response): Promise<void> {
    try {
      const { status, supplierId } = req.query;
      
      let invoices;
      
      if (status === 'pending') {
        invoices = await purchaseService.getPendingPurchaseInvoices();
      } else if (supplierId) {
        invoices = await purchaseService.getPurchaseInvoicesBySupplier(supplierId as string);
      } else {
        invoices = await purchaseService.getAllPurchaseInvoices();
      }

      res.status(200).json({
        success: true,
        data: invoices,
        message: 'تم جلب فواتير الشراء بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب فواتير الشراء',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/purchases/pending
  async getPendingPurchaseInvoices(req: Request, res: Response): Promise<void> {
    try {
      const invoices = await purchaseService.getPendingPurchaseInvoices();

      res.status(200).json({
        success: true,
        data: invoices,
        message: 'تم جلب الفواتير المعلقة بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب الفواتير المعلقة',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /api/purchases/:id
  async getPurchaseInvoiceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const invoice = await purchaseService.getPurchaseInvoiceById(id);

      if (!invoice) {
        res.status(404).json({
          success: false,
          message: 'فاتورة الشراء غير موجودة'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: invoice,
        message: 'تم جلب فاتورة الشراء بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب فاتورة الشراء',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // POST /api/purchases
  async createPurchaseInvoice(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 استلام طلب إنشاء فاتورة:', JSON.stringify(req.body, null, 2));
      
      // التحقق من صحة البيانات
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ أخطاء في التحقق من البيانات:', errors.array());
        res.status(400).json({
          success: false,
          message: 'خطأ في البيانات المدخلة',
          errors: errors.array()
        });
        return;
      }

      const invoiceData: CreatePurchaseInvoiceData = {
        ...req.body,
        invoiceDate: new Date(req.body.invoiceDate),
        dueDate: req.body.dueDate && req.body.dueDate.trim() !== '' ? new Date(req.body.dueDate) : undefined
      };

      // الحصول على معرف المستخدم من JWT (مؤقتاً نستخدم معرف المستخدم الافتراضي)
      let userId = (req as any).user?.id;
      
      if (!userId) {
        // البحث عن المستخدم الافتراضي أو إنشاؤه
        let defaultUser = await prisma.user.findFirst({
          where: { email: 'admin@gearsystem.com' }
        });
        
        if (!defaultUser) {
          console.log('🔧 إنشاء مستخدم افتراضي...');
          defaultUser = await prisma.user.create({
            data: {
              email: 'admin@gearsystem.com',
              username: 'admin',
              password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewrMYWiQ4z/K6VQe', // password: 'admin123'
              firstName: 'المدير',
              lastName: 'العام',
              role: 'ADMIN',
              isActive: true
            }
          });
          console.log('✅ تم إنشاء المستخدم الافتراضي:', defaultUser.id);
        }
        
        userId = defaultUser.id;
        console.log('✅ استخدام المستخدم الافتراضي:', userId);
      }

      const invoice = await purchaseService.createPurchaseInvoice(invoiceData, userId);

      res.status(201).json({
        success: true,
        data: invoice,
        message: 'تم إنشاء فاتورة الشراء بنجاح'
      });
    } catch (error) {
      console.error('❌ خطأ في إنشاء فاتورة الشراء:', error);
      res.status(400).json({
        success: false,
        message: 'خطأ في إنشاء فاتورة الشراء',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // PUT /api/purchases/:id
  async updatePurchaseInvoice(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'خطأ في البيانات المدخلة',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const updateData: UpdatePurchaseInvoiceData = {
        ...req.body,
        invoiceDate: req.body.invoiceDate ? new Date(req.body.invoiceDate) : undefined,
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined
      };

      const invoice = await purchaseService.updatePurchaseInvoice(id, updateData);

      res.status(200).json({
        success: true,
        data: invoice,
        message: 'تم تحديث فاتورة الشراء بنجاح'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في تحديث فاتورة الشراء',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // DELETE /api/purchases/:id
  async deletePurchaseInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await purchaseService.deletePurchaseInvoice(id);

      res.status(200).json({
        success: true,
        message: 'تم حذف فاتورة الشراء بنجاح'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في حذف فاتورة الشراء',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /api/purchases/search/:query
  async searchPurchaseInvoices(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.params;
      const invoices = await purchaseService.searchPurchaseInvoices(query);

      res.status(200).json({
        success: true,
        data: invoices,
        message: 'تم البحث بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في البحث',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /api/purchases/supplier/:supplierId
  async getPurchaseInvoicesBySupplier(req: Request, res: Response): Promise<void> {
    try {
      const { supplierId } = req.params;
      const invoices = await purchaseService.getPurchaseInvoicesBySupplier(supplierId);

      res.status(200).json({
        success: true,
        data: invoices,
        message: 'تم جلب فواتير المورد بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب فواتير المورد',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/purchases/:id/print - طباعة فاتورة الشراء
  async printPurchaseInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const invoice = await purchaseService.getPurchaseInvoiceById(id);

      if (!invoice) {
        res.status(404).json({
          success: false,
          message: 'فاتورة الشراء غير موجودة'
        });
        return;
      }

      // إرجاع بيانات الفاتورة مع معلومات إضافية للطباعة
      const printData = {
        ...invoice,
        companyInfo: {
          name: 'شركة قطع غيار السيارات',
          address: 'العنوان الرئيسي للشركة',
          phone: '+966 XX XXX XXXX',
          email: 'info@company.com',
          taxNumber: 'الرقم الضريبي'
        },
        printDate: new Date().toISOString(),
        totalInWords: this.numberToWords(invoice.totalAmount)
      };

      res.status(200).json({
        success: true,
        data: printData,
        message: 'تم جلب بيانات الطباعة بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب بيانات الطباعة',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/purchases/generate-invoice-number - توليد رقم فاتورة جديد
  async generateInvoiceNumber(req: Request, res: Response): Promise<void> {
    try {
      const invoiceNumber = await purchaseService.generateInvoiceNumber();

      res.status(200).json({
        success: true,
        data: { invoiceNumber },
        message: 'تم توليد رقم الفاتورة بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في توليد رقم الفاتورة',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // دالة مساعدة لتحويل الرقم إلى كلمات (مبسطة)
  private numberToWords(amount: number): string {
    // هذه دالة مبسطة - يمكن تحسينها لاحقاً
    return `${amount.toFixed(2)} د.ل`;
  }
}

