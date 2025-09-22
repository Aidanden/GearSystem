import express from 'express';
import { 
  BranchProductPricingController,
  createBranchProductPricingValidation,
  updateBranchProductPricingValidation
} from '../controllers/branchProductPricingController.js';

const router = express.Router();
const branchProductPricingController = new BranchProductPricingController();

// GET /api/branch-product-pricing - جلب جميع أسعار المحلات
router.get('/', branchProductPricingController.getAllBranchProductPricing);

// GET /api/branch-product-pricing/branch/:branchId - جلب أسعار محل معين
router.get('/branch/:branchId', branchProductPricingController.getBranchPricing);

// GET /api/branch-product-pricing/product/:productId - جلب أسعار منتج في جميع المحلات
router.get('/product/:productId', branchProductPricingController.getProductPricingInBranches);

// GET /api/branch-product-pricing/:branchId/:productId - جلب سعر منتج في محل معين
router.get('/:branchId/:productId', branchProductPricingController.getBranchProductPrice);

// POST /api/branch-product-pricing - إنشاء أو تحديث سعر منتج في محل
router.post('/', createBranchProductPricingValidation, branchProductPricingController.setBranchProductPrice);

// PUT /api/branch-product-pricing/:id - تحديث سعر موجود
router.put('/:id', updateBranchProductPricingValidation, branchProductPricingController.updateBranchProductPrice);

// DELETE /api/branch-product-pricing/:id - حذف سعر (تعطيل)
router.delete('/:id', branchProductPricingController.deleteBranchProductPrice);

// GET /api/branch-product-pricing/search/:query - البحث في أسعار المحلات
router.get('/search/:query', branchProductPricingController.searchBranchProductPricing);

export default router;
