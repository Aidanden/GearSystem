"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/app/redux';
import { verifyToken } from '@/state/authSlice';
import { Loader2 } from 'lucide-react';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'USER';
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // فحص التوكن عند تحميل الصفحة
    if (!isAuthenticated) {
      dispatch(verifyToken());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && requiredRole && user) {
      // فحص الصلاحيات
      const roleHierarchy = {
        'USER': 1,
        'EMPLOYEE': 2,
        'MANAGER': 3,
        'ADMIN': 4
      };

      const userLevel = roleHierarchy[user.role];
      const requiredLevel = roleHierarchy[requiredRole];

      if (userLevel < requiredLevel) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [isAuthenticated, requiredRole, user, router]);

  // إظهار شاشة التحميل
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-tajawal">جاري التحقق من المصادقة...</p>
        </div>
      </div>
    );
  }

  // إظهار شاشة التحميل إذا لم يكن مصادق
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-tajawal">جاري إعادة التوجيه...</p>
        </div>
      </div>
    );
  }

  // عرض المحتوى إذا كان مصادق ولديه الصلاحيات المطلوبة
  return <>{children}</>;
};

export default AuthGuard;
