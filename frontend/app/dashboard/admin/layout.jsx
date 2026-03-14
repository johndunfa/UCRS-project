'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Car,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  BarChart3
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
    { name: 'Fleet Management', href: '/dashboard/admin/fleet', icon: Car },
    { name: 'Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
    { name: 'System Logs', href: '/dashboard/admin/logs', icon: FileText },
    { name: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-blue-600">UCRS Admin</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="px-4 mt-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`} />
                {item.name}
              </Link>
            );
          })}

          <button
            className="flex items-center w-full px-4 py-3 mt-8 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="w-5 h-5 mr-3 text-gray-500" />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`lg:ml-64 transition-margin duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Top Navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden ${sidebarOpen ? 'hidden' : 'block'}`}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center flex-1 max-w-md ml-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">A</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}