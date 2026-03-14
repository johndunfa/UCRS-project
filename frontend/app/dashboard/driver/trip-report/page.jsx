'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Camera,
  X,
  Upload,
  Truck
} from 'lucide-react';

export default function TripReport() {
  const router = useRouter();
  const [completedTrips, setCompletedTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [formData, setFormData] = useState({
    tripId: '',
    notes: '',
    issues: '',
    attachments: []
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCompletedTrips();
  }, []);

  const fetchCompletedTrips = async () => {
    try {
      const response = await fetch('/api/driver/trips?status=completed', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCompletedTrips(data.trips);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setFormData({
      ...formData,
      tripId: trip._id
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrip) {
      setError('Please select a trip');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/driver/trips/${selectedTrip._id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (data.success) {
        setSuccess('Report submitted successfully!');
        setTimeout(() => {
          router.push('/dashboard/driver/assigned-trips');
        }, 2000);
      } else {
        setError(data.message || 'Failed to submit report');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Submit Trip Report</h1>
        <p className="text-gray-600">Add notes and report any issues for completed trips</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <p className="text-green-700">{success}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Trip Selection */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Select Trip</h2>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : completedTrips.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No completed trips found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {completedTrips.map((trip) => (
                  <div
                    key={trip._id}
                    onClick={() => handleTripSelect(trip)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedTrip?._id === trip._id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-green-300'
                    }`}
                  >
                    <p className="font-medium text-sm">{trip.tripId}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {trip.request?.destination}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(trip.startTime).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Report Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Report Details</h2>

            {!selectedTrip ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p>Please select a trip from the list</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Trip Summary */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Trip Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Destination:</p>
                      <p className="font-medium">{selectedTrip.request?.destination}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Distance:</p>
                      <p className="font-medium">{selectedTrip.distance || 0} km</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Start:</p>
                      <p className="font-medium">
                        {new Date(selectedTrip.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">End:</p>
                      <p className="font-medium">
                        {selectedTrip.actualEndTime 
                          ? new Date(selectedTrip.actualEndTime).toLocaleString()
                          : 'Not completed'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trip Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Any observations or notes about the trip..."
                  />
                </div>

                {/* Issues */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issues / Incidents
                  </label>
                  <textarea
                    value={formData.issues}
                    onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Report any issues, incidents, or vehicle problems..."
                  />
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachments (Photos/Documents)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      Drag and drop files here, or click to upload
                    </p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Upload className="w-4 h-4 inline mr-2" />
                      Browse Files
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}