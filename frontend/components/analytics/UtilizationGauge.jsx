import { Car, CheckCircle, Users } from 'lucide-react';

export default function UtilizationGauge({ title, value, icon: Icon, color, unit = '%' }) {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          fill: 'stroke-blue-600'
        };
      case 'green':
        return {
          bg: 'bg-green-100',
          text: 'text-green-600',
          fill: 'stroke-green-600'
        };
      case 'purple':
        return {
          bg: 'bg-purple-100',
          text: 'text-purple-600',
          fill: 'stroke-purple-600'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-600',
          fill: 'stroke-gray-600'
        };
    }
  };

  const colors = getColorClasses();
  const percentage = Math.min(value, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center mb-4">
        <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.text}`} />
        </div>
        <h3 className="ml-3 font-medium text-gray-900">{title}</h3>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="8"
            />
            <circle
              cx="64"
              cy="64"
              r="45"
              fill="none"
              stroke={colors.fill.replace('stroke-', '')}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-2xl font-bold ${colors.text}`}>
              {value.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">{unit}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="flex justify-center space-x-4">
          <div className="text-sm">
            <span className="text-gray-500">Target: </span>
            <span className="font-medium">80%</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Current: </span>
            <span className="font-medium">{value.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}