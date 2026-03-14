import Link from 'next/link';
import { Clock, MapPin, Calendar, User, AlertCircle, ChevronRight } from 'lucide-react';

export default function PendingRequestsList({ requests }) {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (requests.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No pending requests
      </div>
    );
  }

  return (
    <div className="divide-y">
      {requests.map((request) => (
        <div key={request._id} className="p-4 hover:bg-gray-50">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(request.priority)}`}>
                  {request.priority}
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  {request.requestId}
                </span>
              </div>
              
              <h3 className="font-medium text-gray-900 mb-2">{request.purpose}</h3>
              
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                  {request.destination}
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1 text-gray-400" />
                  {request.requestedBy?.name}
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  {new Date(request.startDate).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-gray-400" />
                  {request.startTime}
                </div>
              </div>
            </div>

            <Link
              href={`/dashboard/transport/pending-requests?view=${request._id}`}
              className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {request.priority === 'urgent' && (
            <div className="mt-2 flex items-center text-xs text-red-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              Urgent - Needs immediate attention
            </div>
          )}
        </div>
      ))}
    </div>
  );
}