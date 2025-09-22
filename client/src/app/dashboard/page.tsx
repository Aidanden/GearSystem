"use client";

import React from 'react';
import AuthGuard from '@/app/components/AuthGuard';
import { useAppSelector } from '@/app/redux';
import { Package, Users, TrendingUp, Store, AlertTriangle, DollarSign } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }: {
  title: string;
  value: string;
  icon: any;
  color: string;
  trend?: string;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className="text-sm text-green-600 mt-1">
            ↗ {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <AuthGuard>
      <div className="space-y-6 font-tajawal">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            مرحباً، {user ? `${user.firstName || user.username}` : 'المستخدم'}! 👋
          </h1>
          <p className="text-blue-100">
            إليك نظرة عامة على نشاط النظام اليوم
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="إجمالي المنتجات"
            value="1,248"
            icon={Package}
            color="bg-blue-500"
            trend="+12% هذا الأسبوع"
          />
          <StatCard
            title="المخزون المنخفض"
            value="23"
            icon={AlertTriangle}
            color="bg-red-500"
          />
          <StatCard
            title="إجمالي العملاء"
            value="856"
            icon={Users}
            color="bg-green-500"
            trend="+8% هذا الشهر"
          />
          <StatCard
            title="مبيعات اليوم"
            value="15,420 د.ل"
            icon={DollarSign}
            color="bg-indigo-500"
            trend="+23% من أمس"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">النشاط الأخير</h3>
            <div className="space-y-4">
              {[
                { action: 'إضافة منتج جديد', item: 'فلتر زيت تويوتا', time: 'منذ 5 دقائق' },
                { action: 'فاتورة بيع', item: 'فاتورة #1234', time: 'منذ 15 دقيقة' },
                { action: 'تحديث المخزون', item: 'إطارات ميشلان', time: 'منذ 30 دقيقة' },
                { action: 'عميل جديد', item: 'ورشة النجم', time: 'منذ ساعة' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.item}</p>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">روابط سريعة</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'إضافة منتج', href: '/products/new', icon: Package, color: 'bg-blue-500' },
                { title: 'فاتورة بيع', href: '/sales/new', icon: TrendingUp, color: 'bg-green-500' },
                { title: 'عرض المخزون', href: '/inventory', icon: Store, color: 'bg-indigo-500' },
                { title: 'إدارة العملاء', href: '/customers', icon: Users, color: 'bg-purple-500' },
              ].map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                >
                  <div className={`p-2 rounded-lg ${link.color} group-hover:scale-110 transition-transform`}>
                    <link.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700 mt-2">{link.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Chart Section - Placeholder */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">إحصائيات المبيعات</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">سيتم إضافة الرسوم البيانية قريباً</p>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
