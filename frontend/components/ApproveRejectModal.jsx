'use client';

import { useState } from 'react';
import { X, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function ApproveRejectModal({ request, actionType, onClose, onConfirm }) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onConfirm(request._id, notes);
    setSubmitting(false);
  };

  const isApprove = actionType === 'approve';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            {isApprove ? (
              <CheckCircle className="w-6 h-6 text-green-500 mr-2" />
            ) : (
              <XCircle className="w-6 h-6 text-red-500 mr-2" />
            )}
            <h2 className="text-xl font-bold">
              {isApprove ? 'Approve Request' : 'Reject Request'}
            </h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Request Info */}
        <div className="p-6 bg-gray-50 border-b">
          <p className="text-sm text-gray-600 mb-2">Request ID: {request.requestId}</p>
          <p className="font-medium mb-1">{request.purpose}</p>
          <p className="text-sm text-gray-600">
            {request.destination} • {new Date(request.startDate).toLocaleDateString()}
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isApprove ? 'Approval Notes (Optional)' : 'Rejection Reason *'}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={isApprove 
              ? 'Add any notes about this approval...' 
              : 'Please provide a reason for rejection...'
            }
            required={!isApprove}
          />

          {!isApprove && !notes && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              Rejection reason is required
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || (!isApprove && !notes)}
              className={`px-6 py-2 text-white rounded-lg ${
                isApprove
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {submitting ? 'Processing...' : isApprove ? 'Approve Request' : 'Reject Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}