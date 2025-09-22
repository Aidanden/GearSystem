import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController.js';
// import { authMiddleware } from '../middleware/auth.js'; // سيتم إضافة هذا لاحقاً

const router = Router();
const inventoryController = new InventoryController();

// GET /inventory - جلب تقرير المخزون العام
router.get('/', inventoryController.getInventoryReport.bind(inventoryController));

// GET /inventory/low-stock - جلب المنتجات منخفضة المخزون
router.get('/low-stock', inventoryController.getLowStockItems.bind(inventoryController));

// GET /inventory/out-of-stock - جلب المنتجات المنتهية من المخزون
router.get('/out-of-stock', inventoryController.getOutOfStockItems.bind(inventoryController));

// GET /inventory/category/:categoryId - جلب مخزون صنف معين
router.get('/category/:categoryId', inventoryController.getInventoryByCategory.bind(inventoryController));

// GET /inventory/product/:productId - جلب تفاصيل مخزون منتج معين
router.get('/product/:productId', inventoryController.getProductInventory.bind(inventoryController));

export default router;
