import { Router, Request, Response, NextFunction } from 'express';
import { ProductController, createProductValidation, updateProductValidation, addQuantityValidation } from '../controllers/productController.js';
// import { authMiddleware } from '../middleware/auth.js'; // سيتم إضافة هذا لاحقاً

const router = Router();
const productController = new ProductController();

// GET /api/products - جلب جميع المنتجات
router.get('/', productController.getAllProducts.bind(productController));


// GET /api/products/search/:query - البحث في المنتجات (يجب أن يكون قبل /:id)
router.get('/search/:query', productController.searchProducts.bind(productController));

// GET /api/products/:id - جلب منتج محدد
router.get('/:id', productController.getProductById.bind(productController));

// POST /api/products - إنشاء منتج جديد
router.post('/', 
  // authMiddleware, // سيتم تفعيل هذا لاحقاً
  (req: Request, res: Response, next: NextFunction) => {
    console.log('🔍 Before validation - Body:', req.body);
    next();
  },
  createProductValidation, 
  (req: Request, res: Response, next: NextFunction) => {
    console.log('✅ After validation - proceeding to controller');
    next();
  },
  productController.createProduct.bind(productController)
);

// PUT /api/products/:id - تحديث منتج
router.put('/:id', 
  // authMiddleware, // سيتم تفعيل هذا لاحقاً
  updateProductValidation, 
  productController.updateProduct.bind(productController)
);

// DELETE /api/products/:id - حذف منتج
router.delete('/:id', 
  // authMiddleware, // سيتم تفعيل هذا لاحقاً
  productController.deleteProduct.bind(productController)
);

// POST /api/products/:id/add-quantity - إضافة كمية للمخزون
router.post('/:id/add-quantity', 
  // authMiddleware, // سيتم تفعيل هذا لاحقاً
  addQuantityValidation, 
  productController.addQuantity.bind(productController)
);

export default router;
