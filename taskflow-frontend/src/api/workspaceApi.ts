import apiClient from './client';
import type { ApiResponse } from '../types/common.types';
import type {
  Workspace,
  CreateWorkspacePayload,
  WorkspaceMember,
  AddMemberPayload,
} from '../types/workspace.types';

export const workspaceApi = {
  create: (payload: CreateWorkspacePayload) =>
    apiClient.post<ApiResponse<Workspace>>('/workspaces', payload),

  getAll: () => apiClient.get<ApiResponse<Workspace[]>>('/workspaces'),

  getById: (workspaceId: number) =>
    apiClient.get<ApiResponse<Workspace>>(`/workspaces/${workspaceId}`),

  addMember: (workspaceId: number, payload: AddMemberPayload) =>
    apiClient.post<ApiResponse<WorkspaceMember>>(`/workspaces/${workspaceId}/members`, payload),

  getMembers: (workspaceId: number) =>
    apiClient.get<ApiResponse<WorkspaceMember[]>>(`/workspaces/${workspaceId}/members`),
};