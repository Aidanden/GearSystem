"use client";
import React from "react";
import { Bell, Menu, Settings, Sun, Search, Moon, User, LogOut, ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import { logoutUser } from "@/state/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isSidebarCollapsed = useAppSelector((state) => state.global.isSidebarCollapsed);
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const toggleSidebar = () => {
    dispatch(setIsSidebarCollapsed(!isSidebarCollapsed));
  };

  const toggleDarkMode = () => {
    dispatch(setIsDarkMode(!isDarkMode));
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };

  return (
    <div className="flex justify-between items-center w-full mb-8 font-tajawal bg-white shadow-sm border-b border-gray-100 px-6 py-4 rounded-lg">
      {/* LEFT SIDE */}
      <div className="flex items-center gap-6">
        <button
          className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-5 h-5 text-blue-600" />
        </button>
      
        <div className="relative">
          <input
            type="search"
            placeholder="البحث في النظام..."
            className="pl-12 pr-4 py-3 w-72 md:w-96 border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 relative">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
              3
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-gray-200"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-all duration-200 cursor-pointer group">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-700">
              {user ? `${user.firstName || user.username} ${user.lastName || ''}`.trim() : 'مدير النظام'}
            </p>
            <p className="text-xs text-gray-500">{user?.email || 'admin@gearsystem.ly'}</p>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
        </div>

        {/* Settings */}
        <Link href="/settings">
          <button className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200">
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </Link>

        {/* Logout */}
        <button 
          onClick={handleLogout}
          className="p-2 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200 group"
          title="تسجيل الخروج"
        >
          <LogOut className="w-5 h-5 text-red-600 group-hover:text-red-700" />
        </button>
      </div>
    </div>
  );
};

export default Navbar;
