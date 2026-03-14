'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export default function DateRangePicker({ dateRange, setDateRange }) {
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'This Year', days: 365 }
  ];

  const handlePresetClick = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setDateRange({ startDate: start, endDate: end });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <Calendar className="w-5 h-5 text-gray-500 mr-2" />
        <span>
          {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4">
            <h3 className="font-medium mb-3">Preset Ranges</h3>
            <div className="space-y-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset.days)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-3">Custom Range</h3>
              <div className="space-y-3">
                <input
                  type="date"
                  value={dateRange.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="date"
                  value={dateRange.endDate.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: new Date(e.target.value) })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}