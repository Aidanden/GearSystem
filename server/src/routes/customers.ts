import { Router } from 'express';
import { CustomerController, createCustomerValidation, updateCustomerValidation } from '../controllers/customerController.js';

const router = Router();
const customerController = new CustomerController();

// GET /api/customers - جلب جميع العملاء
router.get('/', customerController.getAllCustomers.bind(customerController));

// GET /api/customers/active - جلب العملاء النشطين فقط
router.get('/active', customerController.getActiveCustomers.bind(customerController));

// GET /api/customers/stats - جلب إحصائيات العملاء
router.get('/stats', customerController.getCustomerStats.bind(customerController));

// GET /api/customers/search - البحث في العملاء
router.get('/search', customerController.searchCustomers.bind(customerController));

// GET /api/customers/debt - جلب العملاء المدينين
router.get('/debt', customerController.getCustomersWithDebt.bind(customerController));

// GET /api/customers/type/:type - جلب العملاء حسب النوع
router.get('/type/:type', customerController.getCustomersByType.bind(customerController));

// GET /api/customers/:id - جلب عميل بالمعرف
router.get('/:id', customerController.getCustomerById.bind(customerController));

// POST /api/customers - إنشاء عميل جديد
router.post('/', createCustomerValidation, customerController.createCustomer.bind(customerController));

// PUT /api/customers/:id - تحديث عميل
router.put('/:id', updateCustomerValidation, customerController.updateCustomer.bind(customerController));

// DELETE /api/customers/:id - حذف عميل
router.delete('/:id', customerController.deleteCustomer.bind(customerController));

// PATCH /api/customers/:id/toggle-status - تبديل حالة العميل
router.patch('/:id/toggle-status', customerController.toggleCustomerStatus.bind(customerController));

// PATCH /api/customers/:id/balance - تحديث رصيد العميل
router.patch('/:id/balance', customerController.updateCustomerBalance.bind(customerController));

export default router;
