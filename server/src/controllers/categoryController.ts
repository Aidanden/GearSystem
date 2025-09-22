import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService.js';
import { CreateCategoryData, UpdateCategoryData } from '../types/category.js';
import { body, validationResult } from 'express-validator';

const categoryService = new CategoryService();

// تحديد قواعد التحقق للإنشاء
export const createCategoryValidation = [
  body('name')
    .notEmpty()
    .withMessage('اسم نوع السيارة مطلوب')
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم نوع السيارة يجب أن يكون بين 2-100 حرف'),
];

// تحديد قواعد التحقق للتحديث
export const updateCategoryValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('اسم نوع السيارة يجب أن يكون بين 2-100 حرف'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('حالة النشاط يجب أن تكون true أو false')
];

export class CategoryController {
  // GET /api/categories
  async getAllCategories(req: Request, res: Response) {
    try {
      const { active } = req.query;
      
      let categories;
      if (active === 'true') {
        categories = await categoryService.getActiveCategories();
      } else {
        categories = await categoryService.getAllCategories();
      }

      res.status(200).json({
        success: true,
        data: categories,
        message: 'تم جلب أنوع السيارة بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب أنوع السيارة',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /api/categories/:id
  async getCategoryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const category = await categoryService.getCategoryById(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'نوع السيارة غير موجود'
        });
      }

      res.status(200).json({
        success: true,
        data: category,
        message: 'تم جلب نوع السيارة بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب نوع السيارة',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // POST /api/categories
  async createCategory(req: Request, res: Response) {
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

      const categoryData: CreateCategoryData = req.body;
      const category = await categoryService.createCategory(categoryData);

      res.status(201).json({
        success: true,
        data: category,
        message: 'تم إنشاء نوع السيارة بنجاح'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في إنشاء نوع السيارة',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // PUT /api/categories/:id
  async updateCategory(req: Request, res: Response) {
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
      const updateData: UpdateCategoryData = req.body;
      const category = await categoryService.updateCategory(id, updateData);

      res.status(200).json({
        success: true,
        data: category,
        message: 'تم تحديث نوع السيارة بنجاح'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في تحديث نوع السيارة',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // DELETE /api/categories/:id
  async deleteCategory(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await categoryService.deleteCategory(id);

      res.status(200).json({
        success: true,
        message: 'تم حذف نوع السيارة بنجاح'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في حذف نوع السيارة',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /api/categories/search/:query
  async searchCategories(req: Request, res: Response) {
    try {
      const { query } = req.params;
      const categories = await categoryService.searchCategories(query);

      res.status(200).json({
        success: true,
        data: categories,
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

