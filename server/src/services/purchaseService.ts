import { PrismaClient } from '@prisma/client';
import { CreatePurchaseInvoiceData, UpdatePurchaseInvoiceData, PurchaseInvoiceWithDetails } from '../types/purchase.js';
import { ProductService } from './productService.js';

const prisma = new PrismaClient();
const productService = new ProductService();

export class PurchaseService {
  // إحضار جميع فواتير الشراء
  async getAllPurchaseInvoices(): Promise<PurchaseInvoiceWithDetails[]> {
    return await prisma.purchaseInvoice.findMany({
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // إحضار فاتورة شراء بواسطة ID
  async getPurchaseInvoiceById(id: string): Promise<PurchaseInvoiceWithDetails | null> {
    return await prisma.purchaseInvoice.findUnique({
      where: { id },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true
              }
            }
          }
        }
      }
    });
  }

  // إحضار فاتورة بواسطة رقم الفاتورة
  async getPurchaseInvoiceByNumber(invoiceNumber: string): Promise<PurchaseInvoiceWithDetails | null> {
    return await prisma.purchaseInvoice.findUnique({
      where: { invoiceNumber },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true
              }
            }
          }
        }
      }
    });
  }

  // إنشاء فاتورة شراء جديدة
  async createPurchaseInvoice(data: CreatePurchaseInvoiceData, userId: string): Promise<PurchaseInvoiceWithDetails> {
    // التحقق من عدم تكرار رقم الفاتورة
    const existingInvoice = await this.getPurchaseInvoiceByNumber(data.invoiceNumber);
    if (existingInvoice) {
      throw new Error('رقم الفاتورة موجود مسبقاً');
    }

    // التحقق من وجود المورد
    const supplier = await prisma.supplier.findUnique({
      where: { id: data.supplierId }
    });
    if (!supplier) {
      throw new Error('المورد غير موجود');
    }

    // التحقق من وجود جميع المنتجات
    for (const item of data.items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      if (!product) {
        throw new Error(`المنتج غير موجود: ${item.productId}`);
      }
    }

    // حساب المجموع الكلي
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    return await prisma.$transaction(async (tx) => {
      // إنشاء فاتورة الشراء
      const invoice = await tx.purchaseInvoice.create({
        data: {
          invoiceNumber: data.invoiceNumber,
          supplierId: data.supplierId,
          userId,
          invoiceDate: data.invoiceDate,
          dueDate: data.dueDate,
          paymentType: data.paymentType,
          paymentMethod: data.paymentMethod,
          totalAmount,
          paidAmount: data.paymentType === 'CASH' ? totalAmount : 0,
          remainingAmount: data.paymentType === 'CASH' ? 0 : totalAmount,
          status: data.paymentType === 'CASH' ? 'PAID' : 'PENDING',
          notes: data.notes
        }
      });

      // إنشاء بنود الفاتورة
      for (const item of data.items) {
        const totalPrice = item.quantity * item.unitPrice;

        await tx.purchaseInvoiceItem.create({
          data: {
            purchaseInvoiceId: invoice.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice
          }
        });

        // تحديث المخزون
        await productService.addInventoryQuantity(item.productId, item.quantity, item.unitPrice);
      }

      // إحضار الفاتورة مع التفاصيل
      return await tx.purchaseInvoice.findUnique({
        where: { id: invoice.id },
        include: {
          supplier: {
            select: {
              id: true,
              code: true,
              name: true
            }
          },
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  unit: true
                }
              }
            }
          }
        }
      }) as PurchaseInvoiceWithDetails;
    });
  }

  // تحديث فاتورة شراء
  async updatePurchaseInvoice(id: string, data: UpdatePurchaseInvoiceData): Promise<PurchaseInvoiceWithDetails> {
    // التحقق من وجود الفاتورة
    const existingInvoice = await this.getPurchaseInvoiceById(id);
    if (!existingInvoice) {
      throw new Error('الفاتورة غير موجودة');
    }

    // إذا كان هناك رقم فاتورة جديد، تحقق من عدم تكراره
    if (data.invoiceNumber && data.invoiceNumber !== existingInvoice.invoiceNumber) {
      const duplicateInvoice = await this.getPurchaseInvoiceByNumber(data.invoiceNumber);
      if (duplicateInvoice) {
        throw new Error('رقم الفاتورة موجود مسبقاً');
      }
    }

    // إذا كان هناك مورد جديد، تحقق من وجوده
    if (data.supplierId && data.supplierId !== existingInvoice.supplierId) {
      const supplier = await prisma.supplier.findUnique({
        where: { id: data.supplierId }
      });
      if (!supplier) {
        throw new Error('المورد غير موجود');
      }
    }

    const updatedInvoice = await prisma.purchaseInvoice.update({
      where: { id },
      data,
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true
              }
            }
          }
        }
      }
    });

    return updatedInvoice;
  }

  // حذف فاتورة شراء
  async deletePurchaseInvoice(id: string): Promise<void> {
    const invoice = await this.getPurchaseInvoiceById(id);
    if (!invoice) {
      throw new Error('الفاتورة غير موجودة');
    }

    // التحقق من إمكانية الحذف (فقط الفواتير المعلقة يمكن حذفها)
    if (invoice.status !== 'PENDING') {
      throw new Error('لا يمكن حذف فاتورة مدفوعة أو مدفوعة جزئياً');
    }

    await prisma.$transaction(async (tx) => {
      // تقليل المخزون (عكس الزيادة التي حدثت عند الإنشاء)
      for (const item of invoice.items) {
        await productService.addInventoryQuantity(item.productId, -item.quantity, 0);
      }

      // حذف بنود الفاتورة
      await tx.purchaseInvoiceItem.deleteMany({
        where: { purchaseInvoiceId: id }
      });

      // حذف الفاتورة
      await tx.purchaseInvoice.delete({
        where: { id }
      });
    });
  }

  // البحث في فواتير الشراء
  async searchPurchaseInvoices(query: string): Promise<PurchaseInvoiceWithDetails[]> {
    return await prisma.purchaseInvoice.findMany({
      where: {
        OR: [
          { invoiceNumber: { contains: query, mode: 'insensitive' } },
          { supplier: { name: { contains: query, mode: 'insensitive' } } },
          { supplier: { code: { contains: query, mode: 'insensitive' } } },
          { notes: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // إحضار فواتير الشراء لمورد معين
  async getPurchaseInvoicesBySupplier(supplierId: string): Promise<PurchaseInvoiceWithDetails[]> {
    return await prisma.purchaseInvoice.findMany({
      where: { supplierId },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // إحضار فواتير الشراء المعلقة
  async getPendingPurchaseInvoices(): Promise<PurchaseInvoiceWithDetails[]> {
    return await prisma.purchaseInvoice.findMany({
      where: {
        status: {
          in: ['PENDING', 'PARTIAL']
        }
      },
      include: {
        supplier: {
          select: {
            id: true,
            code: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                code: true,
                name: true,
                unit: true
              }
            }
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });
  }

  // توليد رقم فاتورة تلقائي متسلسل
  async generateInvoiceNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // البحث عن آخر فاتورة في الشهر الحالي
    const lastInvoice = await prisma.purchaseInvoice.findFirst({
      where: {
        invoiceNumber: {
          startsWith: `PUR-${currentYear}${currentMonth}-`
        }
      },
      orderBy: {
        invoiceNumber: 'desc'
      }
    });

    let nextNumber = 1;
    
    if (lastInvoice) {
      // استخراج الرقم المتسلسل من آخر فاتورة
      const lastNumber = lastInvoice.invoiceNumber.split('-')[2];
      nextNumber = parseInt(lastNumber) + 1;
    }

    // تنسيق الرقم المتسلسل (4 أرقام)
    const sequentialNumber = String(nextNumber).padStart(4, '0');
    
    return `PUR-${currentYear}${currentMonth}-${sequentialNumber}`;
  }
}

