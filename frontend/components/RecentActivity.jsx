import { useState, useEffect } from 'react';
import { UserPlus, Car, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function RecentActivity() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    // Fetch recent activities
    const mockActivities = [
      {
        id: 1,
        type: 'user_created',
        user: 'John Doe',
        action: 'created a new user',
        target: 'Jane Smith',
        time: '5 minutes ago',
        icon: UserPlus,
        color: 'text-green-500'
      },
      {
        id: 2,
        type: 'vehicle_added',
        user: 'Admin',
        action: 'added new vehicle',
        target: 'Toyota Camry',
        time: '1 hour ago',
        icon: Car,
        color: 'text-blue-500'
      },
      {
        id: 3,
        type: 'request_approved',
        user: 'Transport Officer',
        action: 'approved a request',
        target: '#REQ-1234',
        time: '2 hours ago',
        icon: CheckCircle,
        color: 'text-green-500'
      },
      {
        id: 4,
        type: 'request_rejected',
        user: 'Transport Officer',
        action: 'rejected a request',
        target: '#REQ-5678',
        time: '3 hours ago',
        icon: XCircle,
        color: 'text-red-500'
      },
      {
        id: 5,
        type: 'maintenance_due',
        user: 'System',
        action: 'maintenance due for',
        target: 'Honda Civic',
        time: '5 hours ago',
        icon: Clock,
        color: 'text-yellow-500'
      }
    ];

    setActivities(mockActivities);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">Recent Activity</h2>
      </div>
      <div className="divide-y">
        {activities.map((activity) => {
          const Icon = activity.icon;
          return (
            <div key={activity.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center">
                <div className={`w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3`}>
                  <Icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>{' '}
                    {activity.action}{' '}
                    <span className="font-medium">{activity.target}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-4 border-t">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All Activity
        </button>
      </div>
    </div>
  );
}