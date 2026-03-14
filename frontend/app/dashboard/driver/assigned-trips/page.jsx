'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  User,
  Car,
  Play,
  Flag,
  Eye,
  AlertCircle
} from 'lucide-react';
import TripDetailsModal from '@/components/TripDetailsModal';
import StartTripModal from '@/components/StartTripModal';
import EndTripModal from '@/components/EndTripModal';

export default function AssignedTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    dateRange: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchTrips();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      }).toString();

      const response = await fetch(`/api/driver/trips?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTrips(data.trips);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/driver/stats', {
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
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      scheduled: { color: 'bg-blue-100 text-blue-800', icon: Clock },
      'in-progress': { color: 'bg-yellow-100 text-yellow-800', icon: Play },
      completed: { color: 'bg-green-100 text-green-800', icon: Flag },
      cancelled: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
    };
    return config[status] || config.scheduled;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Trips</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Trips</p>
            <p className="text-2xl font-bold">{stats.totalTrips}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
            <p className="text-sm text-gray-600">Scheduled</p>
            <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search trips..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">All Dates</option>
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="this-week">This Week</option>
            <option value="next-week">Next Week</option>
          </select>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Destination
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No trips found
                  </td>
                </tr>
              ) : (
                trips.map((trip) => {
                  const StatusIcon = getStatusBadge(trip.status).icon;
                  return (
                    <tr key={trip._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-900">
                          {trip.tripId}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm text-gray-900">
                            {trip.request?.destination}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {trip.request?.purpose}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm">
                          <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                          {formatDate(trip.startTime)}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(trip.startTime)} - {formatTime(trip.estimatedEndTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Car className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm">
                            {trip.vehicle?.registrationNumber}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {trip.vehicle?.make} {trip.vehicle?.model}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-1" />
                          <span className="text-sm">
                            {trip.request?.requestedBy?.name}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {trip.request?.requestedBy?.department}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(trip.status).color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {trip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedTrip(trip);
                              setShowDetails(true);
                            }}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {trip.status === 'scheduled' && (
                            <button
                              onClick={() => {
                                setSelectedTrip(trip);
                                setShowStartModal(true);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Start Trip"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          
                          {trip.status === 'in-progress' && (
                            <button
                              onClick={() => {
                                setSelectedTrip(trip);
                                setShowEndModal(true);
                              }}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                              title="End Trip"
                            >
                              <Flag className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDetails && selectedTrip && (
        <TripDetailsModal
          trip={selectedTrip}
          onClose={() => {
            setShowDetails(false);
            setSelectedTrip(null);
          }}
        />
      )}

      {showStartModal && selectedTrip && (
        <StartTripModal
          trip={selectedTrip}
          onClose={() => {
            setShowStartModal(false);
            setSelectedTrip(null);
          }}
          onSuccess={() => {
            fetchTrips();
            fetchStats();
            setShowStartModal(false);
            setSelectedTrip(null);
          }}
        />
      )}

      {showEndModal && selectedTrip && (
        <EndTripModal
          trip={selectedTrip}
          onClose={() => {
            setShowEndModal(false);
            setSelectedTrip(null);
          }}
          onSuccess={() => {
            fetchTrips();
            fetchStats();
            setShowEndModal(false);
            setSelectedTrip(null);
          }}
        />
      )}
    </div>
  );
}