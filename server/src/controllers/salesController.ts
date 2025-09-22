import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { body } from 'express-validator';
import { salesService } from '../services/salesService.js';
import { 
  CreateSaleInvoiceData, 
  UpdateSaleInvoiceData, 
  SaleInvoiceSearchParams,
  SaleType,
  PaymentMethod
} from '../types/sales.js';

// قواعد التحقق لإنشاء فاتورة بيع
export const createSaleInvoiceValidation = [
  body('customerId')
    .optional()
    .isString()
    .withMessage('معرف العميل يجب أن يكون نص'),
  body('storeId')
    .optional()
    .isString()
    .withMessage('معرف المحل يجب أن يكون نص'),
  body('invoiceDate')
    .notEmpty()
    .withMessage('تاريخ الفاتورة مطلوب')
    .isISO8601()
    .withMessage('تاريخ الفاتورة غير صحيح'),
  body('saleType')
    .optional()
    .isIn(Object.values(SaleType))
    .withMessage('نوع البيع غير صحيح'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('طريقة الدفع مطلوبة')
    .isIn(Object.values(PaymentMethod))
    .withMessage('طريقة الدفع غير صحيحة'),
  body('discount')
    .optional()
    .isNumeric()
    .withMessage('الخصم يجب أن يكون رقم')
    .custom((value) => {
      if (value !== undefined && value < 0) {
        throw new Error('الخصم لا يمكن أن يكون سالب');
      }
      return true;
    }),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الملاحظات لا يجب أن تتجاوز 500 حرف'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('يجب إضافة عنصر واحد على الأقل'),
  body('items.*.sparePartId')
    .notEmpty()
    .withMessage('معرف قطعة الغيار مطلوب'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('الكمية يجب أن تكون رقم صحيح أكبر من صفر'),
  body('items.*.unitPrice')
    .isNumeric()
    .withMessage('سعر الوحدة يجب أن يكون رقم')
    .custom((value) => {
      if (value <= 0) {
        throw new Error('سعر الوحدة يجب أن يكون أكبر من صفر');
      }
      return true;
    })
];

// قواعد التحقق لتحديث فاتورة بيع
export const updateSaleInvoiceValidation = [
  body('customerId')
    .optional()
    .isString()
    .withMessage('معرف العميل يجب أن يكون نص'),
  body('storeId')
    .optional()
    .isString()
    .withMessage('معرف المحل يجب أن يكون نص'),
  body('invoiceDate')
    .optional()
    .isISO8601()
    .withMessage('تاريخ الفاتورة غير صحيح'),
  body('saleType')
    .optional()
    .isIn(Object.values(SaleType))
    .withMessage('نوع البيع غير صحيح'),
  body('paymentMethod')
    .optional()
    .isIn(Object.values(PaymentMethod))
    .withMessage('طريقة الدفع غير صحيحة'),
  body('discount')
    .optional()
    .isNumeric()
    .withMessage('الخصم يجب أن يكون رقم')
    .custom((value) => {
      if (value !== undefined && value < 0) {
        throw new Error('الخصم لا يمكن أن يكون سالب');
      }
      return true;
    }),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الملاحظات لا يجب أن تتجاوز 500 حرف'),
  body('items')
    .optional()
    .isArray({ min: 1 })
    .withMessage('يجب إضافة عنصر واحد على الأقل'),
  body('items.*.sparePartId')
    .optional()
    .notEmpty()
    .withMessage('معرف قطعة الغيار مطلوب'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('الكمية يجب أن تكون رقم صحيح أكبر من صفر'),
  body('items.*.unitPrice')
    .optional()
    .isNumeric()
    .withMessage('سعر الوحدة يجب أن يكون رقم')
    .custom((value) => {
      if (value !== undefined && value <= 0) {
        throw new Error('سعر الوحدة يجب أن يكون أكبر من صفر');
      }
      return true;
    })
];

export class SalesController {
  // GET /api/sales - جلب جميع فواتير البيع
  async getAllSaleInvoices(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 طلب جلب جميع فواتير البيع');
      const invoices = await salesService.getAllSaleInvoices();
      console.log('✅ تم جلب فواتير البيع بنجاح:', invoices.length);
      
      res.status(200).json({
        success: true,
        data: invoices,
        message: 'تم جلب فواتير البيع بنجاح'
      });
      return;
    } catch (error) {
      console.error('❌ خطأ في جلب فواتير البيع:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب فواتير البيع',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/sales/:id - جلب فاتورة بيع بالمعرف
  async getSaleInvoiceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('📥 طلب جلب فاتورة البيع:', id);
      
      const invoice = await salesService.getSaleInvoiceById(id);
      
      if (!invoice) {
        res.status(404).json({
          success: false,
          message: 'فاتورة البيع غير موجودة'
        });
        return;
      }

      console.log('✅ تم جلب فاتورة البيع بنجاح');
      res.status(200).json({
        success: true,
        data: invoice,
        message: 'تم جلب فاتورة البيع بنجاح'
      });
      return;
    } catch (error) {
      console.error('❌ خطأ في جلب فاتورة البيع:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب فاتورة البيع',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // POST /api/sales - إنشاء فاتورة بيع جديدة
  async createSaleInvoice(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 استلام طلب إنشاء فاتورة بيع:', JSON.stringify(req.body, null, 2));
      
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

      // التحقق من وجود العناصر
      if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
        console.log('❌ لا توجد عناصر في الفاتورة');
        res.status(400).json({
          success: false,
          message: 'يجب إضافة عنصر واحد على الأقل للفاتورة'
        });
        return;
      }

      // التحقق من نوع البيع والمتطلبات
      if (req.body.saleType === 'BRANCH' && !req.body.storeId) {
        console.log('❌ لم يتم تحديد محل للبيع لمحلات الشركة');
        res.status(400).json({
          success: false,
          message: 'يجب اختيار محل عند البيع لمحلات الشركة'
        });
        return;
      }

      console.log('✅ البيانات صحيحة، محاولة إنشاء فاتورة البيع...');
      const invoiceData: CreateSaleInvoiceData = req.body;
      const userId = (req as any).user?.id || 'system'; // يجب الحصول على معرف المستخدم من الجلسة
      
      const invoice = await salesService.createSaleInvoice(invoiceData, userId);
      console.log('✅ تم إنشاء فاتورة البيع بنجاح:', invoice.id);

      res.status(201).json({
        success: true,
        data: invoice,
        message: 'تم إنشاء فاتورة البيع بنجاح'
      });
      return;
    } catch (error) {
      console.error('❌ خطأ في إنشاء فاتورة البيع:', error);
      
      // معالجة أخطاء محددة
      let statusCode = 400;
      let message = 'خطأ في إنشاء فاتورة البيع';
      
      if (error instanceof Error) {
        if (error.message.includes('غير موجودة')) {
          statusCode = 404;
          message = error.message;
        } else if (error.message.includes('غير متوفرة')) {
          statusCode = 409;
          message = error.message;
        } else {
          message = error.message;
        }
      }
      
      res.status(statusCode).json({
        success: false,
        message: message,
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // PUT /api/sales/:id - تحديث فاتورة بيع
  async updateSaleInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('📥 استلام طلب تحديث فاتورة البيع:', id);
      
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

      const updateData: UpdateSaleInvoiceData = req.body;
      const updatedInvoice = await salesService.updateSaleInvoice(id, updateData);
      console.log('✅ تم تحديث فاتورة البيع بنجاح');

      res.status(200).json({
        success: true,
        data: updatedInvoice,
        message: 'تم تحديث فاتورة البيع بنجاح'
      });
      return;
    } catch (error) {
      console.error('❌ خطأ في تحديث فاتورة البيع:', error);
      res.status(400).json({
        success: false,
        message: 'خطأ في تحديث فاتورة البيع',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // DELETE /api/sales/:id - حذف فاتورة بيع
  async deleteSaleInvoice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      console.log('📥 استلام طلب حذف فاتورة البيع:', id);
      
      await salesService.deleteSaleInvoice(id);
      console.log('✅ تم حذف فاتورة البيع بنجاح');

      res.status(200).json({
        success: true,
        message: 'تم حذف فاتورة البيع بنجاح'
      });
      return;
    } catch (error) {
      console.error('❌ خطأ في حذف فاتورة البيع:', error);
      res.status(400).json({
        success: false,
        message: 'خطأ في حذف فاتورة البيع',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/sales/search - البحث في فواتير البيع
  async searchSaleInvoices(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 طلب البحث في فواتير البيع:', req.query);
      
      const searchParams: SaleInvoiceSearchParams = {
        search: req.query.search as string,
        customerId: req.query.customerId as string,
        storeId: req.query.storeId as string,
        userId: req.query.userId as string,
        saleType: req.query.saleType as SaleType,
        paymentMethod: req.query.paymentMethod as PaymentMethod,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10
      };

      const result = await salesService.searchSaleInvoices(searchParams);
      console.log('✅ تم البحث في فواتير البيع بنجاح');

      res.status(200).json({
        success: true,
        data: result,
        message: 'تم البحث في فواتير البيع بنجاح'
      });
      return;
    } catch (error) {
      console.error('❌ خطأ في البحث في فواتير البيع:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في البحث في فواتير البيع',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/sales/stats - جلب إحصائيات المبيعات
  async getSalesStats(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 طلب جلب إحصائيات المبيعات');
      
      const stats = await salesService.getSalesStats();
      console.log('✅ تم جلب إحصائيات المبيعات بنجاح');

      res.status(200).json({
        success: true,
        data: stats,
        message: 'تم جلب إحصائيات المبيعات بنجاح'
      });
      return;
    } catch (error) {
      console.error('❌ خطأ في جلب إحصائيات المبيعات:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب إحصائيات المبيعات',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }
}

export const salesController = new SalesController();
