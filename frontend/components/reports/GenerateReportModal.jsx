'use client';

import { useState } from 'react';
import { X, FileText, Calendar, Download, CheckCircle, AlertCircle } from 'lucide-react';

export default function GenerateReportModal({ onClose, onGenerated }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: 'activity_log',
    format: 'json',
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    filters: {}
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const reportTypes = [
    { id: 'activity_log', label: 'Activity Log', description: 'System activity and user actions' },
    { id: 'request_summary', label: 'Request Summary', description: 'Summary of all requests' },
    { id: 'trip_summary', label: 'Trip Summary', description: 'Trip statistics and details' },
    { id: 'vehicle_utilization', label: 'Vehicle Utilization', description: 'Vehicle usage and availability' },
    { id: 'driver_performance', label: 'Driver Performance', description: 'Driver metrics and performance' },
    { id: 'maintenance_report', label: 'Maintenance Report', description: 'Maintenance records and costs' }
  ];

  const formats = [
    { id: 'json', label: 'JSON', icon: '📄' },
    { id: 'excel', label: 'Excel', icon: '📊' },
    { id: 'pdf', label: 'PDF', icon: '📑' }
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onGenerated();
    } catch (error) {
      setError('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Generate Report</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step 1: Report Type */}
        {step === 1 && (
          <div className="p-6">
            <h3 className="font-medium mb-4">Select Report Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormData({ ...formData, type: type.id })}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    formData.type === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <FileText className={`w-6 h-6 mb-2 ${
                    formData.type === type.id ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <h4 className="font-medium">{type.label}</h4>
                  <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date Range & Format */}
        {step === 2 && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="font-medium mb-4">Date Range</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Output Format</h3>
              <div className="flex space-x-4">
                {formats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setFormData({ ...formData, format: format.id })}
                    className={`flex-1 p-3 border rounded-lg text-center ${
                      formData.format === format.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-2xl mb-1 block">{format.icon}</span>
                    <span className="text-sm font-medium">{format.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-4 p-3 bg-red-50 rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Previous
            </button>
          ) : (
            <div></div>
          )}
          
          {step < 2 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}