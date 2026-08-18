export interface CategoryDistribution {
  category: 'WORK' | 'STUDY' | 'HEALTH' | 'PERSONAL';
  totalHours: number;
  taskCount: number;
  percentage: number;
}

export interface NutritionTrend {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
}

export interface ScheduleTrend {
  date: string;
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
}

export interface DashboardSummary {
  todayScheduleCount: number;
  completedScheduleCount: number;
  completionRate: number;
  totalWorkHoursToday: number;

  todayCalories: number;
  targetCalories: number;
  todayProtein: number;
  todayCarbs: number;
  todayFat: number;

  categoryDistribution: CategoryDistribution[];
  nutritionTrends: NutritionTrend[];
  scheduleTrends: ScheduleTrend[];
}
