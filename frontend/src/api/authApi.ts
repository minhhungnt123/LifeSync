import axiosClient from './axiosClient';
import type { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, User } from '../types/auth';

export const authApi = {
  register: (data: RegisterRequest): Promise<ApiResponse<AuthResponse>> => {
    return axiosClient.post('/auth/register', data);
  },
  
  login: (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    return axiosClient.post('/auth/login', data);
  },

  getCurrentUser: (): Promise<ApiResponse<User>> => {
    return axiosClient.get('/auth/me');
  },
};
