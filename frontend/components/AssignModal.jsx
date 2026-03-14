'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Car,
  User,
  Search,
  Calendar,
  MapPin,
  Users,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function AssignModal({ request, onClose, onAssigned }) {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [notes, setNotes] = useState('');
  const [searchVehicle, setSearchVehicle] = useState('');
  const [searchDriver, setSearchDriver] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');

  useEffect(() => {
    fetchResources();
  }, [request]);

  const fetchResources = async () => {
    try {
      // Fetch available vehicles
      const vehicleResponse = await fetch(
        `/api/transport/vehicles/available?date=${request.startDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const vehicleData = await vehicleResponse.json();
      if (vehicleData.success) {
        setVehicles(vehicleData.vehicles);
      }

      // Fetch available drivers
      const driverResponse = await fetch(
        `/api/transport/drivers/available?date=${request.startDate}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      const driverData = await driverResponse.json();
      if (driverData.success) {
        setDrivers(driverData.drivers);
      }
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to load available resources');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedVehicle || !selectedDriver) {
      setError('Please select both a vehicle and a driver');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/transport/requests/${request._id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          vehicleId: selectedVehicle._id,
          driverId: selectedDriver._id,
          notes
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Assignment successful!');
        setTimeout(() => {
          onAssigned();
        }, 1500);
      } else {
        setError(data.message || 'Failed to assign resources');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = 
      vehicle.registrationNumber.toLowerCase().includes(searchVehicle.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchVehicle.toLowerCase()) ||
      vehicle.make.toLowerCase().includes(searchVehicle.toLowerCase());
    
    if (vehicleFilter === 'all') return matchesSearch;
    if (vehicleFilter === 'sedan') return matchesSearch && vehicle.seatingCapacity <= 4;
    if (vehicleFilter === 'suv') return matchesSearch && vehicle.seatingCapacity > 4 && vehicle.seatingCapacity <= 7;
    if (vehicleFilter === 'van') return matchesSearch && vehicle.seatingCapacity > 7 && vehicle.seatingCapacity <= 15;
    if (vehicleFilter === 'bus') return matchesSearch && vehicle.seatingCapacity > 15;
    
    return matchesSearch;
  });

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchDriver.toLowerCase()) ||
    driver.employeeId?.toLowerCase().includes(searchDriver.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold">Assign Vehicle & Driver</h2>
            <p className="text-sm text-gray-500">Request ID: {request.requestId}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Request Summary */}
        <div className="p-6 bg-blue-50 border-b">
          <h3 className="font-medium text-blue-900 mb-3">Request Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-blue-700">Destination</p>
              <p className="text-sm font-medium text-blue-900">{request.destination}</p>
            </div>
            <div>
              <p className="text-xs text-blue-700">Date</p>
              <p className="text-sm font-medium text-blue-900">
                {new Date(request.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-700">Time</p>
              <p className="text-sm font-medium text-blue-900">
                {request.startTime} - {request.endTime}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-700">Passengers</p>
              <p className="text-sm font-medium text-blue-900">{request.numberOfPassengers}</p>
            </div>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-6 p-4 bg-green-50 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Main Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vehicle Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Car className="w-5 h-5 mr-2 text-blue-600" />
                    Select Vehicle
                  </h3>
                  {selectedVehicle && (
                    <span className="text-sm text-green-600">✓ Selected</span>
                  )}
                </div>

                {/* Vehicle Filters */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search vehicles..."
                      value={searchVehicle}
                      onChange={(e) => setSearchVehicle(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex space-x-2">
                    {['all', 'sedan', 'suv', 'van', 'bus'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setVehicleFilter(type)}
                        className={`px-3 py-1 text-xs rounded-full capitalize ${
                          vehicleFilter === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vehicle List */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {filteredVehicles.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No vehicles available</p>
                  ) : (
                    filteredVehicles.map((vehicle) => (
                      <div
                        key={vehicle._id}
                        onClick={() => setSelectedVehicle(vehicle)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedVehicle?._id === vehicle._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              {vehicle.make} {vehicle.model}
                            </p>
                            <p className="text-sm text-gray-600">
                              {vehicle.registrationNumber}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {vehicle.seatingCapacity} seats
                          </span>
                        </div>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <span className="capitalize">{vehicle.fuelType}</span>
                          <span className="mx-2">•</span>
                          <span>{vehicle.year}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Driver Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Select Driver
                  </h3>
                  {selectedDriver && (
                    <span className="text-sm text-green-600">✓ Selected</span>
                  )}
                </div>

                {/* Driver Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search drivers..."
                    value={searchDriver}
                    onChange={(e) => setSearchDriver(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Driver List */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                  {filteredDrivers.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No drivers available</p>
                  ) : (
                    filteredDrivers.map((driver) => (
                      <div
                        key={driver._id}
                        onClick={() => setSelectedDriver(driver)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedDriver?._id === driver._id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium">{driver.name}</p>
                            <p className="text-sm text-gray-600">
                              {driver.employeeId || 'No ID'}
                            </p>
                            {driver.phoneNumber && (
                              <p className="text-xs text-gray-500 mt-1">
                                {driver.phoneNumber}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assignment Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any special instructions for the driver..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {selectedVehicle && selectedDriver ? (
                <span className="text-green-600">✓ Ready to assign</span>
              ) : (
                <span className="text-yellow-600">Please select both vehicle and driver</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={!selectedVehicle || !selectedDriver || submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Assigning...' : 'Confirm Assignment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}