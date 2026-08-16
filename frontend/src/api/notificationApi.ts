import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/schedule';
import type { NotificationItem, NotificationType, UnreadNotificationCount } from '../types/user';

export const notificationApi = {
  getNotifications: (params?: { unreadOnly?: boolean; type?: NotificationType }): Promise<ApiResponse<NotificationItem[]>> => {
    return axiosClient.get('/notifications', { params });
  },

  getUnreadCount: (): Promise<ApiResponse<UnreadNotificationCount>> => {
    return axiosClient.get('/notifications/unread-count');
  },

  markAsRead: (id: number): Promise<ApiResponse<NotificationItem>> => {
    return axiosClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: (): Promise<ApiResponse<void>> => {
    return axiosClient.patch('/notifications/read-all');
  },

  deleteNotification: (id: number): Promise<ApiResponse<void>> => {
    return axiosClient.delete(`/notifications/${id}`);
  },
};
