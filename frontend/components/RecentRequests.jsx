import Link from 'next/link';
import { Clock, MapPin, Calendar, ChevronRight } from 'lucide-react';

export default function RecentRequests({ requests }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent Requests</h2>
        <Link
          href="/dashboard/staff/my-requests"
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          View All
          <ChevronRight className="w-4 h-4 ml-1" />
        </Link>
      </div>

      <div className="divide-y">
        {requests.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No requests yet. Create your first request!
          </div>
        ) : (
          requests.map((request) => (
            <div key={request._id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium text-gray-900">{request.purpose}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                  {request.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {request.destination}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(request.startDate).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {request.startTime}
                </div>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500">
                    ID: {request.requestId}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}