import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { NutritionTrend } from '../../types/dashboard';

interface NutritionTrendChartProps {
  data: NutritionTrend[];
}

export const NutritionTrendChart: React.FC<NutritionTrendChartProps> = ({ data }) => {
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
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="displayDate" tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
          <YAxis tickLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const item = payload[0].payload as NutritionTrend & { displayDate: string };
                return (
                  <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
                    <p className="font-semibold text-slate-800 mb-1">Ngày {label}</p>
                    <div className="space-y-1 text-slate-600">
                      <p className="font-bold text-purple-600">🔥 Calories: {item.totalCalories} kcal</p>
                      <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-100">
                        <span>P: {item.totalProtein}g</span>
                        <span>C: {item.totalCarbs}g</span>
                        <span>F: {item.totalFat}g</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="totalCalories"
            stroke="#A855F7"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorCalories)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
