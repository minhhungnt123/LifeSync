import React from 'react';
import { Sun, Sunset, Moon, Coffee, Plus, Trash2, Edit2, Clock, Flame } from 'lucide-react';
import type { MealLog, MealType } from '../../types/meal';

interface MealCategorySectionProps {
  type: MealType;
  title: string;
  meals: MealLog[];
  onAddMeal: (type: MealType) => void;
  onEditMeal: (meal: MealLog) => void;
  onDeleteMeal: (id: number) => void;
}

const CATEGORY_CONFIG: Record<
  MealType,
  { icon: React.ElementType; colorClass: string; bgClass: string; badgeClass: string }
> = {
  BREAKFAST: {
    icon: Sun,
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50',
    badgeClass: 'bg-amber-100/70 text-amber-700',
  },
  LUNCH: {
    icon: Sunset,
    colorClass: 'text-orange-600',
    bgClass: 'bg-orange-50',
    badgeClass: 'bg-orange-100/70 text-orange-700',
  },
  DINNER: {
    icon: Moon,
    colorClass: 'text-indigo-600',
    bgClass: 'bg-indigo-50',
    badgeClass: 'bg-indigo-100/70 text-indigo-700',
  },
  SNACK: {
    icon: Coffee,
    colorClass: 'text-teal-600',
    bgClass: 'bg-teal-50',
    badgeClass: 'bg-teal-100/70 text-teal-700',
  },
};

export const MealCategorySection: React.FC<MealCategorySectionProps> = ({
  type,
  title,
  meals,
  onAddMeal,
  onEditMeal,
  onDeleteMeal,
}) => {
  const config = CATEGORY_CONFIG[type];
  const Icon = config.icon;

  const totalCategoryCalories = meals.reduce((sum, item) => sum + (item.calories || 0), 0);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${config.bgClass} ${config.colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
            <span className="text-xs font-semibold text-slate-400">
              {meals.length} món • <span className={config.colorClass}>{totalCategoryCalories.toLocaleString()} kcal</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => onAddMeal(type)}
          className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border border-transparent transition-all ${config.bgClass} ${config.colorClass} hover:opacity-90`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm món</span>
        </button>
      </div>

      {/* Meals List */}
      <div className="space-y-3 flex-1">
        {meals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200/80">
            <p className="text-xs text-slate-400 font-medium">Chưa có món ăn nào trong bữa này</p>
            <button
              onClick={() => onAddMeal(type)}
              className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              + Nhập bữa ăn ngay
            </button>
          </div>
        ) : (
          meals.map((meal) => (
            <div
              key={meal.id}
              className="p-3.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/70 border border-slate-100 transition-all flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800">{meal.foodName}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${config.badgeClass}`}>
                    <Flame className="w-3 h-3 inline mr-0.5" />
                    {meal.calories} kcal
                  </span>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatTime(meal.loggedAt)}
                  </span>
                  <span>P: <strong className="text-slate-600">{meal.protein || 0}g</strong></span>
                  <span>C: <strong className="text-slate-600">{meal.carbs || 0}g</strong></span>
                  <span>F: <strong className="text-slate-600">{meal.fat || 0}g</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEditMeal(meal)}
                  className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-colors"
                  title="Chỉnh sửa món ăn"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteMeal(meal.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-white transition-colors"
                  title="Xóa bữa ăn"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
