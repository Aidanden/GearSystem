import { Request, Response } from 'express';
import { ProductService, CreateProductData, UpdateProductData } from '../services/productService.js';
import { body, validationResult } from 'express-validator';

const productService = new ProductService();

// تحديد قواعد التحقق للإنشاء
export const createProductValidation = [
  body('code')
    .notEmpty()
    .withMessage('كود القطعة الغيار مطلوب')
    .isLength({ min: 1, max: 20 })
    .withMessage('كود القطعة الغيار يجب أن يكون بين 1-20 حرف'),
  body('name')
    .notEmpty()
    .withMessage('اسم القطعة الغيار مطلوب')
    .isLength({ min: 2, max: 150 })
    .withMessage('اسم القطعة الغيار يجب أن يكون بين 2-150 حرف'),
  body('categoryId')
    .notEmpty()
    .withMessage('الصنف مطلوب')
    .isLength({ min: 20, max: 30 })
    .withMessage('معرف الصنف غير صحيح'),
  body('unit')
    .notEmpty()
    .withMessage('وحدة القياس مطلوبة')
    .isLength({ min: 1, max: 20 })
    .withMessage('وحدة القياس يجب أن تكون بين 1-20 حرف'),
  body('barcode')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 8, max: 20 })
    .withMessage('الباركود يجب أن يكون بين 8-20 حرف'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ max: 500 })
    .withMessage('الوصف لا يجب أن يتجاوز 500 حرف'),
  body('carModel')
    .notEmpty()
    .withMessage('موديل السيارة مطلوب')
    .isLength({ min: 1, max: 100 })
    .withMessage('موديل السيارة يجب أن يكون بين 1-100 حرف'),
  body('carYear')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 1, max: 20 })
    .withMessage('سنة السيارة يجب أن تكون بين 1-20 حرف'),
  body('originalPartNumber')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 1, max: 50 })
    .withMessage('رقم القطعة الأصلي يجب أن يكون بين 1-50 حرف'),
  body('initialQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('الكمية الأولية يجب أن تكون رقماً موجباً'),
  body('unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('سعر الوحدة يجب أن يكون رقماً موجباً')
];

// تحديد قواعد التحقق للتحديث
export const updateProductValidation = [
  body('code')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('كود القطعة الغيار يجب أن يكون بين 1-20 حرف'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 150 })
    .withMessage('اسم القطعة الغيار يجب أن يكون بين 2-150 حرف'),
  body('categoryId')
    .optional()
    .isLength({ min: 20, max: 30 })
    .withMessage('معرف الصنف غير صحيح'),
  body('unit')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('وحدة القياس يجب أن تكون بين 1-20 حرف'),
  body('barcode')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('الباركود يجب أن يكون بين 8-20 حرف'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('الوصف لا يجب أن يتجاوز 500 حرف'),
  body('carModel')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('موديل السيارة يجب أن يكون بين 1-100 حرف'),
  body('carYear')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 1, max: 20 })
    .withMessage('سنة السيارة يجب أن تكون بين 1-20 حرف'),
  body('originalPartNumber')
    .optional({ nullable: true, checkFalsy: true })
    .isLength({ min: 1, max: 50 })
    .withMessage('رقم القطعة الأصلي يجب أن يكون بين 1-50 حرف'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('حالة النشاط يجب أن تكون true أو false'),
  body('unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('سعر الوحدة يجب أن يكون رقماً موجباً')
];

// قواعد التحقق لإضافة كمية
export const addQuantityValidation = [
  body('quantity')
    .notEmpty()
    .withMessage('الكمية مطلوبة')
    .isInt({ min: 1 })
    .withMessage('الكمية يجب أن تكون رقماً موجباً'),
  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('سعر التكلفة يجب أن يكون رقماً موجباً')
];

export class ProductController {
  // GET /api/products
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const { active } = req.query;
      
      let products;
      if (active === 'true') {
        products = await productService.getActiveProducts();
      } else {
        products = await productService.getAllProducts();
      }

      res.status(200).json({
        success: true,
        data: products,
        message: 'تم جلب القطعة الغيارات بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب القطعة الغيارات',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }


  // GET /api/products/:id
  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      if (!product) {
        res.status(404).json({
          success: false,
          message: 'القطعة الغيار غير موجود'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: product,
        message: 'تم جلب القطعة الغيار بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب القطعة الغيار',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // POST /api/products
  async createProduct(req: Request, res: Response): Promise<void> {
    try {
      console.log('Received request body:', req.body);
      
      // التحقق من صحة البيانات
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        res.status(400).json({
          success: false,
          message: 'خطأ في البيانات المدخلة',
          errors: errors.array()
        });
        return;
      }

      // استخراج جميع البيانات المطلوبة للقطعة الغيار
      const { 
        code, 
        barcode, 
        name, 
        description, 
        categoryId, 
        unit, 
        carModel,
        carYear,
        originalPartNumber,
        unitPrice,
        initialQuantity 
      } = req.body;
      
      const productData: CreateProductData = {
        code,
        barcode,
        name,
        description,
        categoryId,
        unit,
        carModel,
        carYear,
        originalPartNumber,
        unitPrice,
        initialQuantity
      };
      
      console.log('Sending to service:', productData);
      const product = await productService.createProduct(productData);

      res.status(201).json({
        success: true,
        data: product,

        message: 'تم اضافة قطعة الغيار بنجاح'
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(400).json({
        success: false,
        message: 'خطأ في اضافة قطعة الغيار',
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
        details: error instanceof Error ? error.stack : error
      });
    }
  }

  // PUT /api/products/:id
  async updateProduct(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'خطأ في البيانات المدخلة',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const updateData: UpdateProductData = req.body;
      const product = await productService.updateProduct(id, updateData);

      res.status(200).json({
        success: true,
        data: product,
        message: 'تم تحديث قطعة الغيار بنجاح'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في تحديث القطعة الغيار',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // DELETE /api/products/:id
  async deleteProduct(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id);

      res.status(200).json({
        success: true,
        message: 'تم حذف القطعة الغيار بنجاح'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في حذف القطعة الغيار',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // POST /api/products/:id/add-quantity
  async addQuantity(req: Request, res: Response): Promise<void> {
    try {
      // التحقق من صحة البيانات
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'خطأ في البيانات المدخلة',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const { quantity, costPrice = 0 } = req.body;

      await productService.addInventoryQuantity(id, quantity, costPrice);

      const updatedProduct = await productService.getProductById(id);

      res.status(200).json({
        success: true,
        data: updatedProduct,
        message: 'تم إضافة الكمية بنجاح'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'خطأ في إضافة الكمية',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /api/products/search/:query
  async searchProducts(req: Request, res: Response): Promise<void> {
    try {
      const { query } = req.params;
      const products = await productService.searchProducts(query);

      res.status(200).json({
        success: true,
        data: products,
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

