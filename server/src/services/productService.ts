import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateProductData {
  code: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: string;
  unit: string;
  carModel: string;
  carYear?: string;
  originalPartNumber?: string;
  unitPrice?: number; // سعر الوحدة الأساسي
  initialQuantity?: number; // الكمية الأولية عند إنشاء المنتج
}

export interface UpdateProductData {
  code?: string;
  barcode?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  unit?: string;
  unitPrice?: number; // سعر الوحدة الأساسي
  isActive?: boolean;
}

export interface ProductWithInventory {
  id: string;
  code: string;
  barcode?: string | null;
  name: string;
  description?: string | null;
  categoryId: string;
  unit: string;
  carModel: string;
  carYear?: string | null;
  originalPartNumber?: string | null;
  unitPrice?: number | null; // سعر الوحدة الأساسي
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: string;
    code: string;
    name: string;
  };
  inventoryItems: {
    id: string;
    quantity: number;
    reservedQty: number;
    lastCostPrice: number;
    averageCost: number;
    lastUpdated: Date;
  }[];
  branchProductPrices?: {
    id: string;
    branchId: string;
    transferPrice: number;
    retailPrice: number;
    wholesalePrice?: number;
    isActive: boolean;
    branch: {
      id: string;
      code: string;
      name: string;
    };
  }[];
}

export class ProductService {
  // إحضار جميع المنتجات مع المخزون
  async getAllProducts(): Promise<ProductWithInventory[]> {
    return await prisma.product.findMany({
      include: {
        category: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        inventoryItems: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) as any;
  }

  // إحضار المنتجات النشطة فقط
  async getActiveProducts(): Promise<ProductWithInventory[]> {
    return await prisma.product.findMany({
      where: {
        isActive: true
      },
      include: {
        category: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        inventoryItems: true
      },
      orderBy: {
        name: 'asc'
      }
    }) as any;
  }

  // إحضار منتج بواسطة ID
  async getProductById(id: string): Promise<ProductWithInventory | null> {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        inventoryItems: true
      }
    }) as any;
  }

  // إحضار منتج بواسطة الكود
  async getProductByCode(code: string): Promise<ProductWithInventory | null> {
    return await prisma.product.findUnique({
      where: { code },
      include: {
        category: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        inventoryItems: true
      }
    }) as any;
  }

  // إنشاء منتج جديد
  async createProduct(data: CreateProductData): Promise<ProductWithInventory> {
    console.log('ProductService.createProduct called with:', data);
    
    // التحقق من عدم تكرار الكود
    const existingProduct = await this.getProductByCode(data.code);
    if (existingProduct) {
      throw new Error('كود المنتج موجود مسبقاً');
    }

    // التحقق من عدم تكرار الباركود إذا تم إدخاله
    if (data.barcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: { barcode: data.barcode }
      });
      if (existingBarcode) {
        throw new Error('الباركود موجود مسبقاً');
      }
    }

    // التحقق من وجود الصنف
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId }
    });
    if (!category) {
      throw new Error('الصنف غير موجود');
    }

    const { initialQuantity, ...productData } = data;

    return await prisma.$transaction(async (tx) => {
      // إنشاء المنتج
      const product = await tx.product.create({
        data: productData,
        include: {
          category: {
            select: {
              id: true,
              code: true,
              name: true
            }
          },
          inventoryItems: true
        }
      });

      // إنشاء سجل مخزون إذا كانت هناك كمية أولية
      if (initialQuantity && initialQuantity > 0) {
        await tx.inventoryItem.create({
          data: {
            productId: product.id,
            quantity: initialQuantity,
            reservedQty: 0,
            lastCostPrice: 0,
            averageCost: 0
          }
        });

        // إحضار المنتج مع المخزون المحدث
        return await tx.product.findUnique({
          where: { id: product.id },
          include: {
            category: {
              select: {
                id: true,
                code: true,
                name: true
              }
            },
            inventoryItems: true
          }
        }) as any;
      }

      return product as any;
    });
  }

  // تحديث منتج
  async updateProduct(id: string, data: UpdateProductData): Promise<ProductWithInventory> {
    // إذا كان هناك كود جديد، تحقق من عدم تكراره
    if (data.code) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          code: data.code,
          NOT: { id }
        }
      });
      if (existingProduct) {
        throw new Error('كود المنتج موجود مسبقاً');
      }
    }

    // إذا كان هناك باركود جديد، تحقق من عدم تكراره
    if (data.barcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: {
          barcode: data.barcode,
          NOT: { id }
        }
      });
      if (existingBarcode) {
        throw new Error('الباركود موجود مسبقاً');
      }
    }

    // إذا كان هناك صنف جديد، تحقق من وجوده
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId }
      });
      if (!category) {
        throw new Error('الصنف غير موجود');
      }
    }

    return await prisma.product.update({
      where: { id },
      data,
      include: {
        category: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        inventoryItems: true
      }
    }) as any;
  }

  // حذف منتج
  async deleteProduct(id: string): Promise<void> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        inventoryItems: true,
        purchaseInvoiceItems: true,
        saleInvoiceItems: true
      }
    });

    if (!product) {
      throw new Error('المنتج غير موجود');
    }

    // التحقق من وجود حركات على المنتج
    if (product.purchaseInvoiceItems.length > 0 || product.saleInvoiceItems.length > 0) {
      throw new Error('لا يمكن حذف منتج له حركات شراء أو بيع');
    }

    await prisma.$transaction(async (tx) => {
      // حذف سجلات المخزون
      await tx.inventoryItem.deleteMany({
        where: { productId: id }
      });

      // حذف المنتج
      await tx.product.delete({
        where: { id }
      });
    });
  }

  // البحث في المنتجات
  async searchProducts(query: string): Promise<ProductWithInventory[]> {
    return await prisma.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            code: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            barcode: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ],
        isActive: true
      },
      include: {
        category: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        inventoryItems: true
      },
      orderBy: {
        name: 'asc'
      }
    }) as any;
  }

  // إضافة كمية للمخزون
  async addInventoryQuantity(productId: string, quantity: number, costPrice: number = 0): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // البحث عن سجل المخزون الموجود
      let inventoryItem = await tx.inventoryItem.findUnique({
        where: { productId }
      });

      if (inventoryItem) {
        // تحديث السجل الموجود
        const newQuantity = inventoryItem.quantity + quantity;
        let newAverageCost = Number(inventoryItem.averageCost);

        // حساب متوسط التكلفة الجديد إذا كان هناك سعر تكلفة
        if (costPrice > 0 && quantity > 0) {
          const totalCurrentValue = inventoryItem.quantity * Number(inventoryItem.averageCost);
          const newValue = quantity * costPrice;
          newAverageCost = (totalCurrentValue + newValue) / newQuantity;
        }

        await tx.inventoryItem.update({
          where: { productId },
          data: {
            quantity: newQuantity,
            lastCostPrice: costPrice > 0 ? costPrice : Number(inventoryItem.lastCostPrice),
            averageCost: Number(newAverageCost),
            lastUpdated: new Date()
          }
        });
      } else {
        // إنشاء سجل جديد
        await tx.inventoryItem.create({
          data: {
            productId,
            quantity,
            reservedQty: 0,
            lastCostPrice: costPrice,
            averageCost: costPrice
          }
        });
      }
    });
  }

}

