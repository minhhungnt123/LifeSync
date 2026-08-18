import axiosClient from './axiosClient';
import type { DashboardSummary } from '../types/dashboard';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const dashboardApi = {
  getSummary: (): Promise<ApiResponse<DashboardSummary>> => {
    return axiosClient.get('/dashboard/summary');
  },
};
