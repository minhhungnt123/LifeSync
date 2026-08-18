import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ScheduleTrend } from '../../types/dashboard';

interface ScheduleTrendChartProps {
  data: ScheduleTrend[];
}

export const ScheduleTrendChart: React.FC<ScheduleTrendChartProps> = ({ data }) => {
  const formattedData = data.map((item) => {
    const parts = item.date.split('-');
    const displayDate = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item.date;
    return {
      ...item,
      displayDate,
    };
  });

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="displayDate" tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
          <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as ScheduleTrend;
                return (
                  <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
                    <p className="font-semibold text-slate-800 mb-1">Ngày {label}</p>
                    <div className="space-y-1 text-slate-600">
                      <p className="text-indigo-600 font-medium">📋 Tổng nhiệm vụ: {item.totalTasks}</p>
                      <p className="text-emerald-600 font-medium">✅ Đã hoàn thành: {item.completedTasks}</p>
                      <p className="text-slate-500 font-medium">⏱️ Tổng số giờ: {item.totalHours}h</p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
          />
          <Bar dataKey="totalTasks" name="Tổng nhiệm vụ" fill="#818CF8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="completedTasks" name="Đã hoàn thành" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
