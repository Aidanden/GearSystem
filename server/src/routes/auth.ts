import express, { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.js';
import { Role } from '../types/index.js';

const router = express.Router();
const prisma = new PrismaClient();

// تسجيل الدخول
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('البريد الإلكتروني غير صحيح'),
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة')
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'بيانات غير صحيحة',
        details: errors.array()
      });
      return;
    }

    const { email, password } = req.body;

    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    if (!user) {
      res.status(401).json({
        error: 'بيانات دخول خاطئة',
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
      return;
    }

    // التحقق من أن الحساب نشط
    if (!user.isActive) {
      res.status(403).json({
        error: 'حساب معطل',
        message: 'تم إلغاء تفعيل حسابك، يرجى الاتصال بالإدارة'
      });
      return;
    }

    // التحقق من كلمة المرور
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({
        error: 'بيانات دخول خاطئة',
        message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
      });
      return;
    }

    // إنشاء JWT token
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // تسجيل العملية في سجل المراجعة
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        details: { 
          email: user.email,
          loginTime: new Date().toISOString(),
          userAgent: req.get('User-Agent'),
          ip: req.ip
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    const userResponse = {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: userResponse
    });

  } catch (error: any) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({
      error: 'فشل في تسجيل الدخول',
      message: 'خطأ داخلي في الخادم'
    });
  }
});

// تسجيل مستخدم جديد (للمديرين فقط)
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('البريد الإلكتروني غير صحيح'),
  body('username').isLength({ min: 3 }).trim().withMessage('اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  body('password').isLength({ min: 6 }).withMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  body('firstName').optional().trim(),
  body('lastName').optional().trim(),
  body('role').optional().isIn(Object.values(Role)).withMessage('دور غير صحيح')
], async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'بيانات غير صحيحة',
        details: errors.array()
      });
      return;
    }

    const { email, username, password, firstName, lastName, role } = req.body;

    // التحقق من عدم وجود مستخدم بنفس البريد أو اسم المستخدم
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      res.status(409).json({
        error: 'مستخدم موجود بالفعل',
        message: 'البريد الإلكتروني أو اسم المستخدم مستخدم بالفعل'
      });
      return;
    }

    // تشفير كلمة المرور
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // إنشاء المستخدم
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || Role.USER
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      }
    });

    // تسجيل العملية في سجل المراجعة
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        details: { email, username, role: user.role },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.status(201).json({
      message: 'تم إنشاء المستخدم بنجاح',
      user
    });

  } catch (error: any) {
    console.error('خطأ في التسجيل:', error);
    res.status(500).json({
      error: 'فشل في التسجيل',
      message: 'خطأ داخلي في الخادم'
    });
  }
});

// التحقق من صحة الـ token
router.get('/verify', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        error: 'لا يوجد رمز مصادقة',
        valid: false
      });
      return;
    }

    // التحقق من الـ JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // البحث عن المستخدم
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      res.status(401).json({
        error: 'رمز غير صحيح أو منتهي الصلاحية',
        valid: false
      });
      return;
    }

    res.json({
      valid: true,
      user
    });

  } catch (error: any) {
    res.status(401).json({
      error: 'رمز غير صحيح',
      valid: false
    });
  }
});

// تسجيل الخروج
router.post('/logout', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      // تسجيل العملية في سجل المراجعة
      const decoded = jwt.decode(token) as any;
      if (decoded?.userId) {
        await prisma.auditLog.create({
          data: {
            userId: decoded.userId,
            action: 'USER_LOGOUT',
            details: {
              logoutTime: new Date().toISOString()
            },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          }
        });
      }
    }

    res.json({
      message: 'تم تسجيل الخروج بنجاح'
    });

  } catch (error: any) {
    console.error('خطأ في تسجيل الخروج:', error);
    res.status(500).json({
      error: 'فشل في تسجيل الخروج',
      message: 'خطأ داخلي في الخادم'
    });
  }
});

export default router;

