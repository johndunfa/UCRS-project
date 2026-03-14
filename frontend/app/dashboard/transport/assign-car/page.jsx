'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Car,
  User,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Users,
  Phone,
  Mail,
  ChevronDown,
  Save,
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function AssignCarPage() {
  const [isClient, setIsClient] = useState(false);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [driversLoading, setDriversLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    date: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [vehicleStats, setVehicleStats] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Set client-side rendering flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    fetchApprovedRequests();
    fetchAllVehicles();
    fetchDrivers();
  }, [filters]);

  // Fetch all approved requests
  const fetchApprovedRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please login again.');
        return;
      }

      const queryParams = new URLSearchParams({
        ...filters,
        assigned: 'false'
      }).toString();

      console.log('Fetching approved requests...');
      
      const response = await fetch(`http://localhost:5000/api/transport/approved-requests?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        setError('Your session has expired. Please login again.');
        return;
      }

      const data = await response.json();
      console.log('Approved requests response:', data);

      if (data.success) {
        setApprovedRequests(data.requests || []);
      } else {
        setError(data.message || 'Failed to fetch requests');
      }
    } catch (error) {
      console.error('Error fetching approved requests:', error);
      setError('Network error. Please check if backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch ALL vehicles from admin fleet
  const fetchAllVehicles = async () => {
    setVehiclesLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Fetching all vehicles from admin fleet...');
      
      const response = await fetch('http://localhost:5000/api/admin/vehicles?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('All vehicles response:', data);

      if (data.success) {
        // Filter to show only available vehicles for assignment
        const availableVehicles = data.vehicles.filter(v => v.status === 'available');
        setVehicles(availableVehicles);
        setVehicleStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setVehiclesLoading(false);
    }
  };

  // Fetch available drivers
  const fetchDrivers = async () => {
    setDriversLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/transport/drivers/available', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Drivers response:', data);

      if (data.success) {
        setDrivers(data.drivers || []);
      }
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setDriversLoading(false);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    setLastRefreshed(new Date());
    fetchApprovedRequests();
    fetchAllVehicles();
    fetchDrivers();
  };

  // Handle assignment with proper error handling
  const handleAssign = async () => {
    if (!selectedVehicle || !selectedDriver) {
      setError('Please select both a vehicle and a driver');
      return;
    }

    setAssigning(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please login again.');
        setAssigning(false);
        return;
      }

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      console.log('Assigning with:', {
        requestId: selectedRequest._id,
        vehicleId: selectedVehicle._id,
        driverId: selectedDriver._id
      });

      const response = await fetch(`http://localhost:5000/api/transport/requests/${selectedRequest._id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vehicleId: selectedVehicle._id,
          driverId: selectedDriver._id,
          notes: `Assigned by ${user.name || 'Transport Officer'}`
        })
      });

      const data = await response.json();
      console.log('Assign response:', data);

      if (data.success) {
        setSuccess('Vehicle and driver assigned successfully!');
        
        // Create updated request object with all details
        const updatedRequest = {
          ...selectedRequest,
          assignedVehicle: {
            _id: selectedVehicle._id,
            registrationNumber: selectedVehicle.registrationNumber,
            make: selectedVehicle.make,
            model: selectedVehicle.model,
            color: selectedVehicle.color || ''
          },
          assignedDriver: {
            _id: selectedDriver._id,
            name: selectedDriver.name,
            phoneNumber: selectedDriver.phoneNumber,
            email: selectedDriver.email || ''
          },
          status: 'assigned'
        };
        
        // Update the request in the list
        setApprovedRequests(prevRequests => 
          prevRequests.map(req => 
            req._id === selectedRequest._id ? updatedRequest : req
          )
        );
        
        // Refresh vehicles and drivers
        await fetchAllVehicles();
        await fetchDrivers();
        
        // Close expanded section
        setExpandedRequest(null);
        setSelectedVehicle(null);
        setSelectedDriver(null);
        setSelectedRequest(null);
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } else {
        setError(data.message || 'Failed to assign resources');
      }
    } catch (error) {
      console.error('Error assigning:', error);
      setError('Network error. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get priority badge color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Toggle request expansion
  const toggleExpand = (request) => {
    if (expandedRequest === request._id) {
      setExpandedRequest(null);
      setSelectedVehicle(null);
      setSelectedDriver(null);
    } else {
      setExpandedRequest(request._id);
      setSelectedRequest(request);
      setSelectedVehicle(null);
      setSelectedDriver(null);
      setError('');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Assign Vehicle & Driver</h1>
          <p className="text-gray-600">Assign resources to approved staff requests</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Only show timestamp on client side to prevent hydration mismatch */}
          {isClient && (
            <div className="text-sm text-gray-500">
              Last refreshed: {lastRefreshed.toLocaleTimeString()}
            </div>
          )}
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Pending Assignments</p>
          <p className="text-2xl font-bold text-blue-600">{approvedRequests.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Available Vehicles</p>
          <p className="text-2xl font-bold text-green-600">{vehicles.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Available Drivers</p>
          <p className="text-2xl font-bold text-purple-600">{drivers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total Fleet</p>
          <p className="text-2xl font-bold text-orange-600">{vehicleStats?.total || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search requests..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filters.department}
            onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Administration">Administration</option>
            <option value="Faculty">Faculty</option>
            <option value="Student Affairs">Student Affairs</option>
          </select>

          <button 
            onClick={() => setFilters({ search: '', date: '', department: '' })}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : approvedRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Requests</h3>
          <p className="text-gray-500 mb-4">There are no approved requests waiting for assignment.</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {approvedRequests.map((request) => (
            <div key={request._id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Request Header */}
              <div 
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpand(request)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-mono text-gray-500 mr-3">
                        {request.requestId}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(request.priority)}`}>
                        {request.priority}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-2">{request.purpose}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {request.destination}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDate(request.startDate)}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-1 text-gray-400" />
                        {request.startTime} - {request.endTime}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-4 h-4 mr-1 text-gray-400" />
                        {request.numberOfPassengers} passengers
                      </div>
                    </div>
                  </div>
                  
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${
                    expandedRequest === request._id ? 'transform rotate-180' : ''
                  }`} />
                </div>

                {/* Requester Info */}
                <div className="mt-3 flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  {request.requestedBy?.name} • {request.requestedBy?.department}
                </div>
              </div>

              {/* Expanded Section - Assignment Interface */}
              {expandedRequest === request._id && (
                <div className="border-t bg-gray-50 p-6">
                  <h4 className="font-medium mb-4">Assign Resources</h4>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Vehicle Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Select Vehicle
                        </label>
                        {vehiclesLoading && <span className="text-xs text-gray-500">Loading...</span>}
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {vehiclesLoading ? (
                          <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : vehicles.length === 0 ? (
                          <div className="p-4 bg-yellow-50 rounded-lg text-center">
                            <p className="text-sm text-yellow-700 mb-2">No vehicles available</p>
                            <Link 
                              href="/dashboard/admin/fleet"
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Go to Fleet Management →
                            </Link>
                          </div>
                        ) : (
                          vehicles.map((vehicle) => (
                            <label
                              key={vehicle._id}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedVehicle?._id === vehicle._id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="radio"
                                name="vehicle"
                                checked={selectedVehicle?._id === vehicle._id}
                                onChange={() => setSelectedVehicle(vehicle)}
                                className="mr-3"
                              />
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <Car className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="font-medium">
                                    {vehicle.make} {vehicle.model}
                                  </span>
                                </div>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <span>{vehicle.registrationNumber}</span>
                                  <span className="mx-2">•</span>
                                  <span>{vehicle.seatingCapacity} seats</span>
                                  <span className="mx-2">•</span>
                                  <span className="capitalize">{vehicle.fuelType}</span>
                                </div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Driver Selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Select Driver
                        </label>
                        {driversLoading && <span className="text-xs text-gray-500">Loading...</span>}
                      </div>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {driversLoading ? (
                          <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : drivers.length === 0 ? (
                          <p className="text-sm text-gray-500 p-3 bg-gray-100 rounded text-center">
                            No drivers available
                          </p>
                        ) : (
                          drivers.map((driver) => (
                            <label
                              key={driver._id}
                              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedDriver?._id === driver._id
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="radio"
                                name="driver"
                                checked={selectedDriver?._id === driver._id}
                                onChange={() => setSelectedDriver(driver)}
                                className="mr-3"
                              />
                              <div className="flex-1">
                                <div className="flex items-center">
                                  <User className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="font-medium">{driver.name}</span>
                                </div>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  {driver.phoneNumber && (
                                    <>
                                      <Phone className="w-3 h-3 mr-1" />
                                      {driver.phoneNumber}
                                    </>
                                  )}
                                  {driver.email && (
                                    <>
                                      <span className="mx-2">•</span>
                                      <Mail className="w-3 h-3 mr-1" />
                                      {driver.email}
                                    </>
                                  )}
                                </div>
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t">
                    <button
                      onClick={() => {
                        setExpandedRequest(null);
                        setSelectedVehicle(null);
                        setSelectedDriver(null);
                        setSelectedRequest(null);
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAssign}
                      disabled={!selectedVehicle || !selectedDriver || assigning}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {assigning ? 'Assigning...' : 'Confirm Assignment'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}