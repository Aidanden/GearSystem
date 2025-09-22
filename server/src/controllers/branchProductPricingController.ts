import { Request, Response } from 'express';
import { BranchProductPricingService, CreateBranchProductPricingData, UpdateBranchProductPricingData } from '../services/branchProductPricingService.js';
import { body, validationResult } from 'express-validator';

const branchProductPricingService = new BranchProductPricingService();

// تحديد قواعد التحقق لإنشاء سعر جديد
export const createBranchProductPricingValidation = [
  body('branchId')
    .notEmpty()
    .withMessage('معرف المحل مطلوب')
    .isLength({ min: 20, max: 30 })
    .withMessage('معرف المحل غير صحيح'),
  body('productId')
    .notEmpty()
    .withMessage('معرف المنتج مطلوب')
    .isLength({ min: 20, max: 30 })
    .withMessage('معرف المنتج غير صحيح'),
  body('transferPrice')
    .notEmpty()
    .withMessage('سعر التحويل مطلوب')
    .isFloat({ min: 0 })
    .withMessage('سعر التحويل يجب أن يكون رقماً موجباً'),
  body('retailPrice')
    .notEmpty()
    .withMessage('سعر البيع مطلوب')
    .isFloat({ min: 0 })
    .withMessage('سعر البيع يجب أن يكون رقماً موجباً'),
  body('wholesalePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('سعر الجملة يجب أن يكون رقماً موجباً'),
  body('effectiveDate')
    .optional()
    .isISO8601()
    .withMessage('تاريخ السريان غير صحيح')
];

// تحديد قواعد التحقق للتحديث
export const updateBranchProductPricingValidation = [
  body('transferPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('سعر التحويل يجب أن يكون رقماً موجباً'),
  body('retailPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('سعر البيع يجب أن يكون رقماً موجباً'),
  body('wholesalePrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('سعر الجملة يجب أن يكون رقماً موجباً'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('حالة النشاط يجب أن تكون true أو false'),
  body('effectiveDate')
    .optional()
    .isISO8601()
    .withMessage('تاريخ السريان غير صحيح')
];

export class BranchProductPricingController {
  // GET /api/branch-product-pricing
  async getAllBranchProductPricing(req: Request, res: Response): Promise<void> {
    try {
      const pricing = await branchProductPricingService.getAllBranchProductPricing();

      res.status(200).json({
        success: true,
        data: pricing,
        message: 'تم جلب أسعار المحلات بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب أسعار المحلات',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /api/branch-product-pricing/branch/:branchId
  async getBranchPricing(req: Request, res: Response): Promise<void> {
    try {
      const { branchId } = req.params;
      const pricing = await branchProductPricingService.getBranchPricing(branchId);

      res.status(200).json({
        success: true,
        data: pricing,
        message: 'تم جلب أسعار المحل بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب أسعار المحل',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /api/branch-product-pricing/product/:productId
  async getProductPricingInBranches(req: Request, res: Response): Promise<void> {
    try {
      const { productId } = req.params;
      const pricing = await branchProductPricingService.getProductPricingInBranches(productId);

      res.status(200).json({
        success: true,
        data: pricing,
        message: 'تم جلب أسعار المنتج في المحلات بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب أسعار المنتج',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /api/branch-product-pricing/:branchId/:productId
  async getBranchProductPrice(req: Request, res: Response): Promise<void> {
    try {
      const { branchId, productId } = req.params;
      const pricing = await branchProductPricingService.getBranchProductPrice(branchId, productId);

      if (!pricing) {
        res.status(404).json({
          success: false,
          message: 'لم يتم العثور على سعر للمنتج في هذا المحل'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: pricing,
        message: 'تم جلب السعر بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب السعر',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // POST /api/branch-product-pricing
  async setBranchProductPrice(req: Request, res: Response): Promise<void> {
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

      const { branchId, productId, transferPrice, retailPrice, wholesalePrice, effectiveDate } = req.body;
      
      const pricingData: CreateBranchProductPricingData = {
        branchId,
        productId,
        transferPrice: parseFloat(transferPrice),
        retailPrice: parseFloat(retailPrice),
        wholesalePrice: wholesalePrice ? parseFloat(wholesalePrice) : undefined,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined
      };

      const pricing = await branchProductPricingService.setBranchProductPrice(pricingData);

      res.status(201).json({
        success: true,
        data: pricing,
        message: 'تم تحديد سعر المنتج في المحل بنجاح'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في تحديد السعر',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // PUT /api/branch-product-pricing/:id
  async updateBranchProductPrice(req: Request, res: Response): Promise<void> {
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
      const updateData: UpdateBranchProductPricingData = req.body;

      if (updateData.transferPrice) {
        updateData.transferPrice = parseFloat(updateData.transferPrice.toString());
      }

      if (updateData.retailPrice) {
        updateData.retailPrice = parseFloat(updateData.retailPrice.toString());
      }

      if (updateData.wholesalePrice) {
        updateData.wholesalePrice = parseFloat(updateData.wholesalePrice.toString());
      }

      if (updateData.effectiveDate) {
        updateData.effectiveDate = new Date(updateData.effectiveDate);
      }

      const pricing = await branchProductPricingService.updateBranchProductPrice(id, updateData);

      res.status(200).json({
        success: true,
        data: pricing,
        message: 'تم تحديث السعر بنجاح'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في تحديث السعر',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // DELETE /api/branch-product-pricing/:id
  async deleteBranchProductPrice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await branchProductPricingService.deleteBranchProductPrice(id);

      res.status(200).json({
        success: true,
        message: 'تم حذف السعر بنجاح'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في حذف السعر',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /api/branch-product-pricing/search/:query
  async searchBranchProductPricing(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.params;
      const pricing = await branchProductPricingService.searchBranchProductPricing(query);

      res.status(200).json({
        success: true,
        data: pricing,
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
