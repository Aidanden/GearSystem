# 🚗 نظام إدارة قطع غيار السيارات - الخادم

نظام شامل لإدارة قطع غيار السيارات مبني بـ Node.js، Express، TypeScript، و Prisma.

## 📋 الميزات

- 🔐 نظام مصادقة وتفويض متقدم
- 📦 إدارة شاملة للمخزون (رئيسي + المحلات)
- 🛒 إدارة فواتير الشراء والبيع
- 🏪 نظام إدارة المحلات والفروع
- 🔄 تحويلات البضاعة بين المخزن والمحلات
- 💰 نظام المدفوعات (نقدي/آجل/مصرفي)
- 👥 إدارة الموردين والعملاء والورش
- 💲 نظام تسعير متعدد المستويات
- 📊 تقارير تفصيلية ولوحة تحكم
- 🏷️ نظام الأكواد والباركود
- 📱 واجهة API حديثة
- 🔍 بحث متقدم وفلترة
- 📈 إحصائيات ومؤشرات الأداء

## 🏗️ بنية المشروع

```
server/
├── src/
│   ├── index.ts              # نقطة البداية الرئيسية
│   ├── types/                # تعريفات الأنواع
│   │   └── index.ts         # الأنواع الأساسية
│   ├── middleware/          # البرمجيات الوسطية
│   ├── routes/              # مسارات API
│   ├── services/            # خدمات الأعمال
│   ├── utils/               # المرافق المساعدة
│   └── controllers/         # تحكم في المسارات
├── prisma/
│   ├── schema.prisma        # مخطط قاعدة البيانات
│   ├── seed.ts              # بيانات أولية
│   └── migrations/          # ملفات الهجرة
├── dist/                    # الملفات المترجمة
├── uploads/                 # ملفات التحميل
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ مخطط قاعدة البيانات

### الجداول الرئيسية:

1. **Users** - المستخدمين وإدارة الصلاحيات
2. **Suppliers** - الموردين ومعلوماتهم
3. **Customers** - العملاء ومعلوماتهم (أفراد، شركات، ورش)
4. **Branches** - المحلات التابعة للشركة
5. **Categories** - تصنيفات المنتجات
6. **Products** - المنتجات (قطع الغيار)
7. **InventoryItems** - مخزون المنتجات الرئيسي
8. **BranchInventoryItems** - مخزون المحلات
9. **BranchProductPrices** - أسعار المنتجات للمحلات
10. **BranchTransfers** - تحويلات البضاعة للمحلات
11. **BranchTransferItems** - بنود التحويلات
12. **PurchaseInvoices** - فواتير الشراء
13. **PurchaseInvoiceItems** - بنود فواتير الشراء
14. **SaleInvoices** - فواتير البيع العادية
15. **SaleInvoiceItems** - بنود فواتير البيع العادية
16. **BranchSaleInvoices** - فواتير بيع المحلات
17. **BranchSaleInvoiceItems** - بنود فواتير بيع المحلات
18. **Payments** - المدفوعات والسداد
19. **AuditLogs** - سجل العمليات

### الأنواع والتصنيفات:

- **أدوار المستخدمين**: ADMIN, MANAGER, EMPLOYEE, USER
- **أنواع العملاء**: INDIVIDUAL (فردي), COMPANY (شركة), WORKSHOP (ورشة)
- **أنواع البيع**: REGULAR (عادي), BRANCH (للمحلات), WORKSHOP (للورش)
- **أنواع الدفع**: CASH (نقدي), CREDIT (آجل)
- **طرق الدفع**: CASH (نقدي), BANK (مصرفي), CHECK (شيك)
- **حالات الفواتير**: PENDING, PARTIAL, PAID, CANCELLED
- **حالات التحويلات**: PENDING, SENT, RECEIVED, CANCELLED

## 💼 أنواع البيع المدعومة

### 1. البيع العادي (B2B/B2C)
- بيع مباشر من المخزن الرئيسي للعملاء
- يشمل الشركات والأفراد والورش
- سعر واحد يتم تحديده من شاشة المبيعات
- خصم من المخزون الرئيسي مباشرة

### 2. البيع للمحلات التابعة للشركة
- تحويل البضاعة من المخزن الرئيسي للمحلات
- نظام تسعير مزدوج:
  - **سعر التحويل**: من المخزن الرئيسي للمحل
  - **سعر البيع**: من المحل للعميل النهائي
- إدارة مخزون منفصل لكل محل
- تتبع الأرباح على مستوى المحل
- شاشة منفصلة لتسعير المنتجات للمحلات

### 3. البيع للورش
- نفس آلية البيع العادي لكن للورش المتخصصة
- تصنيف خاص للعملاء كورش سيارات
- إمكانية أسعار خاصة للورش
- تقارير منفصلة لمبيعات الورش

## 🚀 البدء السريع

### المتطلبات الأساسية

- Node.js (الإصدار 18 أو أحدث)
- npm أو yarn
- PostgreSQL (الإصدار 12 أو أحدث)
- معرفة أساسية بـ TypeScript

### التثبيت

1. **انتقل إلى مجلد الخادم:**
   ```bash
   cd G:\GearSystem\server
   ```

2. **ثبت التبعيات:**
   ```bash
   npm install
   ```

3. **إعداد متغيرات البيئة:**
   ```bash
   # انسخ الملف النموذجي
   copy config.example .env
   
   # عدل الملف .env بالقيم المناسبة
   ```

4. **إعداد PostgreSQL:**
   ```bash
   # تأكد من تشغيل PostgreSQL على المنفذ 5432
   # قم بإنشاء قاعدة البيانات (إذا لم تكن موجودة)
   npm run db:create
   ```

5. **إعداد قاعدة البيانات:**
   ```bash
   # إعداد شامل (أوصى به للبداية)
   npm run db:setup
   
   # أو خطوة بخطوة:
   # توليد Prisma client
   npm run prisma:generate
   
   # تطبيق الهجرات
   npm run prisma:migrate
   
   # إدراج البيانات الأولية
   npm run prisma:seed
   ```

## 🏃‍♂️ تشغيل التطبيق

### وضع التطوير
```bash
npm run dev
```

### وضع التطوير (بديل)
```bash
npm run start:dev
```

### وضع الإنتاج
```bash
# بناء المشروع
npm run build

