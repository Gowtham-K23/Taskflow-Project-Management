import apiClient from './client';
import type { ApiResponse } from '../types/common.types';
import type { Sprint, CreateSprintPayload, UpdateSprintPayload, SprintStatus } from '../types/sprint.types';

export const sprintApi = {
  create: (workspaceId: number, projectId: number, payload: CreateSprintPayload) =>
    apiClient.post<ApiResponse<Sprint>>(`/workspaces/${workspaceId}/projects/${projectId}/sprints`, payload),

  getAll: (workspaceId: number, projectId: number) =>
    apiClient.get<ApiResponse<Sprint[]>>(`/workspaces/${workspaceId}/projects/${projectId}/sprints`),

  getById: (workspaceId: number, projectId: number, sprintId: number) =>
    apiClient.get<ApiResponse<Sprint>>(`/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}`),

  update: (workspaceId: number, projectId: number, sprintId: number, payload: UpdateSprintPayload) =>
    apiClient.put<ApiResponse<Sprint>>(
      `/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}`,
      payload
    ),

  updateStatus: (workspaceId: number, projectId: number, sprintId: number, status: SprintStatus) =>
    apiClient.patch<ApiResponse<Sprint>>(
      `/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/status?status=${status}`
    ),
};