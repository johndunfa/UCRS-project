'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle,
  Car,
  Users,
  AlertCircle,
  TrendingUp,
  Calendar,
  ArrowRight
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import PendingRequestsList from '@/components/PendingRequestsList';

export default function TransportDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/transport/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch recent pending requests
      const requestsResponse = await fetch('/api/transport/pending-requests?limit=5', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const requestsData = await requestsResponse.json();
      if (requestsData.success) {
        setPendingRequests(requestsData.requests);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Pending Requests',
      value: stats?.pending?.total || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      change: `${stats?.pending?.urgent || 0} urgent`,
      changeType: 'urgent'
    },
    {
      title: 'Approved',
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: 'Ready to assign',
      changeType: 'neutral'
    },
    {
      title: 'Available Vehicles',
      value: stats?.vehicles?.available || 0,
      icon: Car,
      color: 'bg-blue-500',
      change: `out of ${stats?.vehicles?.total || 0}`,
      changeType: 'neutral'
    },
    {
      title: 'Available Drivers',
      value: stats?.drivers?.available || 0,
      icon: Users,
      color: 'bg-purple-500',
      change: `out of ${stats?.drivers?.total || 0}`,
      changeType: 'neutral'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Transport Officer Dashboard</h1>
        <p className="text-gray-600">Manage vehicle requests and fleet assignments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Urgent Alerts */}
      {stats?.pending?.urgent > 0 && (
        <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">
              <span className="font-bold">{stats.pending.urgent} urgent requests</span> waiting for approval
            </p>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pending Requests</h2>
              <Link
                href="/dashboard/transport/pending-requests"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <PendingRequestsList requests={pendingRequests} />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-500 mr-2" />
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {stats?.todayTrips || 0}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Scheduled Trips</span>
                <span className="font-medium">{stats?.todayTrips || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available Vehicles</span>
                <span className="font-medium">{stats?.vehicles?.available || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available Drivers</span>
                <span className="font-medium">{stats?.drivers?.available || 0}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/dashboard/transport/pending-requests"
                className="flex items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100"
              >
                <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                <div>
                  <p className="font-medium">Review Pending</p>
                  <p className="text-sm text-gray-600">{stats?.pending?.total} requests to review</p>
                </div>
              </Link>
              
              <Link
                href="/dashboard/transport/assign-car"
                className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100"
              >
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium">Assign Vehicles</p>
                  <p className="text-sm text-gray-600">{stats?.approved || 0} approved requests</p>
                </div>
              </Link>
              
              <Link
                href="/dashboard/transport/fleet"
                className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                <Car className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">Check Fleet Status</p>
                  <p className="text-sm text-gray-600">{stats?.vehicles?.available} vehicles available</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}