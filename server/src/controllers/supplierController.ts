import { Request, Response } from 'express';
import { SupplierService } from '../services/supplierService.js';
import { CreateSupplierData, UpdateSupplierData } from '../types/supplier.js';
import { body, validationResult } from 'express-validator';

const supplierService = new SupplierService();

// تحديد قواعد التحقق للإنشاء
export const createSupplierValidation = [
  body('code')
    .notEmpty()
    .withMessage('كود المورد مطلوب')
    .isLength({ min: 1, max: 20 })
    .withMessage('كود المورد يجب أن يكون بين 1-20 حرف'),
  body('name')
    .notEmpty()
    .withMessage('اسم المورد مطلوب')
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم المورد يجب أن يكون بين 2-100 حرف'),
  body('contactPerson')
    .optional()
    .isLength({ max: 100 })
    .withMessage('اسم الشخص المسؤول لا يجب أن يتجاوز 100 حرف'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('رقم الهاتف غير صحيح'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('العنوان لا يجب أن يتجاوز 200 حرف'),
  body('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('المدينة لا يجب أن تتجاوز 50 حرف'),
  body('country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('البلد لا يجب أن يتجاوز 50 حرف'),
  body('taxNumber')
    .optional()
    .isLength({ max: 30 })
    .withMessage('الرقم الضريبي لا يجب أن يتجاوز 30 حرف')
];

// تحديد قواعد التحقق للتحديث
export const updateSupplierValidation = [
  body('code')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('كود المورد يجب أن يكون بين 1-20 حرف'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم المورد يجب أن يكون بين 2-100 حرف'),
  body('contactPerson')
    .optional()
    .isLength({ max: 100 })
    .withMessage('اسم الشخص المسؤول لا يجب أن يتجاوز 100 حرف'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('رقم الهاتف غير صحيح'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('البريد الإلكتروني غير صحيح'),
  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('العنوان لا يجب أن يتجاوز 200 حرف'),
  body('city')
    .optional()
    .isLength({ max: 50 })
    .withMessage('المدينة لا يجب أن تتجاوز 50 حرف'),
  body('country')
    .optional()
    .isLength({ max: 50 })
    .withMessage('البلد لا يجب أن يتجاوز 50 حرف'),
  body('taxNumber')
    .optional()
    .isLength({ max: 30 })
    .withMessage('الرقم الضريبي لا يجب أن يتجاوز 30 حرف'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('حالة النشاط يجب أن تكون true أو false')
];

export class SupplierController {
  // GET /api/suppliers
  async getAllSuppliers(req: Request, res: Response): Promise<void> {
    try {
      console.log('📥 SupplierController.getAllSuppliers called');
      const { active } = req.query;
      
      let suppliers;
      if (active === 'true') {
        suppliers = await supplierService.getActiveSuppliers();
      } else {
        suppliers = await supplierService.getAllSuppliers();
      }

      res.status(200).json({
        success: true,
        data: suppliers,
        message: 'تم جلب الموردين بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب الموردين',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // GET /api/suppliers/:id
  async getSupplierById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const supplier = await supplierService.getSupplierById(id);

      if (!supplier) {
        res.status(404).json({
          success: false,
          message: 'المورد غير موجود'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: supplier,
        message: 'تم جلب المورد بنجاح'
      });
      return;
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب المورد',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // POST /api/suppliers
  async createSupplier(req: Request, res: Response): Promise<void> {
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

      const supplierData: CreateSupplierData = req.body;
      const supplier = await supplierService.createSupplier(supplierData);

      res.status(201).json({
        success: true,
        data: supplier,
        message: 'تم إنشاء المورد بنجاح'
      });
      return;
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في إنشاء المورد',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
      return;
    }
  }

  // PUT /api/suppliers/:id
  async updateSupplier(req: Request, res: Response) {
    try {
      // التحقق من صحة البيانات
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'خطأ في البيانات المدخلة',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const updateData: UpdateSupplierData = req.body;
      const supplier = await supplierService.updateSupplier(id, updateData);

      res.status(200).json({
        success: true,
        data: supplier,
        message: 'تم تحديث المورد بنجاح'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في تحديث المورد',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // DELETE /api/suppliers/:id
  async deleteSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await supplierService.deleteSupplier(id);

      res.status(200).json({
        success: true,
        message: 'تم حذف المورد بنجاح'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في حذف المورد',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /api/suppliers/search/:query
  async searchSuppliers(req: Request, res: Response) {
    try {
      const { query } = req.params;
      const suppliers = await supplierService.searchSuppliers(query);

      res.status(200).json({
        success: true,
        data: suppliers,
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
}

