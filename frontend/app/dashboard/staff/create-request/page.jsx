'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Car,
  AlertCircle,
  ChevronRight,
  Plus,
  X
} from 'lucide-react';

export default function CreateRequest() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showStops, setShowStops] = useState(false);
  
  const [formData, setFormData] = useState({
    purpose: '',
    destination: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    numberOfPassengers: 1,
    vehicleType: 'any',
    priority: 'medium',
    tripType: 'one-way',
    stops: [],
    estimatedDistance: '',
    specialRequirements: '',
    department: '',
    projectCode: ''
  });

  const [newStop, setNewStop] = useState({
    location: '',
    purpose: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStop = () => {
    if (newStop.location && newStop.purpose) {
      setFormData(prev => ({
        ...prev,
        stops: [...prev.stops, { ...newStop, id: Date.now() }]
      }));
      setNewStop({ location: '', purpose: '' });
    }
  };

  const handleRemoveStop = (id) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.filter(stop => stop.id !== id)
    }));
  };

  const validateForm = () => {
    if (!formData.purpose) return 'Purpose is required';
    if (!formData.destination) return 'Destination is required';
    if (!formData.startDate) return 'Start date is required';
    if (!formData.endDate) return 'End date is required';
    if (!formData.startTime) return 'Start time is required';
    if (!formData.endTime) return 'End time is required';
    
    const start = new Date(`${formData.startDate}T${formData.startTime}`);
    const end = new Date(`${formData.endDate}T${formData.endTime}`);
    
    if (end <= start) {
      return 'End date/time must be after start date/time';
    }
    
    return '';
  };

  // In your handleSubmit function, replace with:
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  const validationError = validateForm();
  if (validationError) {
    setError(validationError);
    return;
  }

  setLoading(true);

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You are not logged in. Please login again.');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    console.log('Submitting request with data:', formData);
    
    const response = await fetch('http://localhost:5000/api/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    console.log('Response:', data);

    if (data.success) {
      setSuccess('Request submitted successfully!');
      setTimeout(() => {
        router.push('/dashboard/staff/my-requests');
      }, 2000);
    } else {
      setError(data.message || 'Failed to submit request');
    }
  } catch (error) {
    console.error('Error submitting request:', error);
    setError('Network error. Please check if backend server is running on port 5000.');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Create New Request</h1>
        <p className="text-gray-600">Fill in the details to request a vehicle for your trip.</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {['Trip Details', 'Schedule', 'Additional Info', 'Review'].map((step, index) => (
          <div key={step} className="flex items-center">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index + 1}
              </div>
              <span className="ml-2 text-sm font-medium hidden md:block">{step}</span>
            </div>
            {index < 3 && <ChevronRight className="w-5 h-5 text-gray-400 mx-2" />}
          </div>
        ))}
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Trip Purpose Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <MapPin className="w-5 h-5 text-blue-600 mr-2" />
            Trip Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose of Trip *
              </label>
              <textarea
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Official meeting, conference, field visit..."
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination *
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter destination"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your department"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Code
              </label>
              <input
                type="text"
                name="projectCode"
                value={formData.projectCode}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            Schedule
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time *
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Vehicle & Passengers Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Car className="w-5 h-5 text-blue-600 mr-2" />
            Vehicle & Passengers
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Number of Passengers *
              </label>
              <input
                type="number"
                name="numberOfPassengers"
                value={formData.numberOfPassengers}
                onChange={handleChange}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="any">Any</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="van">Van</option>
                <option value="bus">Bus</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trip Type
              </label>
              <select
                name="tripType"
                value={formData.tripType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="one-way">One Way</option>
                <option value="round-trip">Round Trip</option>
                <option value="multi-stop">Multi-stop</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Distance (km)
              </label>
              <input
                type="number"
                name="estimatedDistance"
                value={formData.estimatedDistance}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>
          </div>
        </div>

        {/* Multi-stop Section */}
        {formData.tripType === 'multi-stop' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Trip Stops</h2>
              <button
                type="button"
                onClick={() => setShowStops(!showStops)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showStops ? 'Hide' : 'Add Stop'}
              </button>
            </div>

            {showStops && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <input
                    type="text"
                    placeholder="Location"
                    value={newStop.location}
                    onChange={(e) => setNewStop({ ...newStop, location: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Purpose"
                    value={newStop.purpose}
                    onChange={(e) => setNewStop({ ...newStop, purpose: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddStop}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Stop
                </button>
              </div>
            )}

            {formData.stops.length > 0 && (
              <div className="space-y-2">
                {formData.stops.map((stop, index) => (
                  <div key={stop.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="text-sm font-medium">Stop {index + 1}:</span>
                      <span className="text-sm ml-2">{stop.location}</span>
                      <span className="text-xs text-gray-500 ml-2">({stop.purpose})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(stop.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Special Requirements */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Special Requirements</h2>
          <textarea
            name="specialRequirements"
            value={formData.specialRequirements}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Any special requirements or notes for the transport team..."
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}