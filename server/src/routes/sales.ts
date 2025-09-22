import { Router } from 'express';
import { salesController, createSaleInvoiceValidation, updateSaleInvoiceValidation } from '../controllers/salesController.js';

const router = Router();

// GET /api/sales - جلب جميع فواتير البيع
router.get('/', salesController.getAllSaleInvoices.bind(salesController));

// GET /api/sales/stats - جلب إحصائيات المبيعات
router.get('/stats', salesController.getSalesStats.bind(salesController));

// GET /api/sales/search - البحث في فواتير البيع
router.get('/search', salesController.searchSaleInvoices.bind(salesController));

// GET /api/sales/:id - جلب فاتورة بيع بالمعرف
router.get('/:id', salesController.getSaleInvoiceById.bind(salesController));

// POST /api/sales - إنشاء فاتورة بيع جديدة
router.post('/', createSaleInvoiceValidation, salesController.createSaleInvoice.bind(salesController));

// PUT /api/sales/:id - تحديث فاتورة بيع
router.put('/:id', updateSaleInvoiceValidation, salesController.updateSaleInvoice.bind(salesController));

// DELETE /api/sales/:id - حذف فاتورة بيع
router.delete('/:id', salesController.deleteSaleInvoice.bind(salesController));

export default router;
