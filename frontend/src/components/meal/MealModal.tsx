import React, { useState, useEffect } from 'react';
import { X, Utensils, Flame, Sparkles } from 'lucide-react';
import type { MealLog, MealLogRequest, MealType } from '../../types/meal';

interface MealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MealLogRequest) => Promise<void>;
  initialData?: Partial<MealLog> | null;
  defaultMealType?: MealType;
  isLoading?: boolean;
  aiHeartTip?: string | null;
}

const PRESET_FOODS = [
  { name: 'Phở bò chín', type: 'BREAKFAST', calories: 450, protein: 25, carbs: 55, fat: 12 },
  { name: 'Bánh mì ốp la (2 trứng)', type: 'BREAKFAST', calories: 380, protein: 18, carbs: 40, fat: 15 },
  { name: 'Cơm tấm sườn nướng', type: 'LUNCH', calories: 620, protein: 32, carbs: 75, fat: 20 },
  { name: 'Bún chả Hà Nội', type: 'LUNCH', calories: 540, protein: 28, carbs: 60, fat: 18 },
  { name: 'Ức gà áp chảo + Cơm lứt', type: 'DINNER', calories: 480, protein: 40, carbs: 50, fat: 8 },
  { name: 'Salad cá hồi quả bơ', type: 'DINNER', calories: 420, protein: 30, carbs: 15, fat: 22 },
  { name: 'Sữa chua không đường + Hạt', type: 'SNACK', calories: 180, protein: 8, carbs: 20, fat: 7 },
  { name: 'Chuối chín (1 quả lớn)', type: 'SNACK', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
];

export const MealModal: React.FC<MealModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultMealType = 'BREAKFAST',
  isLoading = false,
  aiHeartTip,
}) => {
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fat, setFat] = useState<number | ''>('');
  const [loggedAt, setLoggedAt] = useState('');

  useEffect(() => {
    if (initialData) {
      setMealType(initialData.mealType || defaultMealType);
      setFoodName(initialData.foodName || '');
      setCalories(initialData.calories !== undefined ? initialData.calories : '');
      setProtein(initialData.protein !== undefined ? initialData.protein : '');
      setCarbs(initialData.carbs !== undefined ? initialData.carbs : '');
      setFat(initialData.fat !== undefined ? initialData.fat : '');
      setLoggedAt(initialData.loggedAt ? initialData.loggedAt.substring(0, 16) : getNowString());
    } else {
      setMealType(defaultMealType);
      setFoodName('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setLoggedAt(getNowString());
    }
  }, [initialData, defaultMealType, isOpen]);

  const getNowString = () => {
    const now = new Date();
    const isoStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
    return isoStr.substring(0, 16);
  };

  const handleApplyPreset = (preset: typeof PRESET_FOODS[0]) => {
    setFoodName(preset.name);
    setMealType(preset.type as MealType);
    setCalories(preset.calories);
    setProtein(preset.protein);
    setCarbs(preset.carbs);
    setFat(preset.fat);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    await onSubmit({
      mealType,
      foodName: foodName.trim(),
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      loggedAt: loggedAt ? `${loggedAt}:00` : new Date().toISOString(),
    });
  };

  const isEdit = Boolean(initialData && 'id' in initialData && initialData.id);
  const isFromAiScan = Boolean(!isEdit && initialData?.foodName);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isFromAiScan ? 'bg-purple-100 text-purple-600' : 'bg-indigo-50 text-indigo-600'
            }`}>
              {isFromAiScan ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Utensils className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isEdit
                  ? 'Chỉnh sửa bữa ăn'
                  : isFromAiScan
                  ? 'Xác nhận món ăn từ AI Scanner'
                  : 'Ghi nhận bữa ăn mới'}
              </h2>
              <p className="text-xs text-slate-400">
                {isFromAiScan
                  ? 'Kiểm tra và hiệu chỉnh lại thông số dinh dưỡng trước khi lưu'
                  : 'Lưu nhật ký dinh dưỡng để AI hỗ trợ theo dõi sức khỏe'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Heart Tip Banner */}
        {aiHeartTip && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-100 flex items-start gap-2.5">
            <span className="text-base">❤️</span>
            <div>
              <p className="text-xs font-bold text-rose-800">Lời khuyên tim mạch từ LifeSync AI:</p>
              <p className="text-xs text-rose-700 leading-relaxed mt-0.5">{aiHeartTip}</p>
            </div>
          </div>
        )}

        {/* Preset Quick Select */}
        <div className="px-6 py-3 bg-indigo-50/50 border-b border-indigo-100/50">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-700">Gợi ý món ăn nhanh:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
            {PRESET_FOODS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-white text-slate-700 hover:bg-indigo-600 hover:text-white border border-indigo-100 font-medium transition-all shadow-2xs"
              >
                {preset.name} ({preset.calories} kcal)
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Meal Type Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Loại bữa ăn
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { type: 'BREAKFAST', label: 'Bữa Sáng' },
                  { type: 'LUNCH', label: 'Bữa Trưa' },
                  { type: 'DINNER', label: 'Bữa Tối' },
                  { type: 'SNACK', label: 'Bữa Phụ' },
                ] as const
              ).map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setMealType(item.type)}
                  className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                    mealType === item.type
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Food Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Tên món ăn <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="VD: Cơm gà xối mỡ, Phở bò, Salad..."
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800 transition-all"
            />
          </div>

          {/* Calories & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Calories (kcal) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={calories}
                  onChange={(e) => setCalories(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="VD: 550"
                  className="w-full pl-3.5 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
                />
                <Flame className="w-4 h-4 text-orange-500 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Thời gian dùng <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={loggedAt}
                onChange={(e) => setLoggedAt(e.target.value)}
                className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
              />
            </div>
          </div>

          {/* Macros (Protein, Carbs, Fat) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Chỉ số dinh dưỡng vĩ mô (Macros - Tùy chọn)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <span className="text-[11px] font-medium text-slate-500 mb-1 block">Protein (g)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-500 mb-1 block">Carbs (g)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
                />
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-500 mb-1 block">Fat (g)</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={fat}
                  onChange={(e) => setFat(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50 transition-all"
            >
              {isLoading ? 'Đang lưu...' : initialData ? 'Cập nhật' : 'Thêm bữa ăn'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
