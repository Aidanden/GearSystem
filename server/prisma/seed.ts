import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 بدء إدراج البيانات الأولية...');

  try {
    // إنشاء مستخدم إداري
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@gearsystem.com' },
      update: {},
      create: {
        email: 'admin@gearsystem.com',
        username: 'admin',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewrMYWiQ4z/K6VQe', // password: 'admin123'
        firstName: 'المدير',
        lastName: 'العام',
        role: 'ADMIN',
        isActive: true
      }
    });

    console.log('✅ تم إنشاء المستخدم الإداري');

    // إنشاء أصناف نموذجية
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { code: 'ENG' },
        update: {},
        create: {
          code: 'ENG',
          name: 'قطع محرك',
          description: 'قطع غيار المحرك وملحقاته'
        }
      }),
      prisma.category.upsert({
        where: { code: 'BRK' },
        update: {},
        create: {
          code: 'BRK',
          name: 'نظام الفرامل',
          description: 'قطع غيار نظام الفرامل'
        }
      }),
      prisma.category.upsert({
        where: { code: 'TRS' },
        update: {},
        create: {
          code: 'TRS',
          name: 'ناقل الحركة',
          description: 'قطع غيار ناقل الحركة والتعليق'
        }
      }),
      prisma.category.upsert({
        where: { code: 'ELC' },
        update: {},
        create: {
          code: 'ELC',
          name: 'النظام الكهربائي',
          description: 'قطع غيار النظام الكهربائي والإلكتروني'
        }
      }),
      prisma.category.upsert({
        where: { code: 'BDY' },
        update: {},
        create: {
          code: 'BDY',
          name: 'الهيكل الخارجي',
          description: 'قطع غيار الهيكل والصاج'
        }
      })
    ]);

    console.log('✅ تم إنشاء الأصناف النموذجية');

    // إنشاء موردين نموذجيين
    const suppliers = await Promise.all([
      prisma.supplier.upsert({
        where: { code: 'SUP001' },
        update: {},
        create: {
          code: 'SUP001',
          name: 'شركة الأصيل لقطع الغيار',
          contactPerson: 'أحمد محمد',
          phone: '+218-91-1234567',
          email: 'info@alaseel.ly',
          address: 'شارع عمر المختار، طرابلس',
          city: 'طرابلس',
          country: 'ليبيا',
          taxNumber: 'TAX001'
        }
      }),
      prisma.supplier.upsert({
        where: { code: 'SUP002' },
        update: {},
        create: {
          code: 'SUP002',
          name: 'مؤسسة النجمة للسيارات',
          contactPerson: 'محمد علي',
          phone: '+218-92-7654321',
          email: 'sales@najma.ly',
          address: 'شارع الجمهورية، بنغازي',
          city: 'بنغازي',
          country: 'ليبيا',
          taxNumber: 'TAX002'
        }
      }),
      prisma.supplier.upsert({
        where: { code: 'SUP003' },
        update: {},
        create: {
          code: 'SUP003',
          name: 'شركة الوادي الأخضر',
          contactPerson: 'سامي خالد',
          phone: '+218-93-9876543',
          email: 'contact@wadi.ly',
          address: 'المنطقة الصناعية، مصراتة',
          city: 'مصراتة',
          country: 'ليبيا'
        }
      })
    ]);

    console.log('✅ تم إنشاء الموردين النموذجيين');

    // إنشاء منتجات نموذجية
    const products = await Promise.all([
      // قطع محرك
      prisma.product.upsert({
        where: { code: 'P001' },
        update: {},
        create: {
          code: 'P001',
          barcode: '1234567890123',
          name: 'فلتر زيت محرك',
          description: 'فلتر زيت عالي الجودة للمحركات',
          categoryId: categories[0].id,
          unit: 'قطعة',
          minStockLevel: 10,
          maxStockLevel: 100
        }
      }),
      prisma.product.upsert({
        where: { code: 'P002' },
        update: {},
        create: {
          code: 'P002',
          barcode: '1234567890124',
          name: 'شمعات الاحتراق',
          description: 'شمعات احتراق عالية الأداء',
          categoryId: categories[0].id,
          unit: 'قطعة',
          minStockLevel: 20,
          maxStockLevel: 200
        }
      }),
      // قطع فرامل
      prisma.product.upsert({
        where: { code: 'P003' },
        update: {},
        create: {
          code: 'P003',
          barcode: '1234567890125',
          name: 'اقراص فرامل أمامية',
          description: 'اقراص فرامل عالية الجودة للعجلات الأمامية',
          categoryId: categories[1].id,
          unit: 'زوج',
          minStockLevel: 5,
          maxStockLevel: 50
        }
      }),
      prisma.product.upsert({
        where: { code: 'P004' },
        update: {},
        create: {
          code: 'P004',
          barcode: '1234567890126',
          name: 'زيت فرامل',
          description: 'زيت فرامل DOT4 عالي الجودة',
          categoryId: categories[1].id,
          unit: 'لتر',
          minStockLevel: 15,
          maxStockLevel: 150
        }
      }),
      // قطع كهربائية
      prisma.product.upsert({
        where: { code: 'P005' },
        update: {},
        create: {
          code: 'P005',
          barcode: '1234567890127',
          name: 'بطارية سيارة 12V',
          description: 'بطارية سيارة 12 فولت 70 أمبير',
          categoryId: categories[3].id,
          unit: 'قطعة',
          minStockLevel: 3,
          maxStockLevel: 30
        }
      })
    ]);

    console.log('✅ تم إنشاء المنتجات النموذجية');

    // إضافة مخزون أولي للمنتجات
    for (const product of products) {
      await prisma.inventoryItem.upsert({
        where: { productId: product.id },
        update: {},
        create: {
          productId: product.id,
          quantity: Math.floor(Math.random() * 50) + 10, // كمية عشوائية بين 10-60
          reservedQty: 0,
          lastCostPrice: Math.floor(Math.random() * 100) + 20, // سعر عشوائي بين 20-120
          averageCost: Math.floor(Math.random() * 100) + 20
        }
      });
    }

    console.log('✅ تم إضافة المخزون الأولي');

    // إنشاء عملاء نموذجيين
    const customers = await Promise.all([
      prisma.customer.upsert({
        where: { code: 'CUS001' },
        update: {},
        create: {
          code: 'CUS001',
          name: 'خالد أحمد',
          phone: '+218-91-1111111',
          email: 'khalid@example.com',
          address: 'حي الأندلس، طرابلس',
          city: 'طرابلس',
          customerType: 'INDIVIDUAL'
        }
      }),
      prisma.customer.upsert({
        where: { code: 'CUS002' },
        update: {},
        create: {
          code: 'CUS002',
          name: 'ورشة النجمة للسيارات',
          phone: '+218-92-2222222',
          email: 'workshop@najma.ly',
          address: 'المنطقة الصناعية، بنغازي',
          city: 'بنغازي',
          customerType: 'WORKSHOP'
        }
      }),
      prisma.customer.upsert({
        where: { code: 'CUS003' },
        update: {},
        create: {
          code: 'CUS003',
          name: 'شركة الصقر للنقل',
          phone: '+218-93-3333333',
          email: 'info@saqr.ly',
          address: 'شارع الجمهورية، مصراتة',
          city: 'مصراتة',
          customerType: 'COMPANY'
        }
      })
    ]);

    console.log('✅ تم إنشاء العملاء النموذجيين');

    // إنشاء محل نموذجي
    const branch = await prisma.branch.upsert({
      where: { code: 'BR001' },
      update: {},
      create: {
        code: 'BR001',
        name: 'فرع وسط المدينة',
        managerName: 'عبدالله محمد',
        phone: '+218-94-4444444',
        email: 'branch1@gearsystem.com',
        address: 'شارع عمر المختار، وسط البلد',
        city: 'طرابلس',
        openingDate: new Date('2024-01-01')
      }
    });

    console.log('✅ تم إنشاء المحل النموذجي');

    // إنشاء محلات نموذجية
    const stores = await Promise.all([
      prisma.store.upsert({
        where: { code: 'ST001' },
        update: {},
        create: {
          code: 'ST001',
          name: 'المحل الرئيسي',
          description: 'المحل الرئيسي لبيع قطع غيار السيارات',
          address: 'شارع الجمهورية، وسط طرابلس',
          phone: '+218-21-1234567',
          email: 'main@gearsystem.com',
          manager: 'أحمد محمد علي',
          isActive: true
        }
      }),
      prisma.store.upsert({
        where: { code: 'ST002' },
        update: {},
        create: {
          code: 'ST002',
          name: 'فرع تاجوراء',
          description: 'فرع تاجوراء لقطع غيار السيارات',
          address: 'شارع الشط، تاجوراء',
          phone: '+218-21-7654321',
          email: 'tajoura@gearsystem.com',
          manager: 'محمد أحمد سالم',
          isActive: true
        }
      }),
      prisma.store.upsert({
        where: { code: 'ST003' },
        update: {},
        create: {
          code: 'ST003',
          name: 'فرع بنغازي',
          description: 'فرع بنغازي لقطع غيار السيارات',
          address: 'شارع جمال عبدالناصر، بنغازي',
          phone: '+218-61-1111111',
          email: 'benghazi@gearsystem.com',
          manager: 'سالم علي محمد',
          isActive: false
        }
      })
    ]);

    console.log('✅ تم إنشاء المحلات النموذجية');

    console.log('🎉 تم إدراج جميع البيانات الأولية بنجاح!');
    console.log('📊 الإحصائيات:');
    console.log(`   - المستخدمين: 1`);
    console.log(`   - الأصناف: ${categories.length}`);
    console.log(`   - الموردين: ${suppliers.length}`);
    console.log(`   - المنتجات: ${products.length}`);
    console.log(`   - العملاء: ${customers.length}`);
    console.log(`   - المحلات: ${stores.length}`);
    console.log('');
    console.log('🔐 بيانات تسجيل الدخول:');
    console.log('   البريد الإلكتروني: admin@gearsystem.com');
    console.log('   كلمة المرور: admin123');

  } catch (error) {
    console.error('❌ خطأ أثناء إدراج البيانات:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });