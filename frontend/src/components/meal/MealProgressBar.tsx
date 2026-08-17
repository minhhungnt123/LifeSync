import React from 'react';
import { Flame, Dumbbell, Wheat, Droplet } from 'lucide-react';
import type { DailyNutritionSummary } from '../../types/meal';

interface MealProgressBarProps {
  summary?: DailyNutritionSummary;
  calorieTarget?: number;
  proteinTarget?: number;
  carbsTarget?: number;
  fatTarget?: number;
}

export const MealProgressBar: React.FC<MealProgressBarProps> = ({
  summary,
  calorieTarget = 2000,
  proteinTarget = 120,
  carbsTarget = 250,
  fatTarget = 65,
}) => {
  const currentCalories = summary?.totalCalories || 0;
  const currentProtein = summary?.totalProtein || 0;
  const currentCarbs = summary?.totalCarbs || 0;
  const currentFat = summary?.totalFat || 0;

  const calPercent = Math.min(100, Math.round((currentCalories / calorieTarget) * 100));
  const proPercent = Math.min(100, Math.round((currentProtein / proteinTarget) * 100));
  const carbPercent = Math.min(100, Math.round((currentCarbs / carbsTarget) * 100));
  const fatPercent = Math.min(100, Math.round((currentFat / fatTarget) * 100));

  const items = [
    {
      label: 'Tổng Calories',
      current: currentCalories,
      target: calorieTarget,
      unit: 'kcal',
      percent: calPercent,
      icon: Flame,
      gradient: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      textColor: 'text-orange-600',
      barColor: '#F97316',
    },
    {
      label: 'Protein (Đạm)',
      current: currentProtein,
      target: proteinTarget,
      unit: 'g',
      percent: proPercent,
      icon: Dumbbell,
      gradient: 'from-indigo-500 to-blue-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
      textColor: 'text-indigo-600',
      barColor: '#4F46E5',
    },
    {
      label: 'Carbs (Tinh bột)',
      current: currentCarbs,
      target: carbsTarget,
      unit: 'g',
      percent: carbPercent,
      icon: Wheat,
      gradient: 'from-emerald-500 to-teal-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      textColor: 'text-emerald-600',
      barColor: '#10B981',
    },
    {
      label: 'Fat (Chất béo)',
      current: currentFat,
      target: fatTarget,
      unit: 'g',
      percent: fatPercent,
      icon: Droplet,
      gradient: 'from-rose-500 to-pink-500',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      textColor: 'text-rose-600',
      barColor: '#F43F5E',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className={`p-2.5 rounded-xl ${item.bgColor} ${item.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.bgColor} ${item.textColor}`}>
                {item.percent}%
              </span>
            </div>

            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-800">
                  {item.current.toLocaleString()}
                </span>
                <span className="text-xs font-medium text-slate-400">/ {item.target} {item.unit}</span>
              </div>
              <span className="text-xs text-slate-400">
                còn {Math.max(0, item.target - item.current)} {item.unit}
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${item.percent}%`,
                  backgroundColor: item.barColor,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
