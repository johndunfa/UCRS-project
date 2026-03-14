'use client';

import { useState } from 'react';
import { X, Play, AlertCircle } from 'lucide-react';

export default function StartTripModal({ trip, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    startOdometer: '',
    fuelLevel: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.startOdometer) {
      setError('Start odometer reading is required');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5000/api/driver/trips/${trip._id}/start`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        onSuccess();
      } else {
        setError(data.message || 'Failed to start trip');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            <Play className="w-6 h-6 text-green-500 mr-2" />
            <h2 className="text-xl font-bold">Start Trip</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 bg-gray-50 border-b">
          <p className="text-sm text-gray-600 mb-1">Trip ID: {trip.tripId}</p>
          <p className="font-medium">{trip.request?.destination}</p>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(trip.startTime).toLocaleString()}
          </p>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-3 bg-red-50 rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Odometer (km) *
            </label>
            <input
              type="number"
              value={formData.startOdometer}
              onChange={(e) => setFormData({ ...formData, startOdometer: e.target.value })}
              required
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter fuel level (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Any notes before starting the trip..."
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
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {submitting ? 'Starting...' : 'Start Trip'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}