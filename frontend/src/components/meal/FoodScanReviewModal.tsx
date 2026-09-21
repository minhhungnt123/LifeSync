import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Heart,
  Flame,
  Dna,
  Wheat,
  Droplet,
  Camera,
  Check,
  Plus,
  Clock,
  Utensils,
  ShieldCheck,
  Scale,
  RefreshCw,
} from 'lucide-react';
import type { MealLogRequest, MealType } from '../../types/meal';
import type { FoodScanResponse } from '../../types/ai';

interface FoodScanReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  scanResult: FoodScanResponse | null;
  previewUrl: string | null;
  onConfirmSave: (data: MealLogRequest) => Promise<void>;
  onRescan: () => void;
  defaultMealType?: MealType;
  isSaving?: boolean;
}

const PORTION_PRESETS = [
  { label: '0.5x (Nửa phần)', multiplier: 0.5 },
  { label: '1.0x (Chuẩn)', multiplier: 1.0 },
  { label: '1.5x (Nhiều)', multiplier: 1.5 },
  { label: '2.0x (Gấp đôi)', multiplier: 2.0 },
];

export const FoodScanReviewModal: React.FC<FoodScanReviewModalProps> = ({
  isOpen,
  onClose,
  scanResult,
  previewUrl,
  onConfirmSave,
  onRescan,
  defaultMealType = 'LUNCH',
  isSaving = false,
}) => {
  const [foodName, setFoodName] = useState('');
  const [mealType, setMealType] = useState<MealType>(defaultMealType);
  const [loggedAt, setLoggedAt] = useState('');

  // Base values from AI scan for proportional scaling
  const [baseValues, setBaseValues] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sodium: 0,
  });

  const [portionMultiplier, setPortionMultiplier] = useState<number>(1.0);
  const [calories, setCalories] = useState<number | ''>('');
  const [protein, setProtein] = useState<number | ''>('');
  const [carbs, setCarbs] = useState<number | ''>('');
  const [fat, setFat] = useState<number | ''>('');
  const [sodium, setSodium] = useState<number | ''>('');

  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');

  const getNowString = () => {
    const now = new Date();
    const isoStr = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
    return isoStr.substring(0, 16);
  };

  useEffect(() => {
    if (scanResult) {
      const raw = scanResult as Record<string, any>;
      const rawMacros = scanResult.macros as Record<string, any> | undefined;

      const initialCal = Math.round(Number(scanResult.calories || raw?.calorie) || 0);
      const initialProt = Math.round(Number(scanResult.macros?.protein ?? rawMacros?.protein_g ?? raw?.protein ?? raw?.protein_g) || 0);
      const initialCarb = Math.round(Number(scanResult.macros?.carbs ?? rawMacros?.carbohydrates ?? rawMacros?.carb ?? raw?.carbs ?? raw?.carbohydrates) || 0);
      const initialFat = Math.round(Number(scanResult.macros?.fat ?? rawMacros?.total_fat ?? rawMacros?.fats ?? raw?.fat ?? raw?.total_fat) || 0);
      const initialSod = Math.round(Number(scanResult.macros?.sodium ?? rawMacros?.sodium_mg ?? rawMacros?.salt ?? raw?.sodium ?? raw?.sodium_mg) || 0);

      setFoodName(scanResult.foodName || 'Món ăn nhận diện');
      setMealType(defaultMealType);
      setLoggedAt(getNowString());
      setPortionMultiplier(1.0);

      setBaseValues({
        calories: initialCal,
        protein: initialProt,
        carbs: initialCarb,
        fat: initialFat,
        sodium: initialSod,
      });

      setCalories(initialCal);
      setProtein(initialProt);
      setCarbs(initialCarb);
      setFat(initialFat);
      setSodium(initialSod);

      setIngredients(scanResult.ingredients ? [...scanResult.ingredients] : []);
    }
  }, [scanResult, defaultMealType, isOpen]);

  if (!isOpen || !scanResult) return null;

  const handleMultiplierChange = (multiplier: number) => {
    setPortionMultiplier(multiplier);
    setCalories(Math.round(baseValues.calories * multiplier));
    setProtein(Math.round(baseValues.protein * multiplier));
    setCarbs(Math.round(baseValues.carbs * multiplier));
    setFat(Math.round(baseValues.fat * multiplier));
    setSodium(Math.round(baseValues.sodium * multiplier));
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (indexToRemove: number) => {
    setIngredients(ingredients.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foodName.trim()) return;

    await onConfirmSave({
      foodName: foodName.trim(),
      mealType,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fat: Number(fat) || 0,
      loggedAt: loggedAt ? `${loggedAt}:00` : new Date().toISOString(),
    });
  };

  const healthScore = scanResult.healthScore || 75;
  const confidencePercent = Math.round((scanResult.confidence || 0.9) * 100);

  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Rất thân thiện với tim mạch';
    if (score >= 60) return 'Mức độ cân đối hợp lý';
    return 'Nên hạn chế (nhiều muối / mỡ)';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-auto max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">
                  Xác Nhận & Hiệu Chỉnh Dinh Dưỡng
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                  <ShieldCheck className="w-3 h-3" />
                  Gemini Vision Verified
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Kiểm tra thông tin do AI nhận diện, điều chỉnh khẩu phần trước khi lưu vào nhật ký
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - 2 Columns on Desktop */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: Visuals & Cardiovascular Insights (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Image Preview with AI Confidence */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-sm aspect-4/3 flex items-center justify-center group">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={foodName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="text-slate-400 flex flex-col items-center">
                    <Utensils className="w-10 h-10 mb-2" />
                    <span className="text-xs">Không có ảnh xem trước</span>
                  </div>
                )}

                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-slate-900/80 text-white backdrop-blur-xs border border-white/20 shadow-sm flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {confidencePercent}% Tin cậy
                  </span>
                </div>

                <div className="absolute bottom-3 right-3">
                  <button
                    type="button"
                    onClick={onRescan}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-xs font-semibold backdrop-blur-xs shadow-md transition-all hover:scale-105 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Chụp lại</span>
                  </button>
                </div>
              </div>

              {/* Heart Health Score Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50/60 via-pink-50/40 to-white border border-rose-100/90 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-rose-500 text-white shadow-xs">
                      <Heart className="w-4 h-4 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Chỉ Số Sức Khỏe Tim Mạch</h4>
                      <p className="text-[11px] text-slate-500">Đánh giá theo tiêu chuẩn DASH</p>
                    </div>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-xl text-xs font-extrabold border ${getScoreBadgeColor(
                      healthScore
                    )}`}
                  >
                    {healthScore}/100
                  </div>
                </div>

                {/* Score Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                    <span>{getScoreLabel(healthScore)}</span>
                    <span className="text-slate-400">{healthScore}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        healthScore >= 80
                          ? 'bg-emerald-500'
                          : healthScore >= 60
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${healthScore}%` }}
                    />
                  </div>
                </div>

                {/* Actionable Heart Health Tip */}
                {scanResult.heartHealthTip && (
                  <div className="p-2.5 rounded-xl bg-white/80 border border-rose-100 text-[11.5px] text-slate-700 leading-relaxed">
                    <span className="font-bold text-rose-700">Lời khuyên AI: </span>
                    {scanResult.heartHealthTip}
                  </div>
                )}

                {/* Sodium Estimation */}
                {scanResult.macros?.sodium !== undefined && (
                  <div className="flex items-center justify-between pt-1 border-t border-rose-100/60 text-xs">
                    <span className="text-slate-500 font-medium">Hàm lượng Natri (Muối):</span>
                    <span className="font-bold text-slate-800">
                      {sodium || 0} mg{' '}
                      <span className="text-[10px] text-slate-400 font-normal">
                        (Khuyến nghị &lt;2300mg/ngày)
                      </span>
                    </span>
                  </div>
                )}
              </div>

              {/* Detected Ingredients Tag Cloud */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Utensils className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Thành Phần Nhận Diện Được ({ingredients.length})</span>
                  </h4>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                  {ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white text-slate-700 border border-slate-200 shadow-2xs group"
                    >
                      <span>{ing}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredient(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Xóa nguyên liệu này"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {ingredients.length === 0 && (
                    <span className="text-xs text-slate-400 italic">Chưa có thành phần</span>
                  )}
                </div>

                {/* Quick Add Ingredient Input */}
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    placeholder="Thêm nguyên liệu khác..."
                    className="flex-1 px-3 py-1 text-xs rounded-xl bg-white border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddIngredient(e);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                    title="Thêm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Nutrition & Portion Editing Form (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Food Name Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Tên món ăn</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    AI tự động nhận diện (có thể sửa lại)
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm font-semibold rounded-2xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all shadow-2xs"
                  placeholder="Ví dụ: Phở bò chín tái..."
                />
              </div>

              {/* Meal Type Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Thời điểm bữa ăn</label>
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
                      className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        mealType === item.type
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02]'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portion Multiplier Selector */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    <span>Điều Chỉnh Khẩu Phần Thực Tế</span>
                  </div>
                  {scanResult.portion && (
                    <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-100 shadow-2xs">
                      Ước lượng gốc: {scanResult.portion}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PORTION_PRESETS.map((preset) => (
                    <button
                      key={preset.multiplier}
                      type="button"
                      onClick={() => handleMultiplierChange(preset.multiplier)}
                      className={`py-2 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                        portionMultiplier === preset.multiplier
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-indigo-50/80 border border-indigo-100/80'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  * Khi bạn đổi khẩu phần, lượng Calorie và Macros bên dưới sẽ tự động tính toán lại.
                </p>
              </div>

              {/* Macronutrients Grid (Interactive) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Giá trị Dinh dưỡng & Calorie (Có thể hiệu chỉnh trực tiếp)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Calories */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                    <div className="flex items-center justify-between text-amber-700 text-xs font-bold">
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" /> Calorie
                      </span>
                      <span className="text-[10px]">kcal</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={calories}
                      onChange={(e) =>
                        setCalories(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full text-base font-extrabold text-slate-800 bg-transparent border-none outline-none"
                    />
                  </div>

                  {/* Protein */}
                  <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1">
                    <div className="flex items-center justify-between text-blue-700 text-xs font-bold">
                      <span className="flex items-center gap-1">
                        <Dna className="w-3.5 h-3.5" /> Đạm (Prot)
                      </span>
                      <span className="text-[10px]">gram</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={protein}
                      onChange={(e) =>
                        setProtein(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full text-base font-extrabold text-slate-800 bg-transparent border-none outline-none"
                    />
                  </div>

                  {/* Carbs */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                    <div className="flex items-center justify-between text-emerald-700 text-xs font-bold">
                      <span className="flex items-center gap-1">
                        <Wheat className="w-3.5 h-3.5" /> Đường bột
                      </span>
                      <span className="text-[10px]">gram</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={carbs}
                      onChange={(e) =>
                        setCarbs(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full text-base font-extrabold text-slate-800 bg-transparent border-none outline-none"
                    />
                  </div>

                  {/* Fat */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-1">
                    <div className="flex items-center justify-between text-purple-700 text-xs font-bold">
                      <span className="flex items-center gap-1">
                        <Droplet className="w-3.5 h-3.5" /> Chất béo
                      </span>
                      <span className="text-[10px]">gram</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={fat}
                      onChange={(e) =>
                        setFat(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full text-base font-extrabold text-slate-800 bg-transparent border-none outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Logged At Date & Time */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Thời gian ghi nhận</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={loggedAt}
                  onChange={(e) => setLoggedAt(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-semibold rounded-2xl bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-600 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onRescan}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all hover:scale-105 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Quét lại ảnh khác</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-2xl transition-colors disabled:opacity-50 cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSaving || !foodName.trim()}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 rounded-2xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Đang lưu vào nhật ký...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Xác nhận & Lưu nhật ký bữa ăn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
