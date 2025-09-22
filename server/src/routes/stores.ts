import { Router } from 'express';
import { StoreController, createStoreValidation, updateStoreValidation } from '../controllers/storeController.js';

const router = Router();
const storeController = new StoreController();

// GET /api/stores - جلب جميع المحلات
router.get('/', storeController.getAllStores.bind(storeController));

// GET /api/stores/active - جلب المحلات النشطة فقط
router.get('/active', storeController.getActiveStores.bind(storeController));

// GET /api/stores/stats - جلب إحصائيات المحلات
router.get('/stats', storeController.getStoreStats.bind(storeController));

// GET /api/stores/search - البحث في المحلات
router.get('/search', storeController.searchStores.bind(storeController));

// GET /api/stores/:id - جلب محل بالمعرف
router.get('/:id', storeController.getStoreById.bind(storeController));

// POST /api/stores - إنشاء محل جديد
router.post('/', createStoreValidation, storeController.createStore.bind(storeController));

// PUT /api/stores/:id - تحديث محل
router.put('/:id', updateStoreValidation, storeController.updateStore.bind(storeController));

// DELETE /api/stores/:id - حذف محل
router.delete('/:id', storeController.deleteStore.bind(storeController));

// PATCH /api/stores/:id/toggle-status - تبديل حالة المحل
router.patch('/:id/toggle-status', storeController.toggleStoreStatus.bind(storeController));

export default router;
