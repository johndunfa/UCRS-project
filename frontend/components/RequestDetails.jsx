'use client';

import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Car, 
  User, 
  FileText, 
  AlertCircle,
  Phone,
  Mail,
  IdCard
} from 'lucide-react';

export default function RequestDetails({ request, onClose, onUpdate, showActions = true }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this request?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/requests/${request._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ cancellationReason: 'Cancelled by requester' })
      });

      const data = await response.json();
      if (data.success) {
        onUpdate();
        onClose();
      }
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-xl font-bold">Request Details</h2>
            <p className="text-sm text-gray-500">ID: {request.requestId}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Status Banner */}
        <div className={`px-6 py-3 ${getStatusColor(request.status)}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium">Status: {request.status.toUpperCase()}</span>
            {request.status === 'pending' && showActions && (
              <button
                onClick={handleCancel}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Cancel Request
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Trip Information */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Trip Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-sm text-gray-600">Purpose</p>
                <p className="font-medium">{request.purpose}</p>
              </div>
              
              <div className="col-span-2">
                <div className="flex items-start">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Destination</p>
                    <p className="font-medium">{request.destination}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Start Date</p>
                    <p className="font-medium">
                      {formatDate(request.startDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Start Time</p>
                    <p className="font-medium">{request.startTime}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">End Date</p>
                    <p className="font-medium">
                      {formatDate(request.endDate)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">End Time</p>
                    <p className="font-medium">{request.endTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vehicle Requirements */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Vehicle Requirements</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Vehicle Type</p>
                <p className="font-medium capitalize">{request.vehicleType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Passengers</p>
                <p className="font-medium">{request.numberOfPassengers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Priority</p>
                <p className="font-medium capitalize">{request.priority}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Trip Type</p>
                <p className="font-medium capitalize">{request.tripType}</p>
              </div>
            </div>
          </div>

          {/* Assigned Driver Details - NEW SECTION */}
          {request.assignedDriver && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-lg font-semibold mb-3 text-green-800 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Your Assigned Driver
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {request.assignedDriver.name?.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-lg text-gray-900">
                      {request.assignedDriver.name}
                    </p>
                    <p className="text-sm text-gray-600">Driver</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 mt-3">
                  {request.assignedDriver.phoneNumber && (
                    <div className="flex items-center p-2 bg-white rounded-lg">
                      <Phone className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <a 
                          href={`tel:${request.assignedDriver.phoneNumber}`}
                          className="text-sm font-medium text-gray-900 hover:text-green-600"
                        >
                          {request.assignedDriver.phoneNumber}
                        </a>
                      </div>
                    </div>
                  )}

                  {request.assignedDriver.email && (
                    <div className="flex items-center p-2 bg-white rounded-lg">
                      <Mail className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <a 
                          href={`mailto:${request.assignedDriver.email}`}
                          className="text-sm font-medium text-gray-900 hover:text-green-600"
                        >
                          {request.assignedDriver.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {request.assignedDriver.licenseNumber && (
                    <div className="flex items-center p-2 bg-white rounded-lg">
                      <IdCard className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500">License Number</p>
                        <p className="text-sm font-medium text-gray-900">
                          {request.assignedDriver.licenseNumber}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Assigned Vehicle Info */}
                {request.assignedVehicle && (
                  <div className="mt-3 p-3 bg-white rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">Assigned Vehicle</p>
                    <div className="flex items-center">
                      <Car className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        {request.assignedVehicle.make} {request.assignedVehicle.model} - {request.assignedVehicle.registrationNumber}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Special Requirements */}
          {request.specialRequirements && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Special Requirements</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {request.specialRequirements}
              </p>
            </div>
          )}

          {/* Notes */}
          {request.notes && request.notes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Notes</h3>
              <div className="space-y-2">
                {request.notes.map((note, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">{note.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Added by {note.createdBy?.name || 'System'} on {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Approval/Rejection Info */}
          {request.status === 'rejected' && request.rejectionReason && (
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                <div>
                  <p className="font-medium text-red-800">Rejection Reason</p>
                  <p className="text-sm text-red-700">{request.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}

          {request.status === 'approved' && request.approvedBy && (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-700">
                Approved by {request.approvedBy.name} on {new Date(request.approvedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
            {request.status === 'pending' && showActions && (
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Cancel Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}