import apiClient from './client';
import type { ApiResponse } from '../types/common.types';
import type { Project, CreateProjectPayload, UpdateProjectPayload } from '../types/project.types';

export const projectApi = {
  create: (workspaceId: number, payload: CreateProjectPayload) =>
    apiClient.post<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects`, payload),

  getAll: (workspaceId: number) =>
    apiClient.get<ApiResponse<Project[]>>(`/workspaces/${workspaceId}/projects`),

  getById: (workspaceId: number, projectId: number) =>
    apiClient.get<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects/${projectId}`),

  update: (workspaceId: number, projectId: number, payload: UpdateProjectPayload) =>
    apiClient.put<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects/${projectId}`, payload),

  complete: (workspaceId: number, projectId: number) =>
    apiClient.patch<ApiResponse<Project>>(`/workspaces/${workspaceId}/projects/${projectId}/complete`),

  archive: (workspaceId: number, projectId: number) =>
    apiClient.delete<ApiResponse<void>>(`/workspaces/${workspaceId}/projects/${projectId}`),
};