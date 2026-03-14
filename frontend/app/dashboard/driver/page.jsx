'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Truck,
  TrendingUp,
  ArrowRight,
  Play,
  Flag
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import CurrentTripCard from '@/components/CurrentTripCard';

export default function DriverDashboard() {
  const [stats, setStats] = useState(null);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/driver/stats', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
        setCurrentTrip(data.currentTrip);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Trips',
      value: stats?.totalTrips || 0,
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      title: 'Completed',
      value: stats?.completedTrips || 0,
      icon: CheckCircle,
      color: 'bg-green-500'
    },
    {
      title: 'Today\'s Trips',
      value: stats?.scheduledToday || 0,
      icon: Calendar,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Distance',
      value: stats?.totalDistance ? `${stats.totalDistance} km` : '0 km',
      icon: MapPin,
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Driver! 👋</h1>
        <p className="text-gray-600">Here's your driving schedule and current assignments.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Current Trip Section */}
      {currentTrip ? (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Current Assignment</h2>
          <CurrentTripCard trip={currentTrip} onUpdate={fetchDashboardData} />
        </div>
      ) : (
        <div className="mb-8 p-8 bg-gray-50 rounded-lg text-center">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Active Trips</h3>
          <p className="text-gray-500">You have no scheduled trips at the moment.</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/dashboard/driver/assigned-trips"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold">View All Trips</h3>
              <p className="text-sm text-gray-600">See your complete trip history</p>
            </div>
          </div>
          <div className="flex items-center text-blue-600 text-sm">
            View Trips <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>

        <Link
          href="/dashboard/driver/maintenance"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Truck className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <h3 className="font-semibold">Report Issue</h3>
              <p className="text-sm text-gray-600">Submit maintenance or damage report</p>
            </div>
          </div>
          <div className="flex items-center text-yellow-600 text-sm">
            Report Issue <ArrowRight className="w-4 h-4 ml-1" />
          </div>
        </Link>
      </div>

      {/* Quick Tips */}
      <div className="bg-green-50 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-2">🚗 Driver Tips</h3>
        <ul className="space-y-2 text-sm text-green-800">
          <li>• Always record start and end odometer readings accurately</li>
          <li>• Report any vehicle issues immediately</li>
          <li>• Update trip status in real-time for better tracking</li>
          <li>• Follow university driving policies and speed limits</li>
        </ul>
      </div>
    </div>
  );
}