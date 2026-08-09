import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/auth';
import type { ScheduleCategory } from '../types/schedule';

export interface RoutineTemplateResponse {
  id: number;
  title: string;
  durationMinutes: number;
  category: ScheduleCategory;
  createdAt: string;
}

export interface RoutineTemplateRequest {
  title: string;
  durationMinutes: number;
  category: ScheduleCategory;
}

export const routineTemplateApi = {
  getTemplates: async (): Promise<ApiResponse<RoutineTemplateResponse[]>> => {
    const response = await axiosClient.get<ApiResponse<RoutineTemplateResponse[]>>('/routine-templates');
    return response.data;
  },

  createTemplate: async (data: RoutineTemplateRequest): Promise<ApiResponse<RoutineTemplateResponse>> => {
    const response = await axiosClient.post<ApiResponse<RoutineTemplateResponse>>('/routine-templates', data);
    return response.data;
  },

  deleteTemplate: async (id: number): Promise<ApiResponse<void>> => {
    const response = await axiosClient.delete<ApiResponse<void>>(`/routine-templates/${id}`);
    return response.data;
  },
};
