'use client';

import { X, MapPin, Calendar, Clock, User, Car, Phone, Mail } from 'lucide-react';

export default function TripDetailsModal({ trip, onClose }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold">Trip Details</h2>
            <p className="text-sm text-gray-500">ID: {trip.tripId}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="px-6 py-3 bg-blue-50 border-b">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            trip.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
            trip.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
            trip.status === 'completed' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {trip.status}
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Trip Information */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Trip Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Destination</p>
                <p className="font-medium flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  {trip.request?.destination}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Start Time</p>
                <p className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  {formatDate(trip.startTime)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {formatTime(trip.startTime)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">End Time</p>
                <p className="font-medium flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  {formatDate(trip.estimatedEndTime)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {formatTime(trip.estimatedEndTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Requester Information */}
          {trip.request?.requestedBy && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Requester Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{trip.request.requestedBy.name}</p>
                    <p className="text-sm text-gray-600">{trip.request.requestedBy.department}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {trip.request.requestedBy.phoneNumber && (
                    <p className="text-sm flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {trip.request.requestedBy.phoneNumber}
                    </p>
                  )}
                  {trip.request.requestedBy.email && (
                    <p className="text-sm flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {trip.request.requestedBy.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Vehicle Information */}
          {trip.vehicle && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Vehicle Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Car className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">{trip.vehicle.make} {trip.vehicle.model}</p>
                    <p className="text-sm text-gray-600">{trip.vehicle.registrationNumber}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Odometer Readings */}
          {(trip.startOdometer || trip.endOdometer) && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Trip Readings</h3>
              <div className="grid grid-cols-2 gap-4">
                {trip.startOdometer && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Start Odometer</p>
                    <p className="text-xl font-bold">{trip.startOdometer} km</p>
                  </div>
                )}
                {trip.endOdometer && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">End Odometer</p>
                    <p className="text-xl font-bold">{trip.endOdometer} km</p>
                  </div>
                )}
                {trip.distance && (
                  <div className="bg-gray-50 p-3 rounded-lg col-span-2">
                    <p className="text-sm text-gray-600">Total Distance</p>
                    <p className="text-xl font-bold text-blue-600">{trip.distance} km</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Purpose */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Purpose</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
              {trip.request?.purpose}
            </p>
          </div>

          {/* Notes */}
          {trip.notes && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Notes</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {trip.notes}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}