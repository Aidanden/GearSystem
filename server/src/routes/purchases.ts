import { Router } from 'express';
import { PurchaseController, createPurchaseValidation, updatePurchaseValidation } from '../controllers/purchaseController.js';
// import { authMiddleware } from '../middleware/auth.js'; // سيتم إضافة هذا لاحقاً

const router = Router();
const purchaseController = new PurchaseController();

// GET /api/purchases - جلب جميع فواتير الشراء
router.get('/', purchaseController.getAllPurchaseInvoices.bind(purchaseController));

// GET /api/purchases/pending - جلب الفواتير المعلقة
router.get('/pending', purchaseController.getPendingPurchaseInvoices.bind(purchaseController));

// GET /api/purchases/generate-invoice-number - توليد رقم فاتورة جديد
router.get('/generate-invoice-number', purchaseController.generateInvoiceNumber.bind(purchaseController));

// GET /api/purchases/search/:query - البحث في فواتير الشراء (يجب أن يكون قبل /:id)
router.get('/search/:query', purchaseController.searchPurchaseInvoices.bind(purchaseController));

// GET /api/purchases/supplier/:supplierId - فواتير مورد محدد
router.get('/supplier/:supplierId', purchaseController.getPurchaseInvoicesBySupplier.bind(purchaseController));

// GET /api/purchases/:id/print - طباعة فاتورة شراء
router.get('/:id/print', purchaseController.printPurchaseInvoice.bind(purchaseController));

// GET /api/purchases/:id - جلب فاتورة شراء محددة
router.get('/:id', purchaseController.getPurchaseInvoiceById.bind(purchaseController));

// POST /api/purchases - إنشاء فاتورة شراء جديدة
router.post('/', 
  // authMiddleware, // سيتم تفعيل هذا لاحقاً
  createPurchaseValidation, 
  purchaseController.createPurchaseInvoice.bind(purchaseController)
);

// PUT /api/purchases/:id - تحديث فاتورة شراء
router.put('/:id', 
  // authMiddleware, // سيتم تفعيل هذا لاحقاً
  updatePurchaseValidation, 
  purchaseController.updatePurchaseInvoice.bind(purchaseController)
);

// DELETE /api/purchases/:id - حذف فاتورة شراء
router.delete('/:id', 
  // authMiddleware, // سيتم تفعيل هذا لاحقاً
  purchaseController.deletePurchaseInvoice.bind(purchaseController)
);

export default router;
