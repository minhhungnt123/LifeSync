import axiosClient from './axiosClient';
import type { ApiResponse, Schedule, ScheduleCategory, ScheduleRequest } from '../types/schedule';

export const scheduleApi = {
  getSchedules: (params?: { start?: string; end?: string; category?: ScheduleCategory }): Promise<ApiResponse<Schedule[]>> => {
    return axiosClient.get('/schedules', { params });
  },

  getScheduleById: (id: number): Promise<ApiResponse<Schedule>> => {
    return axiosClient.get(`/schedules/${id}`);
  },

  createSchedule: (data: ScheduleRequest): Promise<ApiResponse<Schedule>> => {
    return axiosClient.post('/schedules', data);
  },

  updateSchedule: (id: number, data: ScheduleRequest): Promise<ApiResponse<Schedule>> => {
    return axiosClient.put(`/schedules/${id}`, data);
  },

  deleteSchedule: (id: number): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/schedules/${id}`);
  },
};
