import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Sparkles,
  Camera,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { mealApi } from '../api/mealApi';
import type { MealLog, MealLogRequest, MealType } from '../types/meal';
import type { FoodScanResponse } from '../types/ai';
import { MealProgressBar } from '../components/meal/MealProgressBar';
import { MealCategorySection } from '../components/meal/MealCategorySection';
import { MealModal } from '../components/meal/MealModal';
import { FoodScanModal } from '../components/meal/FoodScanModal';
import { FoodScanReviewModal } from '../components/meal/FoodScanReviewModal';
import { ErrorState } from '../components/common/ErrorState';
import { parseApiError } from '../utils/errorUtils';

const EMPTY_MEAL_LOGS: MealLog[] = [];


export const MealPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().substring(0, 10)
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [scannedResult, setScannedResult] = useState<FoodScanResponse | null>(null);
  const [scannedPreviewUrl, setScannedPreviewUrl] = useState<string | null>(null);
  const [scannedHeartTip, setScannedHeartTip] = useState<string | null>(null);
  const [editingMeal, setEditingMeal] = useState<MealLog | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('BREAKFAST');

  // Fetch daily nutrition summary
  const {
    data: summaryResponse,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary,
    isFetching: isSummaryFetching,
  } = useQuery({
    queryKey: ['dailyNutritionSummary', selectedDate],
    queryFn: () => mealApi.getDailyNutritionSummary(selectedDate),
  });

  // Fetch meal logs for selected date
  const {
    data: mealsResponse,
    isLoading: isMealsLoading,
    isError: isMealsError,
    error: mealsError,
    refetch: refetchMeals,
    isFetching: isMealsFetching,
  } = useQuery({
    queryKey: ['mealLogs', selectedDate],
    queryFn: () => mealApi.getMealLogs({ date: selectedDate }),
  });

  const dailySummary = summaryResponse?.data;
  const mealLogs = mealsResponse?.data ?? EMPTY_MEAL_LOGS;

  const isAnyError = isSummaryError || isMealsError;
  const parsedMealError = isAnyError
    ? parseApiError(summaryError || mealsError)
    : null;

  const handleRetryAll = () => {
    refetchSummary();
    refetchMeals();
  };

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: MealLogRequest) => mealApi.createMealLog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyNutritionSummary'] });
      queryClient.invalidateQueries({ queryKey: ['mealLogs'] });
      toast.success('Ghi nhận bữa ăn thành công!');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      const p = parseApiError(error);
      toast.error(p.message || 'Tạo bữa ăn thất bại!');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: MealLogRequest }) =>
      mealApi.updateMealLog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyNutritionSummary'] });
      queryClient.invalidateQueries({ queryKey: ['mealLogs'] });
      toast.success('Cập nhật bữa ăn thành công!');
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      const p = parseApiError(error);
      toast.error(p.message || 'Cập nhật bữa ăn thất bại!');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => mealApi.deleteMealLog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyNutritionSummary'] });
      queryClient.invalidateQueries({ queryKey: ['mealLogs'] });
      toast.success('Đã xóa bữa ăn!');
    },
    onError: (error: any) => {
      const p = parseApiError(error);
      toast.error(p.message || 'Xóa bữa ăn thất bại!');
    },
  });


  // Date Navigation
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().substring(0, 10));
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().substring(0, 10));
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().substring(0, 10));
  };

  const handleOpenAddModal = (type: MealType = 'BREAKFAST') => {
    setEditingMeal(null);
    setScannedHeartTip(null);
    setSelectedMealType(type);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (meal: MealLog) => {
    setEditingMeal(meal);
    setScannedHeartTip(null);
    setSelectedMealType(meal.mealType);
    setIsModalOpen(true);
  };

  const handleScanSuccess = (result: FoodScanResponse, previewUrl: string) => {
    setScannedResult(result);
    setScannedPreviewUrl(previewUrl);
    setIsReviewModalOpen(true);
  };

  const handleConfirmReviewSave = async (data: MealLogRequest) => {
    await createMutation.mutateAsync(data);
    setIsReviewModalOpen(false);
    setScannedResult(null);
    setScannedPreviewUrl(null);
  };

  const handleRescan = () => {
    setIsReviewModalOpen(false);
    setIsScanModalOpen(true);
  };

  const handleDeleteMeal = (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bữa ăn này không?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormSubmit = async (data: MealLogRequest) => {
    if (editingMeal && editingMeal.id) {
      await updateMutation.mutateAsync({ id: editingMeal.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const isToday = dateStr === new Date().toISOString().substring(0, 10);
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const formatted = date.toLocaleDateString('vi-VN', options);
      return isToday ? `Hôm nay, ${formatted}` : formatted;
    } catch {
      return dateStr;
    }
  };

  const filterMealsByType = (type: MealType) => {
    return mealLogs.filter((meal) => meal.mealType === type);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Nhật ký Bữa ăn & Dinh dưỡng
              </h1>
              <p className="text-xs text-slate-500">
                Quản lý chế độ ăn uống, theo dõi Calorie và dinh dưỡng theo ngày
              </p>
            </div>
          </div>
        </div>

        {/* Date Selector & Primary Action */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker Controls */}
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-1 shadow-2xs">
            <button
              onClick={handlePrevDay}
              className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition-colors"
              title="Ngày trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-slate-700">
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent border-none outline-none font-semibold text-slate-800 cursor-pointer"
              />
            </div>

            <button
              onClick={handleNextDay}
              className="p-2 text-slate-500 hover:text-indigo-600 rounded-xl hover:bg-slate-50 transition-colors"
              title="Ngày sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors cursor-pointer"
          >
            Hôm nay
          </button>

          {/* AI Food Scanner Button */}
          <button
            onClick={() => setIsScanModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 rounded-2xl shadow-md shadow-purple-200 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Camera className="w-4 h-4 text-purple-200" />
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse -ml-1" />
            <span>AI Quét món ăn</span>
          </button>

          <button
            onClick={() => handleOpenAddModal('BREAKFAST')}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-md shadow-indigo-200 transition-all hover:scale-[1.02] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi nhận bữa ăn</span>
          </button>
        </div>
      </div>

      {/* Date Title Banner */}
      <div className="flex items-center justify-between px-5 py-3 rounded-2xl bg-indigo-50/70 border border-indigo-100">
        <span className="text-xs font-bold text-indigo-900 capitalize">
          📅 {formatDisplayDate(selectedDate)}
        </span>
        <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-700">
          <Sparkles className="w-3.5 h-3.5" />
          <span>LifeSync AI tự động phân tích chỉ số dinh dưỡng</span>
        </div>
      </div>

      {/* Error Banner */}
      {isAnyError && parsedMealError && (
        <ErrorState
          title="Không thể tải nhật ký dinh dưỡng"
          message={parsedMealError.message}
          isNetworkError={parsedMealError.isNetworkError}
          onRetry={handleRetryAll}
          isRetrying={isSummaryFetching || isMealsFetching}
        />
      )}

      {/* Nutritional Progress Bars */}

      {isSummaryLoading ? (
        <div className="h-28 bg-slate-100 rounded-2xl animate-pulse" />
      ) : (
        <MealProgressBar summary={dailySummary} />
      )}

      {/* Meal Categories Grid */}
      {isMealsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <MealCategorySection
            type="BREAKFAST"
            title="Bữa Sáng"
            meals={filterMealsByType('BREAKFAST')}
            onAddMeal={handleOpenAddModal}
            onEditMeal={handleOpenEditModal}
            onDeleteMeal={handleDeleteMeal}
          />

          <MealCategorySection
            type="LUNCH"
            title="Bữa Trưa"
            meals={filterMealsByType('LUNCH')}
            onAddMeal={handleOpenAddModal}
            onEditMeal={handleOpenEditModal}
            onDeleteMeal={handleDeleteMeal}
          />

          <MealCategorySection
            type="DINNER"
            title="Bữa Tối"
            meals={filterMealsByType('DINNER')}
            onAddMeal={handleOpenAddModal}
            onEditMeal={handleOpenEditModal}
            onDeleteMeal={handleDeleteMeal}
          />

          <MealCategorySection
            type="SNACK"
            title="Bữa Phụ"
            meals={filterMealsByType('SNACK')}
            onAddMeal={handleOpenAddModal}
            onEditMeal={handleOpenEditModal}
            onDeleteMeal={handleDeleteMeal}
          />
        </div>
      )}

      {/* Meal Modal Form */}
      <MealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingMeal}
        defaultMealType={selectedMealType}
        isLoading={createMutation.isPending || updateMutation.isPending}
        aiHeartTip={scannedHeartTip}
      />

      {/* AI Food Scan Modal */}
      <FoodScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* AI Food Scan Review & Human-in-the-loop Modal */}
      <FoodScanReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        scanResult={scannedResult}
        previewUrl={scannedPreviewUrl}
        onConfirmSave={handleConfirmReviewSave}
        onRescan={handleRescan}
        defaultMealType={selectedMealType}
        isSaving={createMutation.isPending}
      />
    </div>
  );
};
