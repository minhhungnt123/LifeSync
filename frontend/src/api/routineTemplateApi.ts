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
  getTemplates: (): Promise<ApiResponse<RoutineTemplateResponse[]>> => {
    return axiosClient.get('/routine-templates');
  },

  createTemplate: (data: RoutineTemplateRequest): Promise<ApiResponse<RoutineTemplateResponse>> => {
    return axiosClient.post('/routine-templates', data);
  },

  deleteTemplate: (id: number): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/routine-templates/${id}`);
  },
};
