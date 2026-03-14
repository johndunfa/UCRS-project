'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarPlus,
  Clock,
  Car,
  Bell,
  User,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function StaffLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/staff', icon: LayoutDashboard },
    { name: 'New Request', href: '/dashboard/staff/create-request', icon: CalendarPlus },
    { name: 'My Requests', href: '/dashboard/staff/my-requests', icon: Clock },
    { name: 'Available Vehicles', href: '/dashboard/staff/vehicles', icon: Car },
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
          <h1 className="text-xl font-bold text-blue-600">Staff Portal</h1>
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

          <div className="absolute bottom-8 left-0 w-full px-4">
            <button className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600">
              <LogOut className="w-5 h-5 mr-3 text-gray-500" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`lg:ml-64 transition-margin duration-300 ${
        sidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Top Navigation */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`lg:hidden ${sidebarOpen ? 'hidden' : 'block'}`}
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1"></div>

            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">Staff User</p>
                  <p className="text-xs text-gray-500">Department</p>
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