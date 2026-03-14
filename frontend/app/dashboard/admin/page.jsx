'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  Car,
  CalendarCheck,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import RecentActivity from '@/components/RecentActivity';
import Chart from '@/components/Chart';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.users?.total || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Active Vehicles',
      value: stats?.vehicles?.available || 0,
      icon: Car,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'increase'
    },
    {
      title: 'Pending Requests',
      value: stats?.requests?.pending || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      change: '-3%',
      changeType: 'decrease'
    },
    {
      title: 'Ongoing Trips',
      value: stats?.trips?.ongoing || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'increase'
    }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Request Trends</h2>
          <Chart type="line" />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Vehicle Utilization</h2>
          <Chart type="pie" />
        </div>
      </div>

      {/* User Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Users by Role</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Staff</span>
              <span className="font-semibold">{stats?.users?.byRole?.staff || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Transport Officers</span>
              <span className="font-semibold">{stats?.users?.byRole?.transport || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Drivers</span>
              <span className="font-semibold">{stats?.users?.byRole?.driver || 0}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: '20%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Request Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <span>Approved</span>
              </div>
              <span className="font-semibold">{stats?.requests?.approved || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-yellow-500 mr-2" />
                <span>Pending</span>
              </div>
              <span className="font-semibold">{stats?.requests?.pending || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                <span>Rejected</span>
              </div>
              <span className="font-semibold">0</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Vehicle Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-green-600">Available</span>
              <span className="font-semibold">{stats?.vehicles?.available || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-600">Assigned</span>
              <span className="font-semibold">{stats?.vehicles?.assigned || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-yellow-600">Maintenance</span>
              <span className="font-semibold">{stats?.vehicles?.maintenance || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6">
        <RecentActivity />
      </div>
    </div>
  );
}