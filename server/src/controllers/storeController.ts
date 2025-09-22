import { Request, Response } from 'express';
import { StoreService } from '../services/storeService.js';
import { CreateStoreData, UpdateStoreData } from '../types/store.js';
import { body, validationResult } from 'express-validator';

const storeService = new StoreService();

// تحديد قواعد التحقق للإنشاء
export const createStoreValidation = [
  body('name')
    .notEmpty()
    .withMessage('اسم المحل مطلوب')
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم المحل يجب أن يكون بين 2-100 حرف'),
  body('code')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('كود المحل يجب أن يكون بين 1-20 حرف')
    .matches(/^[A-Za-z0-9_-]*$/)
    .withMessage('كود المحل يجب أن يحتوي على أحرف وأرقام فقط'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الوصف لا يجب أن يتجاوز 500 حرف'),
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('العنوان لا يجب أن يتجاوز 200 حرف'),
  body('phone')
    .optional()
    .custom((value) => {
      if (value && value.trim() === '') return true; // السماح بالقيم الفارغة
      return value.length <= 20;
    })
    .withMessage('رقم الهاتف لا يجب أن يتجاوز 20 رقم'),
  body('email')
    .optional()
    .custom((value) => {
      if (!value || value.trim() === '') return true; // السماح بالقيم الفارغة
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    })
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('manager')
    .optional()
    .isLength({ max: 100 })
    .withMessage('اسم المدير لا يجب أن يتجاوز 100 حرف'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false')
];

// تحديد قواعد التحقق للتحديث
export const updateStoreValidation = [
  body('code')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('كود المحل يجب أن يكون بين 1-20 حرف')
    .matches(/^[A-Za-z0-9_-]+$/)
    .withMessage('كود المحل يجب أن يحتوي على أحرف وأرقام فقط'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم المحل يجب أن يكون بين 2-100 حرف'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الوصف لا يجب أن يتجاوز 500 حرف'),
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('العنوان لا يجب أن يتجاوز 200 حرف'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('رقم الهاتف غير صحيح'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('manager')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم المدير يجب أن يكون بين 2-100 حرف'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('حالة التفعيل يجب أن تكون true أو false')
];

export class StoreController {
  // GET /api/stores - جلب جميع المحلات
  async getAllStores(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 طلب جلب جميع المحلات');
      const stores = await storeService.getAllStores();
      console.log('✅ تم جلب المحلات بنجاح:', stores.length);
      
      res.status(200).json({
        success: true,
        data: stores,
        message: 'تم جلب المحلات بنجاح'
      });
      return;
    } catch (error) {
      console.error('❌ خطأ في جلب المحلات:', error);
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب المحلات',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/stores/active - جلب المحلات النشطة فقط
  async getActiveStores(req: Request, res: Response): Promise<void> {
    try {
      const stores = await storeService.getActiveStores();
      
      res.status(200).json({
        success: true,
        data: stores,
        message: 'تم جلب المحلات النشطة بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب المحلات النشطة',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/stores/stats - جلب إحصائيات المحلات
  async getStoreStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await storeService.getStoreStats();
      
      res.status(200).json({
        success: true,
        data: stats,
        message: 'تم جلب إحصائيات المحلات بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب إحصائيات المحلات',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/stores/search - البحث في المحلات
  async searchStores(req: Request, res: Response): Promise<void> {
    try {
      const { search, isActive, page, limit } = req.query;
      
      const params = {
        search: search as string,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      };

      const result = await storeService.searchStores(params);
      
      res.status(200).json({
        success: true,
        data: result,
        message: 'تم البحث في المحلات بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في البحث في المحلات',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/stores/:id - جلب محل بالمعرف
  async getStoreById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const store = await storeService.getStoreById(id);
      
      if (!store) {
        res.status(404).json({
          success: false,
          message: 'المحل غير موجود'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: store,
        message: 'تم جلب المحل بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب المحل',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // POST /api/stores - إنشاء محل جديد
  async createStore(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 استلام طلب إنشاء محل:', JSON.stringify(req.body, null, 2));
      
      // التحقق من وجود اسم المحل على الأقل
      if (!req.body.name || req.body.name.trim() === '') {
        console.log('❌ اسم المحل مطلوب');
        res.status(400).json({
          success: false,
          message: 'اسم المحل مطلوب',
          errors: [{ field: 'name', message: 'اسم المحل مطلوب' }]
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

      console.log('✅ البيانات صحيحة، محاولة إنشاء المحل...');
      const storeData: CreateStoreData = req.body;
      const store = await storeService.createStore(storeData);
      console.log('✅ تم إنشاء المحل بنجاح:', store);

      res.status(201).json({
        success: true,
        data: store,
        message: 'تم إنشاء المحل بنجاح'
      });
      return;
    } catch (error) {
      console.error('❌ خطأ في إنشاء المحل:', error);
      res.status(400).json({
        success: false,
        message: 'خطأ في إنشاء المحل',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // PUT /api/stores/:id - تحديث محل
  async updateStore(req: Request, res: Response): Promise<void> {
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
      const updateData: UpdateStoreData = req.body;
      const store = await storeService.updateStore(id, updateData);

      res.status(200).json({
        success: true,
        data: store,
        message: 'تم تحديث المحل بنجاح'
      });
      return;
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في تحديث المحل',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // DELETE /api/stores/:id - حذف محل
  async deleteStore(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await storeService.deleteStore(id);

      res.status(200).json({
        success: true,
        message: 'تم حذف المحل بنجاح'
      });
      return;
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في حذف المحل',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // PATCH /api/stores/:id/toggle-status - تبديل حالة المحل
  async toggleStoreStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const store = await storeService.toggleStoreStatus(id);

      res.status(200).json({
        success: true,
        data: store,
        message: `تم ${store.isActive ? 'تفعيل' : 'إلغاء تفعيل'} المحل بنجاح`
      });
      return;
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في تبديل حالة المحل',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }
}
