import { PrismaClient } from '@prisma/client';
import {
  BranchSaleInvoice,
  BranchSaleInvoiceItem,
  CreateBranchSaleInvoiceData,
  UpdateBranchSaleInvoiceData,
  BranchSaleInvoiceSearchParams,
  BranchInventory,
  CreateBranchInventoryData,
  UpdateBranchInventoryData,
  BranchCustomerSale,
  CreateBranchCustomerSaleData,
  UpdateBranchCustomerSaleData,
  BranchCustomerSaleSearchParams,
  BranchSalesStats,
  PaymentMethod,
  PaymentType,
  InvoiceStatus
} from '../types/sales.js';

const prisma = new PrismaClient();

export class BranchSalesService {
  // ===== فواتير البيع للمحلات التابعة =====

  // جلب جميع فواتير البيع للمحلات
  async getAllBranchSaleInvoices(): Promise<BranchSaleInvoice[]> {
    const invoices = await prisma.branchSaleInvoice.findMany({
      include: {
        branch: true,
        customer: true,
        user: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) as any[];

    return invoices.map(invoice => ({
      ...invoice,
      totalAmount: Number(invoice.totalAmount || 0),
      discount: Number(invoice.discount || 0),
      netAmount: Number(invoice.netAmount || 0)
    })) as BranchSaleInvoice[];
  }

  // جلب فاتورة بيع محل بالمعرف
  async getBranchSaleInvoiceById(id: string): Promise<BranchSaleInvoice | null> {
    const invoice = await prisma.branchSaleInvoice.findUnique({
      where: { id },
      include: {
        branch: true,
        customer: true,
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    }) as any;

    if (!invoice) return null;

    return {
      ...invoice,
      totalAmount: Number(invoice.totalAmount || 0),
      discount: Number(invoice.discount || 0),
      netAmount: Number(invoice.netAmount || 0)
    } as BranchSaleInvoice;
  }

  // توليد رقم فاتورة بيع محل تلقائي
  private async generateBranchInvoiceNumber(): Promise<string> {
    const count = await prisma.branchSaleInvoice.count();
    const nextNumber = count + 1;
    return `BINV${nextNumber.toString().padStart(6, '0')}`;
  }

  // إنشاء فاتورة بيع للمحل التابع
  async createBranchSaleInvoice(data: CreateBranchSaleInvoiceData, userId: string): Promise<BranchSaleInvoice> {
    // التحقق من وجود المحل
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId }
    });

    if (!branch) {
      throw new Error('المحل غير موجود');
    }

    // حساب المجاميع
    let totalAmount = 0;
    const processedItems = [];

    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });

      if (!product) {
        throw new Error(`المنتج غير موجود: ${item.productId}`);
      }

      // التحقق من توفر الكمية في المخزون الرئيسي
      const inventoryItem = await prisma.inventoryItem.findFirst({
        where: { productId: item.productId }
      });

      if (!inventoryItem || inventoryItem.quantity < item.quantity) {
        throw new Error(`الكمية المطلوبة غير متوفرة للمنتج: ${product.name}`);
      }

      const itemTotal = item.quantity * item.unitPrice;
      totalAmount += itemTotal;

      processedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        branchSalePrice: item.branchSalePrice,
        totalPrice: itemTotal,
        transferPrice: item.transferPrice
      });
    }

    const discount = data.discount || 0;
    const netAmount = totalAmount - discount;

    // توليد رقم الفاتورة
    const invoiceNumber = await this.generateBranchInvoiceNumber();

    // إنشاء الفاتورة
    const invoice = await prisma.branchSaleInvoice.create({
      data: {
        invoiceNumber,
        branchId: data.branchId,
        userId,
        invoiceDate: data.invoiceDate,
        paymentMethod: data.paymentMethod,
        totalAmount,
        discount,
        netAmount,
        notes: data.notes,
        items: {
          create: processedItems
        }
      },
      include: {
        branch: true,
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    }) as any;

    // تحديث المخزون الرئيسي وإضافة للمحل
    for (const item of processedItems) {
      // تقليل من المخزون الرئيسي
      await prisma.inventoryItem.updateMany({
        where: { productId: item.productId },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });

      // إضافة أو تحديث مخزون المحل
      const existingBranchInventory = await prisma.branchInventory.findFirst({
        where: {
          branchId: data.branchId,
          sparePartId: item.productId
        }
      });

      if (existingBranchInventory) {
        await prisma.branchInventory.update({
          where: { id: existingBranchInventory.id },
          data: {
            quantity: {
              increment: item.quantity
            },
            branchSalePrice: item.branchSalePrice
          }
        });
      } else {
        await prisma.branchInventory.create({
          data: {
            branchId: data.branchId,
            sparePartId: item.productId,
            quantity: item.quantity,
            branchSalePrice: item.branchSalePrice
          }
        });
      }
    }

    return {
      ...invoice,
      totalAmount: Number(invoice.totalAmount || 0),
      discount: Number(invoice.discount || 0),
      netAmount: Number(invoice.netAmount || 0)
    } as BranchSaleInvoice;
  }

  // ===== مخزون المحلات =====

  // جلب مخزون محل معين
  async getBranchInventory(branchId: string): Promise<BranchInventory[]> {
    const inventory = await prisma.branchInventory.findMany({
      where: { branchId },
      include: {
        branch: true,
        sparePart: true
      },
      orderBy: {
        lastUpdated: 'desc'
      }
    }) as any[];

    return inventory.map(item => ({
      ...item,
      branchSalePrice: Number(item.branchSalePrice || 0)
    })) as BranchInventory[];
  }

  // جلب عنصر مخزون محل بالمعرف
  async getBranchInventoryById(id: string): Promise<BranchInventory | null> {
    const item = await prisma.branchInventory.findUnique({
      where: { id },
      include: {
        branch: true,
        sparePart: true
      }
    }) as any;

    if (!item) return null;

    return {
      ...item,
      branchSalePrice: Number(item.branchSalePrice || 0)
    } as BranchInventory;
  }

  // تحديث مخزون محل
  async updateBranchInventory(id: string, data: UpdateBranchInventoryData): Promise<BranchInventory> {
    const existingItem = await this.getBranchInventoryById(id);
    if (!existingItem) {
      throw new Error('عنصر المخزون غير موجود');
    }

    const updatedItem = await prisma.branchInventory.update({
      where: { id },
      data: {
        quantity: data.quantity,
        branchSalePrice: data.branchSalePrice
      },
      include: {
        branch: true,
        sparePart: true
      }
    }) as any;

    return {
      ...updatedItem,
      branchSalePrice: Number(updatedItem.branchSalePrice || 0)
    } as BranchInventory;
  }

  // ===== فواتير بيع المحلات للعملاء =====

  // جلب جميع فواتير بيع المحلات للعملاء
  async getAllBranchCustomerSales(): Promise<BranchCustomerSale[]> {
    const sales = await prisma.branchCustomerSale.findMany({
      include: {
        branch: true,
        customer: true,
        items: {
          include: {
            sparePart: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) as any[];

    return sales.map(sale => ({
      ...sale,
      subtotal: Number(sale.subtotal || 0),
      taxAmount: Number(sale.taxAmount || 0),
      discountAmount: Number(sale.discountAmount || 0),
      totalAmount: Number(sale.totalAmount || 0),
      paidAmount: Number(sale.paidAmount || 0),
      remainingAmount: Number(sale.remainingAmount || 0)
    })) as BranchCustomerSale[];
  }

  // جلب فاتورة بيع محل للعميل بالمعرف
  async getBranchCustomerSaleById(id: string): Promise<BranchCustomerSale | null> {
    const sale = await prisma.branchCustomerSale.findUnique({
      where: { id },
      include: {
        branch: true,
        customer: true,
        items: {
          include: {
            sparePart: true
          }
        }
      }
    }) as any;

    if (!sale) return null;

    return {
      ...sale,
      subtotal: Number(sale.subtotal || 0),
      taxAmount: Number(sale.taxAmount || 0),
      discountAmount: Number(sale.discountAmount || 0),
      totalAmount: Number(sale.totalAmount || 0),
      paidAmount: Number(sale.paidAmount || 0),
      remainingAmount: Number(sale.remainingAmount || 0)
    } as BranchCustomerSale;
  }

  // توليد رقم فاتورة بيع محل للعميل تلقائي
  private async generateBranchCustomerSaleNumber(): Promise<string> {
    const count = await prisma.branchCustomerSale.count();
    const nextNumber = count + 1;
    return `BSALE${nextNumber.toString().padStart(6, '0')}`;
  }

  // إنشاء فاتورة بيع محل للعميل
  async createBranchCustomerSale(data: CreateBranchCustomerSaleData): Promise<BranchCustomerSale> {
    // التحقق من وجود المحل
    const branch = await prisma.branch.findUnique({
      where: { id: data.branchId }
    });

    if (!branch) {
      throw new Error('المحل غير موجود');
    }

    // حساب المجاميع
    let subtotal = 0;
    const processedItems = [];

    for (const item of data.items) {
      // التحقق من توفر الكمية في مخزون المحل
      const branchInventoryItem = await prisma.branchInventory.findFirst({
        where: {
          branchId: data.branchId,
          sparePartId: item.sparePartId
        }
      });

      if (!branchInventoryItem || branchInventoryItem.quantity < item.quantity) {
        const product = await prisma.product.findUnique({
          where: { id: item.sparePartId }
        });
        throw new Error(`الكمية المطلوبة غير متوفرة في المحل للمنتج: ${product?.name || 'غير معروف'}`);
      }

      // فرض استخدام السعر المحدد للمحل
      const mandatoryPrice = Number(branchInventoryItem.branchSalePrice);
      
      // التحقق من أن السعر المدخل يطابق السعر المحدد للمحل
      if (Number(item.unitPrice) !== mandatoryPrice) {
        const product = await prisma.product.findUnique({
          where: { id: item.sparePartId }
        });
        throw new Error(`سعر البيع يجب أن يكون ${mandatoryPrice} للمنتج: ${product?.name || 'غير معروف'}. السعر المحدد للمحل لا يمكن تغييره.`);
      }

      const itemTotal = item.quantity * mandatoryPrice;
      subtotal += itemTotal;

      processedItems.push({
        sparePartId: item.sparePartId,
        quantity: item.quantity,
        unitPrice: mandatoryPrice,
        totalPrice: itemTotal
      });
    }

    const taxAmount = data.taxAmount || 0;
    const discountAmount = data.discountAmount || 0;
    const totalAmount = subtotal + taxAmount - discountAmount;
    const paidAmount = data.paidAmount || 0;
    const remainingAmount = totalAmount - paidAmount;

    // توليد رقم الفاتورة
    const invoiceNumber = await this.generateBranchCustomerSaleNumber();

    // إنشاء الفاتورة
    const sale = await prisma.branchCustomerSale.create({
      data: {
        invoiceNumber,
        branchId: data.branchId,
        customerId: data.customerId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        invoiceDate: data.invoiceDate,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        paidAmount,
        remainingAmount,
        paymentType: data.paymentType,
        status: InvoiceStatus.COMPLETED,
        notes: data.notes,
        items: {
          create: processedItems
        }
      },
      include: {
        branch: true,
        customer: true,
        items: {
          include: {
            sparePart: true
          }
        }
      }
    }) as any;

    // تحديث مخزون المحل
    for (const item of processedItems) {
      await prisma.branchInventory.updateMany({
        where: {
          branchId: data.branchId,
          sparePartId: item.sparePartId
        },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });
    }

    // تحديث رصيد العميل إذا كان الدفع آجل
    if (data.customerId && data.paymentType === PaymentType.CREDIT) {
      await prisma.customer.update({
        where: { id: data.customerId },
        data: {
          currentBalance: {
            increment: remainingAmount
          }
        }
      });
    }

    return {
      ...sale,
      subtotal: Number(sale.subtotal || 0),
      taxAmount: Number(sale.taxAmount || 0),
      discountAmount: Number(sale.discountAmount || 0),
      totalAmount: Number(sale.totalAmount || 0),
      paidAmount: Number(sale.paidAmount || 0),
      remainingAmount: Number(sale.remainingAmount || 0)
    } as BranchCustomerSale;
  }

  // البحث في فواتير بيع المحلات للعملاء
  async searchBranchCustomerSales(params: BranchCustomerSaleSearchParams): Promise<{
    sales: BranchCustomerSale[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { search, branchId, customerId, paymentType, status, startDate, endDate, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (branchId) where.branchId = branchId;
    if (customerId) where.customerId = customerId;
    if (paymentType) where.paymentType = paymentType;
    if (status) where.status = status;

    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) where.invoiceDate.gte = startDate;
      if (endDate) where.invoiceDate.lte = endDate;
    }

    const [sales, total] = await Promise.all([
      prisma.branchCustomerSale.findMany({
        where,
        include: {
          branch: true,
          customer: true,
          items: {
            include: {
              sparePart: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.branchCustomerSale.count({ where })
    ]);

    const processedSales = sales.map(sale => ({
      ...sale,
      subtotal: Number((sale as any).subtotal || 0),
      taxAmount: Number((sale as any).taxAmount || 0),
      discountAmount: Number((sale as any).discountAmount || 0),
      totalAmount: Number((sale as any).totalAmount || 0),
      paidAmount: Number((sale as any).paidAmount || 0),
      remainingAmount: Number((sale as any).remainingAmount || 0)
    })) as BranchCustomerSale[];

    return {
      sales: processedSales,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // إحصائيات مبيعات محل معين
  async getBranchSalesStats(branchId: string): Promise<BranchSalesStats> {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId }
    });

    if (!branch) {
      throw new Error('المحل غير موجود');
    }

    const [totalSalesData, revenueData, inventoryData, topProducts] = await Promise.all([
      prisma.branchCustomerSale.count({
        where: { branchId }
      }),
      prisma.branchCustomerSale.aggregate({
        where: { branchId },
        _sum: {
          totalAmount: true
        }
      }) as any,
      prisma.branchInventory.aggregate({
        where: { branchId },
        _sum: {
          quantity: true
        }
      }),
      prisma.branchCustomerSaleItem.groupBy({
        by: ['sparePartId'],
        where: {
          branchCustomerSale: {
            branchId
          }
        },
        _sum: {
          quantity: true,
          totalPrice: true
        },
        orderBy: {
          _sum: {
            quantity: 'desc'
          }
        },
        take: 10
      })
    ]);

    const topSellingProducts = await Promise.all(
      topProducts.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.sparePartId }
        });
        return {
          productId: item.sparePartId,
          productName: product?.name || 'غير معروف',
          totalQuantity: item._sum.quantity || 0,
          totalRevenue: Number(item._sum.totalPrice || 0)
        };
      })
    );

    return {
      branchId,
      branchName: branch.name,
      totalSales: totalSalesData,
      totalRevenue: Number(revenueData._sum.totalAmount || 0),
      totalProfit: 0, // يحتاج حساب معقد
      inventoryValue: 0, // يحتاج حساب معقد
      topSellingProducts
    };
  }
}

export const branchSalesService = new BranchSalesService();
