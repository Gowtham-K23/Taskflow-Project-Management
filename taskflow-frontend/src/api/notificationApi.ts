import apiClient from './client';
import type { ApiResponse } from '../types/common.types';
import type { Notification } from '../types/notification.types';

export const notificationApi = {
  getAll: () => apiClient.get<ApiResponse<Notification[]>>('/notifications'),

  getUnread: () => apiClient.get<ApiResponse<Notification[]>>('/notifications/unread'),

  getUnreadCount: () => apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markAsRead: (notificationId: number) =>
    apiClient.patch<ApiResponse<void>>(`/notifications/${notificationId}/read`),

  markAllAsRead: () => apiClient.patch<ApiResponse<void>>('/notifications/read-all'),
};