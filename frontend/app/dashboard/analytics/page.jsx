'use client';

import { useState, useEffect } from 'react';
import {
  Car,
  FileText,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Truck
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import RequestsChart from '@/components/analytics/RequestsChart';
import VehicleStatusChart from '@/components/analytics/VehicleStatusChart';
import TripsChart from '@/components/analytics/TripsChart';
import TopDriversList from '@/components/analytics/TopDriversList';
import UtilizationGauge from '@/components/analytics/UtilizationGauge';
import DateRangePicker from '@/components/analytics/DateRangePicker';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [requestAnalytics, setRequestAnalytics] = useState(null);
  const [vehicleAnalytics, setVehicleAnalytics] = useState(null);
  const [tripAnalytics, setTripAnalytics] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date()
  });

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboardStats(),
        fetchRequestAnalytics(),
        fetchVehicleAnalytics(),
        fetchTripAnalytics(),
        fetchSystemOverview()
      ]);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/analytics/dashboard', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) setStats(data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchRequestAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics/requests?days=30`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) setRequestAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching request analytics:', error);
    }
  };

  const fetchVehicleAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/vehicles', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) setVehicleAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching vehicle analytics:', error);
    }
  };

  const fetchTripAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/trips', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) setTripAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching trip analytics:', error);
    }
  };

  const fetchSystemOverview = async () => {
    try {
      const response = await fetch('/api/analytics/overview', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) setOverview(data.overview);
    } catch (error) {
      console.error('Error fetching overview:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of system performance</p>
        </div>
        <DateRangePicker dateRange={dateRange} setDateRange={setDateRange} />
      </div>

      {/* Real-time Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Trips"
          value={overview?.current.activeTrips || 0}
          icon={Truck}
          color="bg-green-500"
          subtitle="Currently on road"
        />
        <StatCard
          title="Pending Requests"
          value={overview?.current.pendingRequests || 0}
          icon={Clock}
          color="bg-yellow-500"
          subtitle="Awaiting approval"
        />
        <StatCard
          title="Available Vehicles"
          value={overview?.current.availableVehicles || 0}
          icon={Car}
          color="bg-blue-500"
          subtitle="Ready for assignment"
        />
        <StatCard
          title="Today's Trips"
          value={overview?.today.trips || 0}
          icon={Activity}
          color="bg-purple-500"
          subtitle="Completed: {overview?.today.completedTrips || 0}"
        />
      </div>

      {/* Utilization Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UtilizationGauge
          title="Vehicle Utilization"
          value={overview?.utilization.vehicleUtilization || 0}
          icon={Car}
          color="blue"
        />
        <UtilizationGauge
          title="Approval Rate"
          value={overview?.utilization.requestApprovalRate || 0}
          icon={CheckCircle}
          color="green"
        />
        <UtilizationGauge
          title="Driver Productivity"
          value={overview?.utilization.driverProductivity || 0}
          icon={Users}
          color="purple"
          unit="trips/driver"
        />
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 text-blue-500 mr-2" />
            Request Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Requests</span>
              <span className="text-2xl font-bold">{stats?.requests.total || 0}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600">Pending</span>
                <span className="font-medium">{stats?.requests.pending || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(stats?.requests.pending / stats?.requests.total) * 100 || 0}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Approved</span>
                <span className="font-medium">{stats?.requests.approved || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${(stats?.requests.approved / stats?.requests.total) * 100 || 0}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-purple-600">Completed</span>
                <span className="font-medium">{stats?.requests.completed || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${(stats?.requests.completed / stats?.requests.total) * 100 || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Car className="w-5 h-5 text-green-500 mr-2" />
            Fleet Status
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Vehicles</span>
              <span className="text-2xl font-bold">{stats?.vehicles.total || 0}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-green-600">Available</p>
                <p className="text-xl font-bold text-green-700">{stats?.vehicles.available || 0}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-600">Assigned</p>
                <p className="text-xl font-bold text-blue-700">{stats?.vehicles.assigned || 0}</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-xs text-yellow-600">Maintenance</p>
                <p className="text-xl font-bold text-yellow-700">{stats?.vehicles.maintenance || 0}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-xs text-red-600">Out of Service</p>
                <p className="text-xl font-bold text-red-700">{stats?.vehicles.outOfService || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Stats */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Users className="w-5 h-5 text-purple-500 mr-2" />
            User Distribution
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Users</span>
              <span className="text-2xl font-bold">{stats?.users.total || 0}</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Staff</span>
                <div className="flex items-center">
                  <span className="font-medium mr-2">{stats?.users.staff || 0}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(stats?.users.staff / stats?.users.total) * 100 || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Drivers</span>
                <div className="flex items-center">
                  <span className="font-medium mr-2">{stats?.users.drivers || 0}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(stats?.users.drivers / stats?.users.total) * 100 || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Transport</span>
                <div className="flex items-center">
                  <span className="font-medium mr-2">{stats?.users.transport || 0}</span>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ width: `${(stats?.users.transport / stats?.users.total) * 100 || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requests Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Request Trends</h3>
          <RequestsChart data={requestAnalytics?.dailyTrends} />
        </div>

        {/* Vehicle Status Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Vehicle Status Distribution</h3>
          <VehicleStatusChart data={vehicleAnalytics?.byStatus} />
        </div>

        {/* Trips Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Daily Trips</h3>
          <TripsChart data={tripAnalytics?.dailyTrends} />
        </div>

        {/* Top Drivers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Top Performing Drivers</h3>
          <TopDriversList drivers={tripAnalytics?.topDrivers} />
        </div>
      </div>

      {/* Alerts and Warnings */}
      {(vehicleAnalytics?.upcomingMaintenance?.length > 0 || vehicleAnalytics?.expiringDocuments?.length > 0) && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Attention Required</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <ul className="list-disc pl-5 space-y-1">
                  {vehicleAnalytics?.upcomingMaintenance?.length > 0 && (
                    <li>{vehicleAnalytics.upcomingMaintenance.length} vehicles due for maintenance</li>
                  )}
                  {vehicleAnalytics?.expiringDocuments?.length > 0 && (
                    <li>{vehicleAnalytics.expiringDocuments.length} vehicles with expiring documents</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}