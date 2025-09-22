import { PrismaClient } from '@prisma/client';
import { CreateCustomerData, UpdateCustomerData, CustomerSearchParams, Customer, CustomerType, CustomerStats } from '../types/customer.js';

const prisma = new PrismaClient();

export class CustomerService {
  // جلب جميع العملاء
  async getAllCustomers(): Promise<Customer[]> {
    const customers = await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    }) as any[];
    
    return customers.map(customer => ({
      ...customer,
      currentBalance: Number(customer.currentBalance || 0)
    })) as Customer[];
  }

  // جلب عميل بالمعرف
  async getCustomerById(id: string): Promise<Customer | null> {
    const customer = await prisma.customer.findUnique({
      where: { id }
    }) as any;
    
    if (!customer) return null;
    
    return {
      ...customer,
      currentBalance: Number(customer.currentBalance || 0)
    } as Customer;
  }

  // جلب عميل بالكود
  async getCustomerByCode(code: string): Promise<Customer | null> {
    return await prisma.customer.findUnique({
      where: { code }
    }) as Customer | null;
  }

  // توليد كود تلقائي للعميل
  private async generateCustomerCode(): Promise<string> {
    const count = await prisma.customer.count();
    const nextNumber = count + 1;
    return `CUS${nextNumber.toString().padStart(4, '0')}`;
  }

  // إنشاء عميل جديد
  async createCustomer(data: CreateCustomerData): Promise<Customer> {
    // تنظيف البيانات - إزالة الحقول الفارغة
    const cleanData: any = {
      name: data.name.trim()
    };

    // إضافة الحقول الاختيارية فقط إذا كانت مملوءة
    if (data.code && data.code.trim()) {
      cleanData.code = data.code.trim();
    }
    if (data.phone && data.phone.trim()) {
      cleanData.phone = data.phone.trim();
    }
    if (data.email && data.email.trim()) {
      cleanData.email = data.email.trim();
    }
    if (data.address && data.address.trim()) {
      cleanData.address = data.address.trim();
    }
    if (data.city && data.city.trim()) {
      cleanData.city = data.city.trim();
    }
    if (data.customerType) {
      cleanData.customerType = data.customerType;
    } else {
      cleanData.customerType = CustomerType.INDIVIDUAL;
    }
    if (data.taxNumber && data.taxNumber.trim()) {
      cleanData.taxNumber = data.taxNumber.trim();
    }
    if (data.notes && data.notes.trim()) {
      cleanData.notes = data.notes.trim();
    }
    if (typeof data.isActive === 'boolean') {
      cleanData.isActive = data.isActive;
    } else {
      cleanData.isActive = true;
    }

    // إذا لم يتم توفير كود، قم بتوليده تلقائياً
    let customerCode = cleanData.code;
    if (!customerCode) {
      customerCode = await this.generateCustomerCode();
      
      // التأكد من أن الكود المولد غير مستخدم
      let existingCustomer = await this.getCustomerByCode(customerCode);
      let counter = 1;
      while (existingCustomer) {
        customerCode = `CUS${(await prisma.customer.count() + counter).toString().padStart(4, '0')}`;
        existingCustomer = await this.getCustomerByCode(customerCode);
        counter++;
      }
      cleanData.code = customerCode;
    } else {
      // التحقق من عدم تكرار الكود المدخل يدوياً
      const existingCustomer = await this.getCustomerByCode(customerCode);
      if (existingCustomer) {
        throw new Error('كود العميل موجود مسبقاً');
      }
    }

    const customer = await prisma.customer.create({
      data: cleanData
    }) as any;
    
    // تحويل Decimal إلى number
    return {
      ...customer,
      currentBalance: Number(customer.currentBalance || 0)
    } as Customer;
  }

  // تحديث عميل
  async updateCustomer(id: string, data: UpdateCustomerData): Promise<Customer> {
    // التحقق من وجود العميل
    const existingCustomer = await this.getCustomerById(id);
    if (!existingCustomer) {
      throw new Error('العميل غير موجود');
    }

    // التحقق من عدم تكرار الكود إذا تم تغييره
    if (data.code && data.code !== existingCustomer.code) {
      const customerWithSameCode = await this.getCustomerByCode(data.code);
      if (customerWithSameCode) {
        throw new Error('كود العميل موجود مسبقاً');
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id },
      data: data as any
    }) as any;
    
    return {
      ...updatedCustomer,
      currentBalance: Number(updatedCustomer.currentBalance || 0)
    } as Customer;
  }

  // حذف عميل
  async deleteCustomer(id: string): Promise<void> {
    // التحقق من وجود العميل
    const existingCustomer = await this.getCustomerById(id);
    if (!existingCustomer) {
      throw new Error('العميل غير موجود');
    }

    // التحقق من عدم وجود فواتير مرتبطة بالعميل
    const relatedInvoices = await prisma.saleInvoice.count({
      where: { customerId: id }
    });

    if (relatedInvoices > 0) {
      throw new Error('لا يمكن حذف العميل لوجود فواتير مرتبطة به');
    }

    await prisma.customer.delete({
      where: { id }
    });
  }

  // البحث في العملاء
  async searchCustomers(params: CustomerSearchParams): Promise<{
    customers: Customer[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { search, customerType, city, isActive, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { taxNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (customerType) {
      where.customerType = customerType;
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    if (typeof isActive === 'boolean') {
      where.isActive = isActive;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.customer.count({ where })
    ]);

    return {
      customers: customers as Customer[],
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  // جلب العملاء النشطين فقط
  async getActiveCustomers(): Promise<Customer[]> {
    return await prisma.customer.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    }) as Customer[];
  }

  // تبديل حالة العميل (تفعيل/إلغاء تفعيل)
  async toggleCustomerStatus(id: string): Promise<Customer> {
    const customer = await this.getCustomerById(id);
    if (!customer) {
      throw new Error('العميل غير موجود');
    }

    return await prisma.customer.update({
      where: { id },
      data: {
        isActive: !customer.isActive
      }
    }) as Customer;
  }

  // تحديث رصيد العميل
  async updateCustomerBalance(id: string, amount: number): Promise<Customer> {
    const customer = await this.getCustomerById(id);
    if (!customer) {
      throw new Error('العميل غير موجود');
    }

    return await prisma.customer.update({
      where: { id },
      data: {
        currentBalance: {
          increment: amount
        }
      }
    }) as Customer;
  }

  // إحصائيات العملاء
  async getCustomerStats(): Promise<CustomerStats> {
    const [total, active, byTypeData, balanceData] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.customer.groupBy({
        by: ['customerType'],
        _count: {
          customerType: true
        }
      }),
      prisma.customer.aggregate({
        _sum: {
          currentBalance: true
        }
      })
    ]);

    // تحويل بيانات الأنواع إلى كائن
    const byType: { [key in CustomerType]: number } = {
      [CustomerType.INDIVIDUAL]: 0,
      [CustomerType.COMPANY]: 0,
      [CustomerType.WORKSHOP]: 0,
      [CustomerType.RETAILER]: 0,
      [CustomerType.STORE]: 0
    };

    byTypeData.forEach(item => {
      byType[item.customerType as CustomerType] = item._count.customerType;
    });

    return {
      total,
      active,
      inactive: total - active,
      byType,
      totalBalance: Number(balanceData._sum.currentBalance) || 0
    };
  }

  // جلب العملاء حسب النوع
  async getCustomersByType(customerType: CustomerType): Promise<Customer[]> {
    return await prisma.customer.findMany({
      where: {
        customerType,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    }) as Customer[];
  }

  // جلب العملاء المدينين
  async getCustomersWithDebt(): Promise<Customer[]> {
    return await prisma.customer.findMany({
      where: {
        currentBalance: {
          gt: 0
        },
        isActive: true
      },
      orderBy: {
        currentBalance: 'desc'
      }
    }) as Customer[];
  }
}
