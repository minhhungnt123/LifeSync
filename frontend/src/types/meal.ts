export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

export interface MealLog {
  id: number;
  userId: number;
  mealType: MealType;
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  loggedAt: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MealLogRequest {
  mealType: MealType;
  foodName: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  loggedAt: string;
}

export interface DailyNutritionSummary {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  mealCount: number;
  meals: MealLog[];
}
