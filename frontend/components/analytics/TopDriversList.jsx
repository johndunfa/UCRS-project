import { Medal, Award, Trophy } from 'lucide-react';

export default function TopDriversList({ drivers }) {
  if (!drivers || drivers.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;
  }

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Award className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-orange-500" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-gray-500">
          {index + 1}
        </span>;
    }
  };

  return (
    <div className="space-y-4">
      {drivers.map((driver, index) => (
        <div key={driver._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <div className="w-8 h-8 flex items-center justify-center">
              {getRankIcon(index)}
            </div>
            <div className="ml-3">
              <p className="font-medium">{driver.driverName}</p>
              <p className="text-xs text-gray-500">{driver.employeeId || 'No ID'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold text-blue-600">{driver.tripCount}</p>
            <p className="text-xs text-gray-500">trips</p>
          </div>
          <div className="text-right">
            <p className="font-medium">{driver.totalDistance?.toFixed(0)} km</p>
            <p className="text-xs text-gray-500">distance</p>
          </div>
        </div>
      ))}
    </div>
  );
}