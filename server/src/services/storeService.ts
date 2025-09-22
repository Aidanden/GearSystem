import { PrismaClient } from '@prisma/client';
import { CreateStoreData, UpdateStoreData, StoreSearchParams, Store } from '../types/store.js';

const prisma = new PrismaClient();

export class StoreService {
  // جلب جميع المحلات
  async getAllStores(): Promise<Store[]> {
    return await prisma.store.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    }) as Store[];
  }

  // جلب محل بالمعرف
  async getStoreById(id: string): Promise<Store | null> {
    return await prisma.store.findUnique({
      where: { id }
    }) as Store | null;
  }

  // جلب محل بالكود
  async getStoreByCode(code: string): Promise<Store | null> {
    return await prisma.store.findUnique({
      where: { code }
    }) as Store | null;
  }

  // توليد كود تلقائي للمحل
  private async generateStoreCode(): Promise<string> {
    const count = await prisma.store.count();
    const nextNumber = count + 1;
    return `ST${nextNumber.toString().padStart(3, '0')}`;
  }

  // إنشاء محل جديد
  async createStore(data: CreateStoreData): Promise<Store> {
    // تنظيف البيانات - إزالة الحقول الفارغة
    const cleanData: any = {
      name: data.name.trim()
    };

    // إضافة الحقول الاختيارية فقط إذا كانت مملوءة
    if (data.code && data.code.trim()) {
      cleanData.code = data.code.trim();
    }
    if (data.description && data.description.trim()) {
      cleanData.description = data.description.trim();
    }
    if (data.address && data.address.trim()) {
      cleanData.address = data.address.trim();
    }
    if (data.phone && data.phone.trim()) {
      cleanData.phone = data.phone.trim();
    }
    if (data.email && data.email.trim()) {
      cleanData.email = data.email.trim();
    }
    if (data.manager && data.manager.trim()) {
      cleanData.manager = data.manager.trim();
    }
    if (typeof data.isActive === 'boolean') {
      cleanData.isActive = data.isActive;
    } else {
      cleanData.isActive = true; // القيمة الافتراضية
    }

    // إذا لم يتم توفير كود، قم بتوليده تلقائياً
    let storeCode = cleanData.code;
    if (!storeCode) {
      storeCode = await this.generateStoreCode();
      
      // التأكد من أن الكود المولد غير مستخدم
      let existingStore = await this.getStoreByCode(storeCode);
      let counter = 1;
      while (existingStore) {
        storeCode = `ST${(await prisma.store.count() + counter).toString().padStart(3, '0')}`;
        existingStore = await this.getStoreByCode(storeCode);
        counter++;
      }
      cleanData.code = storeCode;
    } else {
      // التحقق من عدم تكرار الكود المدخل يدوياً
      const existingStore = await this.getStoreByCode(storeCode);
      if (existingStore) {
        throw new Error('كود المحل موجود مسبقاً');
      }
    }

    return await prisma.store.create({
      data: cleanData
    }) as Store;
  }

  // تحديث محل
  async updateStore(id: string, data: UpdateStoreData): Promise<Store> {
    // التحقق من وجود المحل
    const existingStore = await this.getStoreById(id);
    if (!existingStore) {
      throw new Error('المحل غير موجود');
    }

    // التحقق من عدم تكرار الكود إذا تم تغييره
    if (data.code && data.code !== existingStore.code) {
      const storeWithSameCode = await this.getStoreByCode(data.code);
      if (storeWithSameCode) {
        throw new Error('كود المحل موجود مسبقاً');
      }
    }

    return await prisma.store.update({
      where: { id },
      data
    }) as Store;
  }

  // حذف محل
  async deleteStore(id: string): Promise<void> {
    // التحقق من وجود المحل
    const existingStore = await this.getStoreById(id);
    if (!existingStore) {
      throw new Error('المحل غير موجود');
    }

    // التحقق من عدم وجود معاملات مرتبطة بالمحل (سيتم إضافة هذا التحقق لاحقاً)
    // const relatedTransactions = await prisma.inventoryTransaction.count({
    //   where: { storeId: id }
    // });

    // if (relatedTransactions > 0) {
    //   throw new Error('لا يمكن حذف المحل لوجود معاملات مرتبطة به');
    // }

    await prisma.store.delete({
      where: { id }
    });
  }

  // البحث في المحلات
  async searchStores(params: StoreSearchParams): Promise<{
    stores: Store[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { search, isActive, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { manager: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const [stores, total] = await Promise.all([
      prisma.store.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.store.count({ where })
    ]);

    return {
      stores: stores as Store[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // جلب المحلات النشطة فقط
  async getActiveStores(): Promise<Store[]> {
    return await prisma.store.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    }) as Store[];
  }

  // تبديل حالة المحل (تفعيل/إلغاء تفعيل)
  async toggleStoreStatus(id: string): Promise<Store> {
    const store = await this.getStoreById(id);
    if (!store) {
      throw new Error('المحل غير موجود');
    }

    return await prisma.store.update({
      where: { id },
      data: {
        isActive: !store.isActive
      }
    }) as Store;
  }

  // إحصائيات المحلات
  async getStoreStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
  }> {
    const [total, active] = await Promise.all([
      prisma.store.count(),
      prisma.store.count({ where: { isActive: true } })
    ]);

    return {
      total,
      active,
      inactive: total - active
    };
  }
}
