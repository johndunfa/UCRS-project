'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Car,
  Filter,
  Download,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import VehicleModal from '@/components/VehicleModal';
import DeleteConfirmation from '@/components/DeleteConfirmation';

export default function FleetManagement() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    fuelType: '',
    search: ''
  });
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicles();
    fetchVehicleStats();
  }, [filters]);

  const fetchVehicles = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You are not logged in. Please login again.');
        return;
      }

      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`http://localhost:5000/api/admin/vehicles?${queryParams}`, {
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
      console.log('Vehicles response:', data);
      
      if (data.success) {
        setVehicles(data.vehicles || []);
      } else {
        setError(data.message || 'Failed to fetch vehicles');
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setError('Network error. Please check if backend server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicleStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/vehicles/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Stats response:', data);
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateVehicle = async (vehicleData) => {
    try {
      console.log('Creating vehicle with data:', vehicleData);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not logged in. Please login again.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/admin/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vehicleData)
      });

      const data = await response.json();
      console.log('Create vehicle response:', data);

      if (data.success) {
        await fetchVehicles();
        await fetchVehicleStats();
        setShowModal(false);
        alert('Vehicle added successfully!');
      } else {
        alert(data.message || 'Failed to add vehicle');
      }
    } catch (error) {
      console.error('Error creating vehicle:', error);
      alert('Network error. Please check if backend server is running on port 5000.');
    }
  };

  const handleUpdateVehicle = async (vehicleData) => {
    try {
      console.log('Updating vehicle with data:', vehicleData);
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You are not logged in. Please login again.');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/vehicles/${selectedVehicle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vehicleData)
      });

      const data = await response.json();
      console.log('Update vehicle response:', data);

      if (data.success) {
        await fetchVehicles();
        setShowModal(false);
        setSelectedVehicle(null);
        alert('Vehicle updated successfully!');
      } else {
        alert(data.message || 'Failed to update vehicle');
      }
    } catch (error) {
      console.error('Error updating vehicle:', error);
      alert('Network error. Please check if backend server is running.');
    }
  };

  const handleDeleteVehicle = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/vehicles/${selectedVehicle._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Delete vehicle response:', data);

      if (data.success) {
        await fetchVehicles();
        await fetchVehicleStats();
        setShowDeleteModal(false);
        setSelectedVehicle(null);
        alert('Vehicle deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete vehicle');
      }
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      alert('Network error. Please check if backend server is running.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'out-of-service':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 rounded-lg p-8 max-w-md mx-auto">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Fleet Management</h1>
        <button
          onClick={() => {
            setSelectedVehicle(null);
            setShowModal(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Vehicle
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Vehicles</p>
            <p className="text-2xl font-bold">{stats.total || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Available</p>
            <p className="text-2xl font-bold text-green-600">{stats.available || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Assigned</p>
            <p className="text-2xl font-bold text-blue-600">{stats.assigned || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Maintenance</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.maintenance || 0}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Due for Service</p>
            <p className="text-2xl font-bold text-orange-600">{stats.dueForService || 0}</p>
          </div>
        </div>
      )}

      {/* Alerts */}
      {stats?.insuranceExpiring > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <p className="ml-3 text-sm text-yellow-700">
              {stats.insuranceExpiring} vehicles have insurance expiring within 30 days
            </p>
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
                placeholder="Search vehicles..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="available">Available</option>
            <option value="assigned">Assigned</option>
            <option value="maintenance">Maintenance</option>
            <option value="out-of-service">Out of Service</option>
          </select>

          <select
            value={filters.fuelType}
            onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Fuel Types</option>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="electric">Electric</option>
            <option value="hybrid">Hybrid</option>
          </select>

          <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5 mr-2" />
            More Filters
          </button>

          <button className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Download className="w-5 h-5 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Vehicles Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Vehicles Found</h3>
            <p className="text-gray-500 mb-4">Get started by adding your first vehicle.</p>
            <button
              onClick={() => {
                setSelectedVehicle(null);
                setShowModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Vehicle
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Car className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold">{vehicle.model}</h3>
                      <p className="text-sm text-gray-500">{vehicle.make} {vehicle.year}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(vehicle.status)}`}>
                    {vehicle.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm">
                    <span className="text-gray-500">Reg No:</span>{' '}
                    <span className="font-medium">{vehicle.registrationNumber}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Fuel Type:</span>{' '}
                    <span className="font-medium capitalize">{vehicle.fuelType}</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Seating:</span>{' '}
                    <span className="font-medium">{vehicle.seatingCapacity} seats</span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Mileage:</span>{' '}
                    <span className="font-medium">{vehicle.mileage?.toLocaleString()} km</span>
                  </p>
                </div>

                {/* Maintenance Alert */}
                {vehicle.maintenance?.nextService && 
                 new Date(vehicle.maintenance.nextService) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                  <div className="mb-4 p-2 bg-yellow-50 rounded-lg flex items-center">
                    <Wrench className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-xs text-yellow-700">
                      Service due: {new Date(vehicle.maintenance.nextService).toLocaleDateString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setShowModal(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit Vehicle"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVehicle(vehicle);
                      setShowDeleteModal(true);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    title="Delete Vehicle"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle Modal */}
      {showModal && (
        <VehicleModal
          vehicle={selectedVehicle}
          onClose={() => {
            setShowModal(false);
            setSelectedVehicle(null);
          }}
          onSave={selectedVehicle ? handleUpdateVehicle : handleCreateVehicle}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <DeleteConfirmation
          title="Delete Vehicle"
          message={`Are you sure you want to delete ${selectedVehicle?.model} (${selectedVehicle?.registrationNumber})? This action cannot be undone.`}
          onConfirm={handleDeleteVehicle}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedVehicle(null);
          }}
        />
      )}
    </div>
  );
}