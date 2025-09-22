import { PrismaClient } from '@prisma/client';
import { CreateSupplierData, UpdateSupplierData, SupplierWithStats } from '../types/supplier.js';

const prisma = new PrismaClient();

export class SupplierService {
  // إحضار جميع الموردين
  async getAllSuppliers(): Promise<SupplierWithStats[]> {
    return await prisma.supplier.findMany({
      include: {
        _count: {
          select: {
            purchaseInvoices: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // إحضار الموردين النشطين فقط
  async getActiveSuppliers(): Promise<SupplierWithStats[]> {
    return await prisma.supplier.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            purchaseInvoices: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  // إحضار مورد بواسطة ID
  async getSupplierById(id: string): Promise<SupplierWithStats | null> {
    return await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            purchaseInvoices: true
          }
        }
      }
    });
  }

  // إحضار مورد بواسطة الكود
  async getSupplierByCode(code: string): Promise<SupplierWithStats | null> {
    return await prisma.supplier.findUnique({
      where: { code },
      include: {
        _count: {
          select: {
            purchaseInvoices: true
          }
        }
      }
    });
  }

  // إنشاء مورد جديد
  async createSupplier(data: CreateSupplierData): Promise<SupplierWithStats> {
    // التحقق من عدم تكرار الكود
    const existingSupplier = await this.getSupplierByCode(data.code);
    if (existingSupplier) {
      throw new Error('كود المورد موجود مسبقاً');
    }

    // التحقق من عدم تكرار البريد الإلكتروني إذا تم إدخاله
    if (data.email) {
      const existingEmail = await prisma.supplier.findFirst({
        where: { email: data.email }
      });
      if (existingEmail) {
        throw new Error('البريد الإلكتروني موجود مسبقاً');
      }
    }

    return await prisma.supplier.create({
      data,
      include: {
        _count: {
          select: {
            purchaseInvoices: true
          }
        }
      }
    });
  }

  // تحديث مورد
  async updateSupplier(id: string, data: UpdateSupplierData): Promise<SupplierWithStats> {
    // إذا كان هناك كود جديد، تحقق من عدم تكراره
    if (data.code) {
      const existingSupplier = await prisma.supplier.findFirst({
        where: {
          code: data.code,
          NOT: { id }
        }
      });
      if (existingSupplier) {
        throw new Error('كود المورد موجود مسبقاً');
      }
    }

    // إذا كان هناك بريد إلكتروني جديد، تحقق من عدم تكراره
    if (data.email) {
      const existingEmail = await prisma.supplier.findFirst({
        where: {
          email: data.email,
          NOT: { id }
        }
      });
      if (existingEmail) {
        throw new Error('البريد الإلكتروني موجود مسبقاً');
      }
    }

    return await prisma.supplier.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            purchaseInvoices: true
          }
        }
      }
    });
  }

  // حذف مورد
  async deleteSupplier(id: string): Promise<void> {
    // التحقق من وجود فواتير شراء مرتبطة بالمورد
    const supplierWithInvoices = await prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            purchaseInvoices: true
          }
        }
      }
    });

    if (!supplierWithInvoices) {
      throw new Error('المورد غير موجود');
    }

    if (supplierWithInvoices._count.purchaseInvoices > 0) {
      throw new Error('لا يمكن حذف مورد له فواتير شراء');
    }

    await prisma.supplier.delete({
      where: { id }
    });
  }

  // البحث في الموردين
  async searchSuppliers(query: string): Promise<SupplierWithStats[]> {
    return await prisma.supplier.findMany({
      where: {
        OR: [
          { code: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { contactPerson: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { city: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: {
            purchaseInvoices: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
}

