import { PrismaClient } from '@prisma/client';
import { CreateCategoryData, UpdateCategoryData, CategoryWithStats } from '../types/category.js';

const prisma = new PrismaClient();

export class CategoryService {
  // إحضار جميع الأصناف
  async getAllCategories(): Promise<CategoryWithStats[]> {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // إحضار الأصناف النشطة فقط
  async getActiveCategories(): Promise<CategoryWithStats[]> {
    return await prisma.category.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }

  // إحضار صنف بواسطة ID
  async getCategoryById(id: string): Promise<CategoryWithStats | null> {
    return await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
  }

  // إحضار صنف بواسطة الكود
  async getCategoryByCode(code: string): Promise<CategoryWithStats | null> {
    return await prisma.category.findUnique({
      where: { code },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
  }

  // إنشاء صنف جديد
  async createCategory(data: CreateCategoryData): Promise<CategoryWithStats> {
    // التحقق من عدم تكرار الكود
    const existingCategory = await this.getCategoryByCode(data.code);
    if (existingCategory) {
      throw new Error('كود الصنف موجود مسبقاً');
    }

    return await prisma.category.create({
      data,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
  }

  // تحديث صنف
  async updateCategory(id: string, data: UpdateCategoryData): Promise<CategoryWithStats> {
    // إذا كان هناك كود جديد، تحقق من عدم تكراره
    if (data.code) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          code: data.code,
          NOT: { id }
        }
      });
      if (existingCategory) {
        throw new Error('كود الصنف موجود مسبقاً');
      }
    }

    return await prisma.category.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });
  }

  // حذف صنف
  async deleteCategory(id: string): Promise<void> {
    // التحقق من وجود منتجات مرتبطة بالصنف
    const categoryWithProducts = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if (!categoryWithProducts) {
      throw new Error('الصنف غير موجود');
    }

    if (categoryWithProducts._count.products > 0) {
      throw new Error('لا يمكن حذف صنف يحتوي على منتجات');
    }

    await prisma.category.delete({
      where: { id }
    });
  }

  // البحث في الأصناف
  async searchCategories(query: string): Promise<CategoryWithStats[]> {
    return await prisma.category.findMany({
      where: {
        OR: [
          { code: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
  }
}

