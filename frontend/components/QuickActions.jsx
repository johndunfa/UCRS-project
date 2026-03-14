import Link from 'next/link';
import { CalendarPlus, History, Car, HelpCircle } from 'lucide-react';

const actions = [
  {
    name: 'New Request',
    href: '/dashboard/staff/create-request',
    icon: CalendarPlus,
    color: 'bg-blue-500',
    description: 'Create a new vehicle request'
  },
  {
    name: 'View History',
    href: '/dashboard/staff/my-requests',
    icon: History,
    color: 'bg-green-500',
    description: 'Check your request history'
  },
  {
    name: 'Available Vehicles',
    href: '/dashboard/staff/vehicles',
    icon: Car,
    color: 'bg-purple-500',
    description: 'View available fleet'
  },
  {
    name: 'Help & Support',
    href: '/dashboard/staff/support',
    icon: HelpCircle,
    color: 'bg-orange-500',
    description: 'Get assistance'
  }
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.name}
            href={action.href}
            className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{action.name}</h3>
            <p className="text-sm text-gray-600">{action.description}</p>
          </Link>
        );
      })}
    </div>
  );
}