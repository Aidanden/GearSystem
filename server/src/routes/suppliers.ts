import { Router } from 'express';
import { SupplierController, createSupplierValidation, updateSupplierValidation } from '../controllers/supplierController.js';
// import { authMiddleware } from '../middleware/auth.js'; // سيتم إضافة هذا لاحقاً

const router = Router();
const supplierController = new SupplierController();

// GET /api/suppliers - جلب جميع الموردين
router.get('/', supplierController.getAllSuppliers.bind(supplierController));

// GET /api/suppliers/search/:query - البحث في الموردين (يجب أن يكون قبل /:id)
router.get('/search/:query', supplierController.searchSuppliers.bind(supplierController));

// GET /api/suppliers/:id - جلب مورد محدد
router.get('/:id', supplierController.getSupplierById.bind(supplierController));

// POST /api/suppliers - إنشاء مورد جديد
router.post('/', 
  // authMiddleware, // سيتم تفعيل هذا لاحقاً
  createSupplierValidation, 
  supplierController.createSupplier.bind(supplierController)
);

// PUT /api/suppliers/:id - تحديث مورد
router.put('/:id', 
  // authMiddleware, // سيتم تفعيل هذا لاحقاً
  updateSupplierValidation, 
  supplierController.updateSupplier.bind(supplierController)
);

// DELETE /api/suppliers/:id - حذف مورد
router.delete('/:id', 
  // authMiddleware, // سيتم تفعيل هذا لاحقاً
  supplierController.deleteSupplier.bind(supplierController)
);

export default router;
