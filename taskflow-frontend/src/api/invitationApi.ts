import apiClient from './client';
import type { ApiResponse } from '../types/common.types';
import type { Role } from '../types/auth.types';
import type { AuthResponse } from '../types/auth.types';

export interface Invitation {
  id: number;
  workspaceId: number;
  workspaceName: string;
  email: string;
  role: Role;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  invitedByName: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreateInvitationPayload {
  email: string;
  role: Role;
}

export interface AcceptInvitationPayload {
  token: string;
  name: string;
  password: string;
}

export const invitationApi = {
  create: (workspaceId: number, payload: CreateInvitationPayload) =>
    apiClient.post<ApiResponse<Invitation>>(`/workspaces/${workspaceId}/invitations`, payload),

  getAll: (workspaceId: number) =>
    apiClient.get<ApiResponse<Invitation[]>>(`/workspaces/${workspaceId}/invitations`),

  cancel: (workspaceId: number, invitationId: number) =>
    apiClient.delete<ApiResponse<void>>(`/workspaces/${workspaceId}/invitations/${invitationId}`),

  accept: (payload: AcceptInvitationPayload) =>
    apiClient.post<ApiResponse<AuthResponse>>('/invitations/accept', payload),
};