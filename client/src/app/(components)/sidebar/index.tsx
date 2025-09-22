"use client";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSidebarCollapsed } from "@/state";
import { 
  Layout, 
  LucideIcon, 
  Menu, 
  Package, 
  Users, 
  ShoppingCart, 
  ShoppingBag,
  TrendingUp, 
  Store, 
  Wrench,
  FileText,
  BarChart3,
  Settings,
  Car,
  Tags
} from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";
import Link from "next/link";

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
  badge?: number;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
  badge,
}: SidebarLinkProps) => {
  const pathName = usePathname();
  const isActive = pathName === href || (pathName === "/" && href === "/dashboard");

  return (
    <Link href={href}>
      <div
        className={`cursor-pointer flex items-center mx-2 mb-1 rounded-xl transition-all duration-200 ${
          isCollapsed ? "justify-center py-3" : "justify-start px-4 py-3"
        } ${
          isActive 
            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg" 
            : "hover:bg-gray-100 text-gray-700 hover:text-blue-600"
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
        <span
          className={`${isCollapsed ? "hidden" : "block"} font-medium mr-3 text-sm`}
        >
          {label}
        </span>
        {badge && !isCollapsed && (
          <span className="mr-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `font-tajawal fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-20" : "w-72 md:w-64"
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-xl border-l border-gray-100 z-40`;

  return (
    <div className={sidebarClassNames}>
      {/* TOP LOGO */}
      <div
        className={`flex gap-3 items-center pt-6 pb-4 border-b border-gray-100 ${
          isSidebarCollapsed ? "px-4 justify-center" : "px-6"
        }`}
      >
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
          <Car className="w-6 h-6 text-white" />
        </div>
        <div className={`${isSidebarCollapsed ? "hidden" : "block"}`}>
          <h1 className="font-bold text-lg text-gray-800">نظام قطع الغيار</h1>
          <p className="text-xs text-gray-500">إدارة شاملة للمخزون</p>
        </div>
        <button
          className="md:hidden p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* NAVIGATION LINKS */}
      <div className="flex-grow py-4 overflow-y-auto">
        <nav className="space-y-1">
          {/* لوحة التحكم */}
          <SidebarLink
            href="/dashboard"
            icon={Layout}
            label="لوحة التحكم"
            isCollapsed={isSidebarCollapsed}
          />

          {/* إدارة قطع الغيار */}
          <div className={`${isSidebarCollapsed ? "hidden" : "px-4 py-2"}`}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">قطع الغيار</h3>
          </div>
          
          <SidebarLink
            href="/categories"
            icon={Tags}
            label="أنواع السيارات"
            isCollapsed={isSidebarCollapsed}
          />

          <SidebarLink
            href="/products"
            icon={Package}
            label="قطع الغيار"
            isCollapsed={isSidebarCollapsed}
          />

          <SidebarLink
            href="/inventory"
            icon={BarChart3}
            label="مخزون القطع"
            isCollapsed={isSidebarCollapsed}
          />

          <SidebarLink
            href="/stores"
            icon={Store}
            label="المحلات"
            isCollapsed={isSidebarCollapsed}
          />

          {/* إدارة العلاقات */}
          <div className={`${isSidebarCollapsed ? "hidden" : "px-4 py-2 mt-4"}`}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">إدارة العلاقات</h3>
          </div>

          <SidebarLink
            href="/suppliers"
            icon={Users}
            label="الموردين"
            isCollapsed={isSidebarCollapsed}
          />

          <SidebarLink
            href="/customers"
            icon={Users}
            label="العملاء"
            isCollapsed={isSidebarCollapsed}
          />

          <SidebarLink
            href="/workshops"
            icon={Wrench}
            label="ورش السيارات"
            isCollapsed={isSidebarCollapsed}
          />

          {/* المبيعات والمشتريات */}
          <div className={`${isSidebarCollapsed ? "hidden" : "px-4 py-2 mt-4"}`}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">المعاملات</h3>
          </div>

          <SidebarLink
            href="/purchases"
            icon={ShoppingBag}
            label="المشتريات"
            isCollapsed={isSidebarCollapsed}
          />
          
          <SidebarLink
            href="/sales"
            icon={TrendingUp}
            label="المبيعات"
            isCollapsed={isSidebarCollapsed}
          />

          <SidebarLink
            href="/transfers"
            icon={FileText}
            label="التحويلات"
            isCollapsed={isSidebarCollapsed}
          />

          {/* التقارير */}
          <div className={`${isSidebarCollapsed ? "hidden" : "px-4 py-2 mt-4"}`}>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">التقارير</h3>
          </div>

          <SidebarLink
            href="/reports"
            icon={BarChart3}
            label="التقارير"
            isCollapsed={isSidebarCollapsed}
          />

          <SidebarLink
            href="/settings"
            icon={Settings}
            label="الإعدادات"
            isCollapsed={isSidebarCollapsed}
          />
        </nav>
      </div>

      {/* FOOTER */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} p-4 border-t border-gray-100`}>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-800 mb-1">الإصدار 1.0.0</p>
          <p className="text-xs text-gray-600">
            &copy; 2024 شركة ARABTECH
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
