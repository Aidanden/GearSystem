import { PrismaClient } from '@prisma/client';
import {
  SaleInvoice,
  SaleInvoiceItem,
  CreateSaleInvoiceData,
  UpdateSaleInvoiceData,
  SaleInvoiceSearchParams,
  SalesStats,
  SaleType,
  PaymentMethod
} from '../types/sales.js';

const prisma = new PrismaClient();

export class SalesService {
  // جلب جميع فواتير البيع
  async getAllSaleInvoices(): Promise<SaleInvoice[]> {
    const invoices = await prisma.saleInvoice.findMany({
      include: {
        customer: true,
        store: true,
        user: true,
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

    return invoices.map(invoice => ({
      ...invoice,
      totalAmount: Number(invoice.totalAmount || 0),
      discount: Number(invoice.discount || 0),
      netAmount: Number(invoice.netAmount || 0)
    })) as SaleInvoice[];
  }

  // جلب فاتورة بيع بالمعرف
  async getSaleInvoiceById(id: string): Promise<SaleInvoice | null> {
    const invoice = await prisma.saleInvoice.findUnique({
      where: { id },
      include: {
        customer: true,
        store: true,
        user: true,
        items: {
          include: {
            sparePart: true
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
    } as SaleInvoice;
  }

  // توليد رقم فاتورة تلقائي
  private async generateInvoiceNumber(): Promise<string> {
    const count = await prisma.saleInvoice.count();
    const nextNumber = count + 1;
    return `INV${nextNumber.toString().padStart(6, '0')}`;
  }

  // إنشاء فاتورة بيع جديدة
  async createSaleInvoice(data: CreateSaleInvoiceData, userId: string): Promise<SaleInvoice> {
    console.log('📥 بيانات إنشاء الفاتورة الواردة:', JSON.stringify(data, null, 2));
    
    // حساب المجاميع
    let totalAmount = 0;
    const processedItems = [];

    for (const item of data.items) {
      const sparePart = await prisma.product.findUnique({
        where: { id: item.sparePartId }
      });

      if (!sparePart) {
        throw new Error(`قطعة الغيار غير موجودة: ${item.sparePartId}`);
      }

      // التحقق من توفر الكمية في المخزون
      const inventoryItem = await prisma.inventoryItem.findFirst({
        where: { productId: item.sparePartId }
      });

      if (!inventoryItem || inventoryItem.quantity < item.quantity) {
        throw new Error(`الكمية المطلوبة غير متوفرة لقطعة الغيار: ${sparePart.name}`);
      }

      const itemTotal = item.quantity * item.unitPrice;
      totalAmount += itemTotal;

      processedItems.push({
        sparePartId: item.sparePartId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: itemTotal,
        costPrice: Number(inventoryItem.lastCostPrice || 0)
      });
    }

    const discount = data.discount || 0;
    const netAmount = totalAmount - discount;

    // توليد رقم الفاتورة
    const invoiceNumber = await this.generateInvoiceNumber();

    // تحويل التاريخ إلى Date object إذا كان string
    const invoiceDate = typeof data.invoiceDate === 'string' 
      ? new Date(data.invoiceDate) 
      : data.invoiceDate;

    console.log('📅 تاريخ الفاتورة بعد التحويل:', invoiceDate);

    // إنشاء الفاتورة
    const invoice = await prisma.saleInvoice.create({
      data: {
        invoiceNumber,
        customerId: data.customerId,
        storeId: data.storeId,
        userId,
        invoiceDate: invoiceDate,
        saleType: data.saleType || SaleType.REGULAR,
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
        customer: true,
        store: true,
        user: true,
        items: {
          include: {
            sparePart: true
          }
        }
      }
    }) as any;

    // تحديث المخزون
    for (const item of processedItems) {
      await prisma.inventoryItem.updateMany({
        where: { productId: item.sparePartId },
        data: {
          quantity: {
            decrement: item.quantity
          }
        }
      });
    }

    // تحديث رصيد العميل إذا كان الدفع آجل
    if (data.customerId && data.paymentMethod === PaymentMethod.BANK) {
      await prisma.customer.update({
        where: { id: data.customerId },
        data: {
          currentBalance: {
            increment: netAmount
          }
        }
      });
    }

    return {
      ...invoice,
      totalAmount: Number(invoice.totalAmount || 0),
      discount: Number(invoice.discount || 0),
      netAmount: Number(invoice.netAmount || 0)
    } as SaleInvoice;
  }

  // تحديث فاتورة بيع
  async updateSaleInvoice(id: string, data: UpdateSaleInvoiceData): Promise<SaleInvoice> {
    const existingInvoice = await this.getSaleInvoiceById(id);
    if (!existingInvoice) {
      throw new Error('الفاتورة غير موجودة');
    }

    // إذا تم تحديث العناصر، نحتاج لإعادة حساب المجاميع
    let updateData: any = {
      customerId: data.customerId,
      storeId: data.storeId,
      invoiceDate: data.invoiceDate ? (typeof data.invoiceDate === 'string' ? new Date(data.invoiceDate) : data.invoiceDate) : undefined,
      saleType: data.saleType,
      paymentMethod: data.paymentMethod,
      notes: data.notes
    };

    if (data.items) {
      // حذف العناصر القديمة
      await prisma.saleInvoiceItem.deleteMany({
        where: { saleInvoiceId: id }
      });

      // حساب المجاميع الجديدة
      let totalAmount = 0;
      const processedItems = [];

      for (const item of data.items) {
        const itemTotal = item.quantity * item.unitPrice;
        totalAmount += itemTotal;

        processedItems.push({
          sparePartId: item.sparePartId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: itemTotal
        });
      }

      const discount = data.discount || 0;
      const netAmount = totalAmount - discount;

      updateData = {
        ...updateData,
        totalAmount,
        discount,
        netAmount,
        items: {
          create: processedItems
        }
      };
    }

    const updatedInvoice = await prisma.saleInvoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        store: true,
        user: true,
        items: {
          include: {
            sparePart: true
          }
        }
      }
    }) as any;

    return {
      ...updatedInvoice,
      totalAmount: Number(updatedInvoice.totalAmount || 0),
      discount: Number(updatedInvoice.discount || 0),
      netAmount: Number(updatedInvoice.netAmount || 0)
    } as SaleInvoice;
  }

  // حذف فاتورة بيع
  async deleteSaleInvoice(id: string): Promise<void> {
    const existingInvoice = await this.getSaleInvoiceById(id);
    if (!existingInvoice) {
      throw new Error('الفاتورة غير موجودة');
    }

    await prisma.saleInvoice.delete({
      where: { id }
    });
  }

  // البحث في فواتير البيع
  async searchSaleInvoices(params: SaleInvoiceSearchParams): Promise<{
    invoices: SaleInvoice[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { search, customerId, storeId, userId, saleType, paymentMethod, startDate, endDate, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { invoiceNumber: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }

    if (customerId) where.customerId = customerId;
    if (storeId) where.storeId = storeId;
    if (userId) where.userId = userId;
    if (saleType) where.saleType = saleType;
    if (paymentMethod) where.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      where.invoiceDate = {};
      if (startDate) where.invoiceDate.gte = startDate;
      if (endDate) where.invoiceDate.lte = endDate;
    }

    const [invoices, total] = await Promise.all([
      prisma.saleInvoice.findMany({
        where,
        include: {
          customer: true,
          store: true,
          user: true,
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
      prisma.saleInvoice.count({ where })
    ]);

    const processedInvoices = invoices.map(invoice => ({
      ...invoice,
      totalAmount: Number((invoice as any).totalAmount || 0),
      discount: Number((invoice as any).discount || 0),
      netAmount: Number((invoice as any).netAmount || 0)
    })) as SaleInvoice[];

    return {
      invoices: processedInvoices,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // إحصائيات المبيعات
  async getSalesStats(): Promise<SalesStats> {
    const [totalSalesData, revenueData, topProducts] = await Promise.all([
      prisma.saleInvoice.count(),
      prisma.saleInvoice.aggregate({
        _sum: {
          netAmount: true
        },
        _avg: {
          netAmount: true
        }
      }) as any,
      prisma.saleInvoiceItem.groupBy({
        by: ['sparePartId'],
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
      totalSales: totalSalesData,
      totalRevenue: Number(revenueData._sum.netAmount || 0),
      totalProfit: 0, // يحتاج حساب معقد
      averageOrderValue: Number(revenueData._avg.netAmount || 0),
      topSellingProducts,
      salesByMonth: [] // يحتاج استعلام معقد
    };
  }
}

export const salesService = new SalesService();
