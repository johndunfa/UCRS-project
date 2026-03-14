'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle,
  XCircle,
  Car,
  Calendar,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import RecentRequests from '@/components/RecentRequests';
import QuickActions from '@/components/QuickActions';

export default function StaffDashboard() {
  const [stats, setStats] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch('/api/requests/stats/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch recent requests
      const requestsResponse = await fetch('/api/requests/my-requests?limit=5', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const requestsData = await requestsResponse.json();
      if (requestsData.success) {
        setRecentRequests(requestsData.requests);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Requests',
      value: stats?.total || 0,
      icon: Clock,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Pending',
      value: stats?.pending || 0,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      change: stats?.pending > 0 ? 'Action needed' : 'No pending',
      changeType: 'neutral'
    },
    {
      title: 'Approved',
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'increase'
    },
    {
      title: 'Completed',
      value: stats?.completed || 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      change: '+8%',
      changeType: 'increase'
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
        <h1 className="text-2xl font-bold mb-2">Welcome back, John! 👋</h1>
        <p className="text-gray-600">Here's what's happening with your requests today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <RecentRequests requests={recentRequests} />
        </div>

        {/* Upcoming Trips */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Upcoming Trips</h2>
          
          {stats?.upcomingTrips > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium">Trip to Conference</p>
                    <p className="text-sm text-gray-600">Tomorrow, 9:00 AM</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Approved
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="font-medium">Field Visit</p>
                    <p className="text-sm text-gray-600">Fri, 2:00 PM</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Approved
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming trips</p>
              <Link
                href="/dashboard/staff/create-request"
                className="inline-block mt-4 text-sm text-blue-600 hover:text-blue-800"
              >
                Create a request →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Submit requests at least 24 hours in advance for better availability</li>
          <li>• You can track your request status in real-time</li>
          <li>• Add special requirements if you need specific vehicle features</li>
          <li>• Cancellations must be made at least 2 hours before the trip</li>
        </ul>
      </div>
    </div>
  );
}