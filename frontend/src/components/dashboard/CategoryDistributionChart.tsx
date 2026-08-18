import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CategoryDistribution } from '../../types/dashboard';

interface CategoryDistributionChartProps {
  data: CategoryDistribution[];
}

const CATEGORY_MAP: Record<string, { label: string; color: string }> = {
  WORK: { label: 'Công việc', color: '#4F46E5' },
  STUDY: { label: 'Học tập', color: '#0284C7' },
  HEALTH: { label: 'Sức khỏe', color: '#10B981' },
  PERSONAL: { label: 'Cá nhân', color: '#EC4899' },
};

export const CategoryDistributionChart: React.FC<CategoryDistributionChartProps> = ({ data }) => {
  const chartData = data.map((item) => ({
    name: CATEGORY_MAP[item.category]?.label || item.category,
    value: item.totalHours,
    percentage: item.percentage,
    taskCount: item.taskCount,
    color: CATEGORY_MAP[item.category]?.color || '#64748B',
  }));

  const hasData = chartData.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-sm font-medium text-slate-400">Chưa có lịch trình được tạo</p>
        <span className="text-xs text-slate-400 mt-1">Tạo thêm lịch trình để xem phân bổ thời gian</span>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload;
                return (
                  <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      {item.name}
                    </div>
                    <div className="mt-1 text-slate-600 space-y-0.5">
                      <p>{item.value} giờ ({item.percentage}%)</p>
                      <p className="text-slate-400">{item.taskCount} nhiệm vụ</p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value, entry: any) => (
              <span className="text-xs font-medium text-slate-600 mr-2">
                {value} ({entry.payload.percentage}%)
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