# تشغيل الخادم
npm start
```

### فحص الأنواع
```bash
npm run type-check
```

## 🔧 أوامر قاعدة البيانات (PostgreSQL)

### الإعداد الأولي
```bash
# إنشاء قاعدة البيانات
npm run db:create

# إعداد شامل (توليد + هجرة + بيانات أولية)
npm run db:setup
```

### أوامر Prisma الأساسية
```bash
# توليد Prisma client
npm run prisma:generate

# إنشاء وتطبيق الهجرات (للتطوير)
npm run prisma:migrate

# نشر الهجرات (للإنتاج)
npm run prisma:migrate:prod

# إعادة تعيين قاعدة البيانات (مع تأكيد فوري)
npm run prisma:migrate:reset

# فتح Prisma Studio
npm run prisma:studio

# إدراج البيانات الأولية
npm run prisma:seed
```

### إدارة قاعدة البيانات
```bash
# دفع تغييرات Schema مباشرة (للتطوير فقط)
npm run db:push

# سحب Schema من قاعدة البيانات الموجودة
npm run db:pull

# إعادة تعيين كامل مع إعادة تشغيل البيانات الأولية
npm run db:reset

# حالة الهجرات
npm run db:status

# حذف قاعدة البيانات (خطر!)
npm run db:drop
```

## 📡 مسارات API

### المصادقة
- `POST /api/auth/login` - تسجيل الدخول
- `POST /api/auth/register` - تسجيل مستخدم جديد
- `POST /api/auth/logout` - تسجيل الخروج

### المنتجات
- `GET /api/products` - عرض جميع المنتجات
- `POST /api/products` - إضافة منتج جديد
- `GET /api/products/:id` - عرض منتج محدد
- `PUT /api/products/:id` - تحديث منتج
- `DELETE /api/products/:id` - حذف منتج

### المخزون
- `GET /api/inventory` - عرض حالة المخزون
- `POST /api/inventory/update` - تحديث المخزون
- `GET /api/inventory/low-stock` - المنتجات منخفضة المخزون

### الموردين
- `GET /api/suppliers` - عرض جميع الموردين
- `POST /api/suppliers` - إضافة مورد جديد
- `PUT /api/suppliers/:id` - تحديث مورد
- `DELETE /api/suppliers/:id` - حذف مورد

### العملاء
- `GET /api/customers` - عرض جميع العملاء
- `POST /api/customers` - إضافة عميل جديد
- `PUT /api/customers/:id` - تحديث عميل
- `DELETE /api/customers/:id` - حذف عميل

### المحلات
- `GET /api/branches` - عرض جميع المحلات
- `POST /api/branches` - إضافة محل جديد
- `GET /api/branches/:id` - عرض محل محدد
- `PUT /api/branches/:id` - تحديث محل
- `DELETE /api/branches/:id` - حذف محل
- `GET /api/branches/:id/inventory` - مخزون المحل
- `POST /api/branches/:id/pricing` - تسعير المنتجات للمحل

### فواتير الشراء
- `GET /api/purchases` - عرض فواتير الشراء
- `POST /api/purchases` - إنشاء فاتورة شراء جديدة
- `GET /api/purchases/:id` - عرض فاتورة محددة
- `PUT /api/purchases/:id` - تحديث فاتورة

### فواتير البيع
- `GET /api/sales` - عرض فواتير البيع العادية
- `POST /api/sales` - إنشاء فاتورة بيع جديدة
- `GET /api/sales/:id` - عرض فاتورة محددة

### فواتير بيع المحلات
- `GET /api/branch-sales` - عرض فواتير بيع المحلات
- `POST /api/branch-sales` - إنشاء فاتورة بيع للمحل
- `GET /api/branch-sales/:id` - عرض فاتورة محددة
- `GET /api/branches/:id/sales` - مبيعات محل محدد

### تحويلات البضاعة
- `GET /api/transfers` - عرض جميع التحويلات
- `POST /api/transfers` - إنشاء تحويل جديد
- `GET /api/transfers/:id` - عرض تحويل محدد
- `PUT /api/transfers/:id/status` - تحديث حالة التحويل

### المدفوعات
- `GET /api/payments` - عرض المدفوعات
- `POST /api/payments` - تسجيل دفعة جديدة

### التقارير
- `GET /api/reports/inventory` - تقرير المخزون الرئيسي
- `GET /api/reports/branch-inventory` - تقرير مخزون المحلات
- `GET /api/reports/sales` - تقرير المبيعات العادية
- `GET /api/reports/branch-sales` - تقرير مبيعات المحلات
- `GET /api/reports/transfers` - تقرير التحويلات
- `GET /api/reports/purchases` - تقرير المشتريات
- `GET /api/reports/workshop-sales` - تقرير مبيعات الورش
- `GET /api/reports/dashboard` - إحصائيات لوحة التحكم

## 💡 الخطوات التالية

### المرحلة الأولى (الأساسيات)
- [x] إعداد هيكل المشروع
- [x] إنشاء مخطط قاعدة البيانات
- [x] إعداد الخادم الأساسي
- [ ] نظام المصادقة والتفويض
- [ ] إدارة المنتجات الأساسية
- [ ] إدارة المخزون البسيطة

### المرحلة الثانية (المتقدمة)
- [ ] فواتير الشراء والبيع
- [ ] نظام المدفوعات
- [ ] إدارة الموردين والعملاء
- [ ] نظام الأكواد والباركود
- [ ] البحث والفلترة

### المرحلة الثالثة (التقارير والتحليلات)
- [ ] لوحة التحكم الرئيسية
- [ ] تقارير تفصيلية
- [ ] إحصائيات ومؤشرات الأداء
- [ ] تصدير البيانات
- [ ] النسخ الاحتياطي

## 🔍 العمليات الأساسية

### إضافة منتج جديد
```typescript
POST /api/products
{
  "code": "P001",
  "barcode": "1234567890123",
  "name": "فلتر زيت",
  "description": "فلتر زيت لسيارات تويوتا",
  "categoryId": "cat_123",
  "unit": "قطعة",
  "minStockLevel": 10,
  "maxStockLevel": 100
}
```

### إنشاء فاتورة شراء
```typescript
POST /api/purchases
{
  "invoiceNumber": "P-2024-001",
  "supplierId": "sup_123",
  "invoiceDate": "2024-01-15",
  "paymentType": "CREDIT",
  "paymentMethod": "BANK",
  "items": [
    {
      "productId": "prod_123",
      "quantity": 50,
      "unitPrice": 25.50
    }
  ]
}
```

## 🛠️ استكشاف الأخطاء

### مشاكل شائعة

1. **خطأ اتصال قاعدة البيانات**
   - تحقق من DATABASE_URL في .env
   - تأكد من صلاحيات ملف قاعدة البيانات

2. **أخطاء JWT**
   - تحقق من JWT_SECRET في .env
   - تأكد من إعدادات انتهاء الصلاحية

3. **مشاكل في مساحة القرص**
   - نظف مساحة القرص قبل تشغيل `npm install`
   - استخدم `npm cache clean --force`

4. **أخطاء TypeScript**
   - تشغيل `npm run type-check` لرؤية الأخطاء التفصيلية
   - تحقق من صيغة imports/exports

## 📞 الدعم

للمساعدة والاستفسارات، يرجى التواصل مع فريق التطوير.

## 📄 الترخيص

MIT License - راجع ملف LICENSE للتفاصيل.

---

**ملاحظة**: هذا المشروع في مرحلة التطوير الأولية. يُرجى اتباع الخطوات بعناية ومراجعة التوثيق بانتظام للحصول على التحديثات.

