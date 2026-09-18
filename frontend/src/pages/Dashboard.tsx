import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/dashboardApi';
import { CategoryDistributionChart } from '../components/dashboard/CategoryDistributionChart';
import { NutritionTrendChart } from '../components/dashboard/NutritionTrendChart';
import { ScheduleTrendChart } from '../components/dashboard/ScheduleTrendChart';
import { ErrorState } from '../components/common/ErrorState';
import { parseApiError } from '../utils/errorUtils';
import {
  Sparkles,
  Calendar,
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  TrendingUp,
  PieChart as PieChartIcon,
  Activity,
  Bot,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const {
    data: dashboardResponse,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => dashboardApi.getSummary(),
  });

  const parsedError = isError ? parseApiError(error) : null;


  const summary = dashboardResponse?.data;

  // Calorie Percentage calculation
  const caloriePercent = summary && summary.targetCalories > 0
    ? Math.min(Math.round((summary.todayCalories / summary.targetCalories) * 100), 100)
    : 0;

  // Dynamic AI Insight text
  const getAiInsight = () => {
    if (!summary) return 'Đang khởi tạo phân tích từ trợ lý AI...';
    if (summary.todayScheduleCount === 0 && summary.todayCalories === 0) {
      return 'Tạo lịch làm việc và ghi nhận bữa ăn đầu tiên để LifeSync AI bắt đầu hỗ trợ bạn!';
    }
    if (summary.completionRate >= 80) {
      return `Tuyệt vời! Bạn đã hoàn thành ${summary.completionRate}% mục tiêu hôm nay. Hãy duy trì năng lượng này!`;
    }
    if (summary.todayCalories > summary.targetCalories) {
      return `Bạn đã nạp quá mục tiêu Calorie (${summary.todayCalories} / ${summary.targetCalories} kcal). Nên kết hợp vận động nhẹ vào buổi tối.`;
    }
    return `Bạn đã hoàn thành ${summary.completedScheduleCount}/${summary.todayScheduleCount} nhiệm vụ hôm nay và tích lũy được ${summary.totalWorkHoursToday} giờ tập trung.`;
  };

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Xin chào, {user?.fullName} 👋
          </h1>
          <p className="text-sm mt-1 text-slate-500">
            Dưới đây là bức tranh tổng quan về hiệu suất công việc và sức khỏe của bạn hôm nay.
          </p>
        </div>

        {/* AI Active Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto rounded-xl px-3.5 py-2 text-xs font-semibold bg-indigo-50 border border-indigo-200/60 text-indigo-600 shadow-sm">
          <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
          <span>LifeSync AI Engine Active</span>
        </div>
      </div>

      {/* ── Error Banner ─────────────────────────────────────────────────── */}
      {isError && parsedError && (
        <ErrorState
          title="Không thể tải dữ liệu Dashboard"
          message={parsedError.message}
          isNetworkError={parsedError.isNetworkError}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      )}


      {/* ── Stat Summary Cards Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Card 1: Lịch trình hôm nay */}
        <div className="surface-card rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lịch trình hôm nay</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-12 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            <>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-800">
                  {summary?.completedScheduleCount || 0}
                  <span className="text-lg font-normal text-slate-400">/{summary?.todayScheduleCount || 0}</span>
                </span>
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  {summary?.completionRate || 0}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${summary?.completionRate || 0}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Card 2: Tổng giờ tập trung */}
        <div className="surface-card rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Thời gian tập trung</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-12 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            <>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-slate-800">
                  {summary?.totalWorkHoursToday || 0}
                </span>
                <span className="text-sm font-medium text-slate-500">giờ</span>
              </div>
              <span className="text-xs text-slate-400 mt-3 block flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                Tự động tổng hợp từ lịch trình
              </span>
            </>
          )}
        </div>

        {/* Card 3: Calories hôm nay */}
        <div className="surface-card rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Calories nạp vào</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
          </div>
          {isLoading ? (
            <div className="h-12 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            <>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-800">
                  {summary?.todayCalories.toLocaleString() || 0}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ {summary?.targetCalories.toLocaleString() || 2000} kcal</span>
                </span>
                <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                  {caloriePercent}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                <div
                  className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${caloriePercent}%` }}
                />
              </div>
            </>
          )}
        </div>

        {/* Card 4: Gợi ý AI */}
        <div className="surface-card rounded-2xl p-5 border border-indigo-100 bg-gradient-to-br from-white to-indigo-50/40 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5 text-indigo-500" />
              Gợi ý từ AI
            </span>
          </div>
          {isLoading ? (
            <div className="h-12 bg-slate-100 animate-pulse rounded-lg" />
          ) : (
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              "{getAiInsight()}"
            </p>
          )}
        </div>

      </div>

      {/* ── Charts Grid Section ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Phân bổ thời gian */}
        <div className="surface-card rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <PieChartIcon className="h-4 w-4 text-indigo-600" />
                Phân bổ thời gian theo Danh mục
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Tỷ lệ thời gian dành cho các hoạt động</p>
            </div>
          </div>
          {isLoading ? (
            <div className="h-64 bg-slate-50 animate-pulse rounded-xl" />
          ) : (
            <CategoryDistributionChart data={summary?.categoryDistribution || []} />
          )}
        </div>

        {/* Chart 2: Xu hướng lịch trình 7 ngày */}
        <div className="surface-card rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Xu hướng nhiệm vụ (7 ngày)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Tổng số nhiệm vụ vs Đã hoàn thành</p>
            </div>
          </div>
          {isLoading ? (
            <div className="h-64 bg-slate-50 animate-pulse rounded-xl" />
          ) : (
            <ScheduleTrendChart data={summary?.scheduleTrends || []} />
          )}
        </div>

      </div>

      {/* ── Full Width Chart: Dinh dưỡng 7 ngày ───────────────────────── */}
      <div className="surface-card rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-600" />
              Xu hướng nạp Calories (7 ngày gần nhất)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Theo dõi lượng Calorie tiêu thụ hàng ngày</p>
          </div>
        </div>
        {isLoading ? (
          <div className="h-64 bg-slate-50 animate-pulse rounded-xl" />
        ) : (
          <NutritionTrendChart data={summary?.nutritionTrends || []} />
        )}
      </div>

    </div>
  );
};
