import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Role } from '../types/index.js';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    username: string;
    email: string;
    role: Role;
  };
}

// Middleware للمصادقة
export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        error: 'غير مصرح',
        message: 'لم يتم توفير رمز المصادقة'
      });
      return;
    }

    // التحقق من صحة الـ JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // البحث عن المستخدم في قاعدة البيانات
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      res.status(401).json({
        error: 'رمز غير صحيح',
        message: 'المستخدم غير موجود'
      });
      return;
    }

    // التحقق من أن المستخدم نشط
    if (!user.isActive) {
      res.status(403).json({
        error: 'حساب معطل',
        message: 'تم إلغاء تفعيل حسابك'
      });
      return;
    }

    // إضافة معلومات المستخدم للطلب
    req.user = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role as Role
    };

    next();

  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        error: 'رمز غير صحيح',
        message: 'رمز المصادقة غير صالح'
      });
      return;
    }
    
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        error: 'رمز منتهي الصلاحية',
        message: 'يرجى تسجيل الدخول مرة أخرى'
      });
      return;
    }

    console.error('خطأ في المصادقة:', error);
    res.status(500).json({
      error: 'فشل في المصادقة',
      message: 'خطأ داخلي في الخادم'
    });
  }
};

// Middleware للتحقق من أدوار المستخدمين
export const requireRole = (allowedRoles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'مصادقة مطلوبة',
          message: 'يرجى تسجيل الدخول أولاً'
        });
        return;
      }

      if (!allowedRoles.includes(req.user.role)) {
        res.status(403).json({
          error: 'صلاحيات غير كافية',
          message: `الأدوار المطلوبة: ${allowedRoles.join(' أو ')}`
        });
        return;
      }

      next();

    } catch (error: any) {
      console.error('خطأ في فحص الدور:', error);
      res.status(500).json({
        error: 'فشل في التفويض',
        message: 'خطأ داخلي في الخادم'
      });
    }
  };
};

// Middleware للمصادقة الاختيارية (لا يفشل إذا لم يكن هناك token)
export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = undefined;
      next();
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (user && user.isActive) {
      req.user = {
        userId: user.id,
        username: user.username,
        email: user.email,
        role: user.role as Role
      };
    } else {
      req.user = undefined;
    }

    next();

  } catch (error: any) {
    // إذا كان الـ token غير صحيح، فقط تجاهله واستمر
    req.user = undefined;
    next();
  }
};
