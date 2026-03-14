'use client';

import { useState } from 'react';
import { X, Flag, AlertCircle } from 'lucide-react';

export default function EndTripModal({ trip, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    endOdometer: '',
    fuelLevel: '',
    notes: '',
    issues: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.endOdometer) {
      setError('End odometer reading is required');
      return;
    }

    if (parseFloat(formData.endOdometer) <= trip.startOdometer) {
      setError('End odometer must be greater than start odometer');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/driver/trips/${trip._id}/end`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Failed to end trip');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const distance = formData.endOdometer && trip.startOdometer
    ? (parseFloat(formData.endOdometer) - trip.startOdometer).toFixed(1)
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Flag className="w-6 h-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-bold">End Trip</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Trip Info */}
        <div className="p-6 bg-gray-50 border-b">
          <p className="text-sm text-gray-600 mb-1">Trip ID: {trip.tripId}</p>
          <p className="font-medium">{trip.request?.destination}</p>
          <div className="flex justify-between text-sm mt-2">
            <span>Start: {trip.startOdometer} km</span>
            {distance > 0 && (
              <span className="text-green-600 font-medium">
                Distance: {distance} km
              </span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-6 p-3 bg-red-50 rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Odometer (km) *
            </label>
            <input
              type="number"
              value={formData.endOdometer}
              onChange={(e) => setFormData({ ...formData, endOdometer: e.target.value })}
              required
              min={trip.startOdometer + 0.1}
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter current odometer reading"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Level (%)
            </label>
            <input
              type="number"
              value={formData.fuelLevel}
              onChange={(e) => setFormData({ ...formData, fuelLevel: e.target.value })}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter fuel level (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trip Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Any notes about the trip..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issues / Incidents
            </label>
            <textarea
              value={formData.issues}
              onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              placeholder="Report any issues or incidents..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Ending...' : 'End Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}