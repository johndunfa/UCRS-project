'use client';

import { Search, Calendar, X } from 'lucide-react';

export default function ReportFilters({ filters, setFilters, type }) {
  const clearFilters = () => {
    if (type === 'reports') {
      setFilters({
        type: '',
        startDate: '',
        endDate: '',
        search: ''
      });
    } else {
      setFilters({
        action: '',
        user: '',
        startDate: '',
        endDate: '',
        search: ''
      });
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-wrap gap-4">
        {type === 'reports' ? (
          <>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="activity_log">Activity Logs</option>
              <option value="request_summary">Request Summary</option>
              <option value="trip_summary">Trip Summary</option>
              <option value="vehicle_utilization">Vehicle Utilization</option>
              <option value="driver_performance">Driver Performance</option>
              <option value="maintenance_report">Maintenance</option>
            </select>
          </>
        ) : (
          <>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Actions</option>
              <option value="USER_LOGIN">User Login</option>
              <option value="REQUEST_APPROVED">Request Approved</option>
              <option value="REQUEST_REJECTED">Request Rejected</option>
              <option value="TRIP_STARTED">Trip Started</option>
              <option value="TRIP_COMPLETED">Trip Completed</option>
            </select>
          </>
        )}

        {/* Date filters */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <span className="text-gray-500">to</span>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clear filters */}
        {(filters.search || filters.startDate || filters.endDate || 
          (type === 'reports' ? filters.type : filters.action)) && (
          <button
            onClick={clearFilters}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4 mr-1" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}