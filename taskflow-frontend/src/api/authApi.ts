import apiClient from './client';
import type { ApiResponse } from '../types/common.types';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth.types';

export const authApi = {
  register: (payload: RegisterPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload),

  login: (payload: LoginPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload),
};