import { Router } from 'express';
import { CategoryController, createCategoryValidation, updateCategoryValidation } from '../controllers/categoryController.js';
// import { authMiddleware } from '../middleware/auth.js'; // سيتم إضافة هذا لاحقاً

const router = Router();
const categoryController = new CategoryController();

// GET /api/categories - جلب جميع الأصناف
router.get('/', categoryController.getAllCategories.bind(categoryController));

// GET /api/categories/search/:query - البحث في الأصناف (يجب أن يكون قبل /:id)
router.get('/search/:query', categoryController.searchCategories.bind(categoryController));

// GET /api/categories/:id - جلب صنف محدد
router.get('/:id', categoryController.getCategoryById.bind(categoryController));

// POST /api/categories - إنشاء صنف جديد
router.post('/', 
  // authMiddleware, // سيتم تفعيل هذا لاحقاً
  createCategoryValidation, 
  categoryController.createCategory.bind(categoryController)
);

// PUT /api/categories/:id - تحديث صنف
router.put('/:id', 
  // authMiddleware, // سيتم تفعيل هذا لاحقاً
  updateCategoryValidation, 
  categoryController.updateCategory.bind(categoryController)
);

// DELETE /api/categories/:id - حذف صنف
router.delete('/:id', 
  // authMiddleware, // سيتم تفعيل هذا لاحقاً
  categoryController.deleteCategory.bind(categoryController)
);

export default router;
