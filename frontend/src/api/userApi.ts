import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/schedule';
import type {
  UserProfile,
  UserProfileUpdateRequest,
  UserPreference,
  UserPreferenceUpdateRequest,
  BodyMetricsRecommendation,
  ChangePasswordRequest,
  UserDataExport,
} from '../types/user';

export const userApi = {
  getProfile: (): Promise<ApiResponse<UserProfile>> => {
    return axiosClient.get('/users/profile');
  },

  updateProfile: (data: UserProfileUpdateRequest): Promise<ApiResponse<UserProfile>> => {
    return axiosClient.put('/users/profile', data);
  },

  getPreference: (): Promise<ApiResponse<UserPreference>> => {
    return axiosClient.get('/users/preferences');
  },

  updatePreference: (data: UserPreferenceUpdateRequest): Promise<ApiResponse<UserPreference>> => {
    return axiosClient.put('/users/preferences', data);
  },

  getBodyMetricsRecommendation: (): Promise<ApiResponse<BodyMetricsRecommendation>> => {
    return axiosClient.get('/users/body-metrics/recommendation');
  },

  changePassword: (data: ChangePasswordRequest): Promise<ApiResponse<void>> => {
    return axiosClient.post('/users/change-password', data);
  },

  exportData: (): Promise<ApiResponse<UserDataExport>> => {
    return axiosClient.get('/users/export-data');
  },
};
