// إنشاء جدول المحلات يدوياً
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createStoresTable() {
  try {
    console.log('🔧 إنشاء جدول المحلات...');
    
    // إنشاء الجدول باستخدام SQL مباشر
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "stores" (
        "id" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "address" TEXT,
        "phone" TEXT,
        "email" TEXT,
        "manager" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "stores_pkey" PRIMARY KEY ("id")
      );
    `;
    
    // إنشاء الفهرس الفريد للكود
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "stores_code_key" ON "stores"("code");
    `;
    
    console.log('✅ تم إنشاء جدول المحلات بنجاح');
    
    // إدراج بيانات نموذجية
    console.log('📥 إدراج بيانات نموذجية...');
    
    await prisma.$executeRaw`
      INSERT INTO "stores" ("id", "code", "name", "description", "address", "phone", "email", "manager", "isActive", "createdAt", "updatedAt")
      VALUES 
        ('st001', 'ST001', 'المحل الرئيسي', 'المحل الرئيسي لبيع قطع غيار السيارات', 'شارع الجمهورية، وسط طرابلس', '+218-21-1234567', 'main@gearsystem.com', 'أحمد محمد علي', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('st002', 'ST002', 'فرع تاجوراء', 'فرع تاجوراء لقطع غيار السيارات', 'شارع الشط، تاجوراء', '+218-21-7654321', 'tajoura@gearsystem.com', 'محمد أحمد سالم', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('st003', 'ST003', 'فرع بنغازي', 'فرع بنغازي لقطع غيار السيارات', 'شارع جمال عبدالناصر، بنغازي', '+218-61-1111111', 'benghazi@gearsystem.com', 'سالم علي محمد', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT ("code") DO NOTHING;
    `;
    
    console.log('✅ تم إدراج البيانات النموذجية');
    
    // التحقق من البيانات
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "stores"`;
    console.log('📊 عدد المحلات في قاعدة البيانات:', count[0].count);
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء جدول المحلات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createStoresTable();
