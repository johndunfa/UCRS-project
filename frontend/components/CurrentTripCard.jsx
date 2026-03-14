import { MapPin, Clock, Car, User, Play, Flag } from 'lucide-react';
import Link from 'next/link';

export default function CurrentTripCard({ trip, onUpdate }) {
  const getStatusColor = (status) => {
    return status === 'scheduled' 
      ? 'border-blue-500 bg-blue-50'
      : 'border-yellow-500 bg-yellow-50';
  };

  const getStatusIcon = (status) => {
    return status === 'scheduled' ? Play : Flag;
  };

  const StatusIcon = getStatusIcon(trip.status);

  return (
    <div className={`p-6 rounded-lg border-2 ${getStatusColor(trip.status)}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">Current Trip</h3>
          <p className="text-sm text-gray-600">Trip ID: {trip.tripId}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          trip.status === 'scheduled' 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {trip.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Destination</p>
            <p className="font-medium">{trip.request?.destination}</p>
          </div>
        </div>

        <div className="flex items-start">
          <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Start Time</p>
            <p className="font-medium">
              {new Date(trip.startTime).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <User className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Requester</p>
            <p className="font-medium">{trip.request?.requestedBy?.name}</p>
            <p className="text-xs text-gray-500">{trip.request?.requestedBy?.department}</p>
          </div>
        </div>

        <div className="flex items-start">
          <Car className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
          <div>
            <p className="text-sm text-gray-600">Vehicle</p>
            <p className="font-medium">
              {trip.vehicle?.make} {trip.vehicle?.model}
            </p>
            <p className="text-xs text-gray-500">{trip.vehicle?.registrationNumber}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {trip.status === 'scheduled' && (
          <Link
            href={`/dashboard/driver/assigned-trips?start=${trip._id}`}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Trip
          </Link>
        )}
        
        {trip.status === 'in-progress' && (
          <Link
            href={`/dashboard/driver/assigned-trips?end=${trip._id}`}
            className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
          >
            <Flag className="w-4 h-4 mr-2" />
            End Trip
          </Link>
        )}
      </div>
    </div>
  );
}