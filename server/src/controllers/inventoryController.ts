import { Request, Response } from 'express';
import { ProductService } from '../services/productService.js';
import { CategoryService } from '../services/categoryService.js';

const productService = new ProductService();
const categoryService = new CategoryService();

export class InventoryController {
  // GET /inventory - تقرير المخزون العام
  async getInventoryReport(req: Request, res: Response) {
    try {
      const products = await productService.getAllProducts();
      
      const inventoryStats = {
        totalProducts: products.length,
        totalValue: products.reduce((sum, product) => sum + (product.quantity * product.sellingPrice), 0),
        lowStockCount: products.filter(product => product.quantity <= product.minQuantity).length,
        outOfStockCount: products.filter(product => product.quantity === 0).length,
        categories: await categoryService.getActiveCategories()
      };

      res.status(200).json({
        success: true,
        data: {
          stats: inventoryStats,
          products: products
        },
        message: 'تم جلب تقرير المخزون بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب تقرير المخزون',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /inventory/low-stock - المنتجات منخفضة المخزون
  async getLowStockItems(req: Request, res: Response) {
    try {
      const lowStockProducts = await productService.getLowStockProducts();

      res.status(200).json({
        success: true,
        data: lowStockProducts,
        message: 'تم جلب المنتجات منخفضة المخزون بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب المنتجات منخفضة المخزون',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /inventory/out-of-stock - المنتجات المنتهية من المخزون
  async getOutOfStockItems(req: Request, res: Response) {
    try {
      const outOfStockProducts = await productService.getOutOfStockProducts();

      res.status(200).json({
        success: true,
        data: outOfStockProducts,
        message: 'تم جلب المنتجات المنتهية من المخزون بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب المنتجات المنتهية من المخزون',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /inventory/category/:categoryId - مخزون صنف معين
  async getInventoryByCategory(req: Request, res: Response) {
    try {
      const { categoryId } = req.params;
      const products = await productService.getProductsByCategory(categoryId);

      const categoryStats = {
        totalProducts: products.length,
        totalValue: products.reduce((sum, product) => sum + (product.quantity * product.sellingPrice), 0),
        lowStockCount: products.filter(product => product.quantity <= product.minQuantity).length,
        outOfStockCount: products.filter(product => product.quantity === 0).length
      };

      res.status(200).json({
        success: true,
        data: {
          stats: categoryStats,
          products: products
        },
        message: 'تم جلب مخزون الصنف بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب مخزون الصنف',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }

  // GET /inventory/product/:productId - تفاصيل مخزون منتج معين
  async getProductInventory(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const product = await productService.getProductById(productId);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'المنتج غير موجود'
        });
      }

      const inventoryDetails = {
        product: product,
        status: product.quantity === 0 ? 'نفد من المخزون' : 
                product.quantity <= product.minQuantity ? 'مخزون منخفض' : 'متوفر',
        totalValue: product.quantity * product.sellingPrice,
        needsReorder: product.quantity <= product.minQuantity
      };

      res.status(200).json({
        success: true,
        data: inventoryDetails,
        message: 'تم جلب تفاصيل المخزون بنجاح'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'خطأ في جلب تفاصيل المخزون',
        error: error instanceof Error ? error.message : 'خطأ غير معروف'
      });
    }
  }
}
