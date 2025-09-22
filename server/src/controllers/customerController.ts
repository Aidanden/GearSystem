import { Request, Response } from 'express';
import { CustomerService } from '../services/customerService.js';
import { CreateCustomerData, UpdateCustomerData, CustomerType } from '../types/customer.js';
import { body, validationResult } from 'express-validator';

const customerService = new CustomerService();

// تحديد قواعد التحقق للإنشاء
export const createCustomerValidation = [
  body('name')
    .notEmpty()
    .withMessage('اسم العميل مطلوب')
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم العميل يجب أن يكون بين 2-100 حرف'),
  body('code')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('كود العميل يجب أن يكون بين 1-20 حرف')
    .matches(/^[A-Za-z0-9_-]*$/)
    .withMessage('كود العميل يجب أن يحتوي على أحرف وأرقام فقط'),
  body('phone')
    .optional()
    .custom((value) => {
      if (value && value.trim() === '') return true;
      return value.length <= 20;
    })
    .withMessage('رقم الهاتف لا يجب أن يتجاوز 20 رقم'),
  body('email')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    })
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('العنوان لا يجب أن يتجاوز 200 حرف'),
  body('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('المدينة لا يجب أن تتجاوز 50 حرف'),
  body('customerType')
    .optional()
    .isIn(Object.values(CustomerType))
    .withMessage('نوع العميل غير صحيح'),
  body('taxNumber')
    .optional()
    .isLength({ max: 20 })
    .withMessage('الرقم الضريبي لا يجب أن يتجاوز 20 حرف'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الملاحظات لا يجب أن تتجاوز 500 حرف'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false')
];

// تحديد قواعد التحقق للتحديث
export const updateCustomerValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم العميل يجب أن يكون بين 2-100 حرف'),
  body('code')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('كود العميل يجب أن يكون بين 1-20 حرف')
    .matches(/^[A-Za-z0-9_-]*$/)
    .withMessage('كود العميل يجب أن يحتوي على أحرف وأرقام فقط'),
  body('phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('رقم الهاتف لا يجب أن يتجاوز 20 رقم'),
  body('email')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true;
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    })
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('العنوان لا يجب أن يتجاوز 200 حرف'),
  body('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('المدينة لا يجب أن تتجاوز 50 حرف'),
  body('customerType')
    .optional()
    .isIn(Object.values(CustomerType))
    .withMessage('نوع العميل غير صحيح'),
  body('taxNumber')
    .optional()
    .isLength({ max: 20 })
    .withMessage('الرقم الضريبي لا يجب أن يتجاوز 20 حرف'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الملاحظات لا يجب أن تتجاوز 500 حرف'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false')
];

