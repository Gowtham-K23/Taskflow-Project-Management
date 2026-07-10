import apiClient from './client';
import type { ApiResponse } from '../types/common.types';
import type { UserProfile, UpdateProfilePayload, ChangePasswordPayload } from '../types/auth.types';

export const userApi = {
  getProfile: () => apiClient.get<ApiResponse<UserProfile>>('/users/me'),

  updateProfile: (payload: UpdateProfilePayload) =>
    apiClient.put<ApiResponse<UserProfile>>('/users/me', payload),

  changePassword: (payload: ChangePasswordPayload) =>
    apiClient.patch<ApiResponse<void>>('/users/me/password', payload),
};