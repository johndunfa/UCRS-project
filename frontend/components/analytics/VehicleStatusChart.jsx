'use client';

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function VehicleStatusChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;
  }

  const statusColors = {
    available: '#22c55e',
    assigned: '#3b82f6',
    maintenance: '#eab308',
    'out-of-service': '#ef4444'
  };

  const chartData = {
    labels: data.map(item => item._id.charAt(0).toUpperCase() + item._id.slice(1)),
    datasets: [
      {
        data: data.map(item => item.count),
        backgroundColor: data.map(item => statusColors[item._id] || '#6b7280'),
        borderWidth: 0,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%'
  };

  return (
    <div className="h-80 flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}