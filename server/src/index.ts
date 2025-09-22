import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { ApiError } from './types/index.js';

// Load environment variables
dotenv.config();

// Initialize Prisma Client
const prisma = new PrismaClient();

// Initialize Express app
const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '5000', 10);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests',
    message: 'الكثير من الطلبات من هذا العنوان، يرجى المحاولة لاحقاً'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions: cors.CorsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};
app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Custom request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📥 ${req.method} ${req.path} - من ${req.ip}`);
  
  // Log suppliers requests specifically
  if (req.path.includes('/suppliers')) {
    console.log('🔍 Suppliers request detected:', req.path);
  }
  
  next();
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'نظام إدارة قطع غيار السيارات يعمل بنجاح',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Welcome endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'مرحباً بك في نظام إدارة قطع غيار السيارات',
    description: 'نظام شامل لإدارة المخزون والمبيعات والمشتريات',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// API base route
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'API نظام إدارة قطع الغيار',
    version: '1.0.0',
    status: 'يعمل بنجاح',
    timestamp: new Date().toISOString(),
    availableRoutes: [
      'GET /health - فحص حالة النظام',
      'GET /api/test - اختبار بسيط',
      'GET /api/categories - جلب الأصناف',
      'GET /api/products - جلب المنتجات',
      'GET /api/suppliers - جلب الموردين',
      'POST /api/auth/login - تسجيل الدخول',
      'POST /api/auth/register - تسجيل مستخدم جديد',
      'GET /api/auth/verify - التحقق من صحة الرمز',
      'POST /api/auth/logout - تسجيل الخروج',
    ]
  });
});

// Test endpoint without database
app.get('/api/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'اختبار API ناجح!',
    timestamp: new Date().toISOString(),
    data: {
      server: 'يعمل بنجاح',
      database: 'سيتم اختباره لاحقاً',
      cors: 'مفعل',
      port: PORT
    }
  });
});

// Create stores table endpoint (temporary)
app.post('/api/create-stores-table', async (req: Request, res: Response) => {
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
    const count = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "stores"` as any[];
    
    res.json({
      success: true,
      message: 'تم إنشاء جدول المحلات وإدراج البيانات بنجاح',
      data: {
        storesCount: count[0].count
      }
    });
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء جدول المحلات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء جدول المحلات',
      error: error instanceof Error ? error.message : 'خطأ غير معروف'
    });
  }
});

// Import routes
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import supplierRoutes from './routes/suppliers.js';
import productRoutes from './routes/products.js';
import purchaseRoutes from './routes/purchases.js';
import inventoryRoutes from './routes/inventory.js';
import storeRoutes from './routes/stores.js';
import customerRoutes from './routes/customers.js';
import salesRoutes from './routes/sales.js';
import branchProductPricingRoutes from './routes/branchProductPricing.js';

// API Routes
console.log('🔗 تسجيل مسارات API...');
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/branch-product-pricing', branchProductPricingRoutes);
console.log('✅ تم تسجيل جميع مسارات API');


// Error handling middleware
app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error('Error stack:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'خطأ داخلي في الخادم';
  
  res.status(statusCode).json({
    error: 'حدث خطأ ما!',
    message: process.env.NODE_ENV === 'development' ? message : 'خطأ داخلي في الخادم',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    error: 'المسار غير موجود',
    message: `المسار ${req.originalUrl} غير متاح`,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /api'
    ]
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`تم استلام إشارة ${signal}. إغلاق النظام بأمان...`);
  
  try {
    await prisma.$disconnect();
    console.log('تم إغلاق اتصالات قاعدة البيانات.');
    process.exit(0);
  } catch (error) {
    console.error('خطأ أثناء الإغلاق:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('استثناء غير معالج:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('وعد مرفوض غير معالج:', promise, 'السبب:', reason);
  process.exit(1);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 خادم نظام قطع الغيار يعمل على المنفذ ${PORT}`);
  console.log(`📊 فحص الحالة: http://localhost:${PORT}/health`);
  console.log(`🌍 البيئة: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS مفعل لـ: ${process.env.CLIENT_URL || 'http://localhost:5000'}`);
  console.log(`📝 API: http://localhost:${PORT}/api`);
});

// Handle server errors
server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} يتطلب صلاحيات عليا`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} قيد الاستخدام بالفعل`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

export default app;