export class CustomerController {
  // GET /api/customers - جلب جميع العملاء
  async getAllCustomers(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 طلب جلب جميع العملاء');
      const customers = await customerService.getAllCustomers();
      console.log('✅ تم جلب العملاء بنجاح:', customers.length);
      
      res.status(200).json({
        success: true,
        data: customers,
        message: 'تم جلب العملاء بنجاح'
      });
      return;
    } catch (error) {
      console.error('❌ خطأ في جلب العملاء:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب العملاء',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/customers/active - جلب العملاء النشطين فقط
  async getActiveCustomers(req: Request, res: Response): Promise<void> {
    try {
      const customers = await customerService.getActiveCustomers();
      
      res.status(200).json({
        success: true,
        data: customers,
        message: 'تم جلب العملاء النشطين بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب العملاء النشطين',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/customers/stats - جلب إحصائيات العملاء
  async getCustomerStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await customerService.getCustomerStats();
      
      res.status(200).json({
        success: true,
        data: stats,
        message: 'تم جلب إحصائيات العملاء بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب إحصائيات العملاء',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/customers/search - البحث في العملاء
  async searchCustomers(req: Request, res: Response): Promise<void> {
    try {
      const { search, customerType, city, isActive, page, limit } = req.query;
      
      const params = {
        search: search as string,
        customerType: customerType as CustomerType,
        city: city as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      };

      const result = await customerService.searchCustomers(params);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'تم البحث في العملاء بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في البحث في العملاء',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/customers/type/:type - جلب العملاء حسب النوع
  async getCustomersByType(req: Request, res: Response): Promise<void> {
    try {
      const { type } = req.params;
      
      if (!Object.values(CustomerType).includes(type as CustomerType)) {
        res.status(400).json({
          success: false,
          message: 'نوع العميل غير صحيح'
        });
        return;
      }

      const customers = await customerService.getCustomersByType(type as CustomerType);
      
      res.status(200).json({
        success: true,
        data: customers,
        message: 'تم جلب العملاء حسب النوع بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب العملاء حسب النوع',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/customers/debt - جلب العملاء المدينين
  async getCustomersWithDebt(req: Request, res: Response): Promise<void> {
    try {
      const customers = await customerService.getCustomersWithDebt();
      
      res.status(200).json({
        success: true,
        data: customers,
        message: 'تم جلب العملاء المدينين بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب العملاء المدينين',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/customers/:id - جلب عميل بالمعرف
  async getCustomerById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(id);
      
      if (!customer) {
        res.status(404).json({
          success: false,
          message: 'العميل غير موجود'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: customer,
        message: 'تم جلب العميل بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب العميل',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // POST /api/customers - إنشاء عميل جديد
  async createCustomer(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 استلام طلب إنشاء عميل:', JSON.stringify(req.body, null, 2));
      
      // التحقق من وجود اسم العميل على الأقل
      if (!req.body.name || req.body.name.trim() === '') {
        console.log('❌ اسم العميل مطلوب');
        res.status(400).json({
          success: false,
          message: 'اسم العميل مطلوب',
          errors: [{ field: 'name', message: 'اسم العميل مطلوب' }]
        });
        return;
      }
      
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

      console.log('✅ البيانات صحيحة، محاولة إنشاء العميل...');
      const customerData: CreateCustomerData = req.body;
      const customer = await customerService.createCustomer(customerData);
      console.log('✅ تم إنشاء العميل بنجاح:', customer);

      res.status(201).json({
        success: true,
        data: customer,
        message: 'تم إنشاء العميل بنجاح'
      });
      return;
    } catch (error) {
      console.error('❌ خطأ في إنشاء العميل:', error);
      res.status(400).json({
        success: false,
        message: 'خطأ في إنشاء العميل',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // PUT /api/customers/:id - تحديث عميل
  async updateCustomer(req: Request, res: Response): Promise<void> {
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
      const updateData: UpdateCustomerData = req.body;
      const customer = await customerService.updateCustomer(id, updateData);

      res.status(200).json({
        success: true,
        data: customer,
        message: 'تم تحديث العميل بنجاح'
      });
      return;
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في تحديث العميل',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // DELETE /api/customers/:id - حذف عميل
  async deleteCustomer(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await customerService.deleteCustomer(id);

      res.status(200).json({
        success: true,
        message: 'تم حذف العميل بنجاح'
      });
      return;
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في حذف العميل',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // PATCH /api/customers/:id/toggle-status - تبديل حالة العميل
  async toggleCustomerStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await customerService.toggleCustomerStatus(id);

      res.status(200).json({
        success: true,
        data: customer,
        message: `تم ${customer.isActive ? 'تفعيل' : 'إلغاء تفعيل'} العميل بنجاح`
      });
      return;
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في تبديل حالة العميل',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // PATCH /api/customers/:id/balance - تحديث رصيد العميل
  async updateCustomerBalance(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { amount } = req.body;

      if (typeof amount !== 'number') {
        res.status(400).json({
          success: false,
          message: 'المبلغ يجب أن يكون رقم'
        });
        return;
      }

      const customer = await customerService.updateCustomerBalance(id, amount);

      res.status(200).json({
        success: true,
        data: customer,
        message: 'تم تحديث رصيد العميل بنجاح'
      });
      return;
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في تحديث رصيد العميل',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }
}
