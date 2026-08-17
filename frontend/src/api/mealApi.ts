import axiosClient from './axiosClient';
import type { DailyNutritionSummary, MealLog, MealLogRequest } from '../types/meal';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const mealApi = {
  getMealLogs: (params?: { date?: string; start?: string; end?: string }): Promise<ApiResponse<MealLog[]>> => {
    return axiosClient.get('/meals', { params });
  },

  getMealLogById: (id: number): Promise<ApiResponse<MealLog>> => {
    return axiosClient.get(`/meals/${id}`);
  },

  createMealLog: (data: MealLogRequest): Promise<ApiResponse<MealLog>> => {
    return axiosClient.post('/meals', data);
  },

  updateMealLog: (id: number, data: MealLogRequest): Promise<ApiResponse<MealLog>> => {
    return axiosClient.put(`/meals/${id}`, data);
  },

  deleteMealLog: (id: number): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/meals/${id}`);
  },

  getDailyNutritionSummary: (date?: string): Promise<ApiResponse<DailyNutritionSummary>> => {
    return axiosClient.get('/meals/summary/daily', { params: { date } });
  },
};
