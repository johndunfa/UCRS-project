'use client';

import { useEffect, useRef } from 'react';

export default function Chart({ type = 'line' }) {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const ctx = chartRef.current.getContext('2d');
      const width = chartRef.current.width;
      const height = chartRef.current.height;
      
      ctx.clearRect(0, 0, width, height);
      
      if (type === 'line') {
        drawLineChart(ctx, width, height);
      } else {
        drawPieChart(ctx, width, height);
      }
    }
  }, [type]);

  const drawLineChart = (ctx, width, height) => {
    // Simple line chart drawing code
    ctx.fillStyle = '#f9fafb';
    ctx.fillRect(0, 0, width, height);
    
    // Draw sample line
    ctx.beginPath();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.moveTo(40, height - 40);
    ctx.lineTo(width - 40, 40);
    ctx.stroke();
    
    // Add labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px sans-serif';
    ctx.fillText('Requests Trend', width/2 - 40, 30);
  };

  const drawPieChart = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.3;
    
    // Draw a simple circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText('Vehicle Status', centerX - 40, centerY);
  };

  return (
    <div className="w-full h-64 bg-white rounded-lg flex items-center justify-center">
      <canvas
        ref={chartRef}
        width={500}
        height={250}
        className="w-full h-full"
      />
    </div>
  );
}