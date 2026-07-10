import apiClient from './client';
import type { ApiResponse } from '../types/common.types';
import type {
  Task,
  CreateTaskPayload,
  UpdateTaskPayload,
  AssignTaskPayload,
  UpdateTaskStatusPayload,
} from '../types/task.types';

const base = (workspaceId: number, projectId: number, sprintId: number) =>
  `/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprintId}/tasks`;

export const taskApi = {
  create: (workspaceId: number, projectId: number, sprintId: number, payload: CreateTaskPayload) =>
    apiClient.post<ApiResponse<Task>>(base(workspaceId, projectId, sprintId), payload),

  getAll: (workspaceId: number, projectId: number, sprintId: number) =>
    apiClient.get<ApiResponse<Task[]>>(base(workspaceId, projectId, sprintId)),

  getById: (workspaceId: number, projectId: number, sprintId: number, taskId: number) =>
    apiClient.get<ApiResponse<Task>>(`${base(workspaceId, projectId, sprintId)}/${taskId}`),

  update: (workspaceId: number, projectId: number, sprintId: number, taskId: number, payload: UpdateTaskPayload) =>
    apiClient.put<ApiResponse<Task>>(`${base(workspaceId, projectId, sprintId)}/${taskId}`, payload),

  assign: (workspaceId: number, projectId: number, sprintId: number, taskId: number, payload: AssignTaskPayload) =>
    apiClient.patch<ApiResponse<Task>>(`${base(workspaceId, projectId, sprintId)}/${taskId}/assign`, payload),

  updateStatus: (
    workspaceId: number,
    projectId: number,
    sprintId: number,
    taskId: number,
    payload: UpdateTaskStatusPayload
  ) => apiClient.patch<ApiResponse<Task>>(`${base(workspaceId, projectId, sprintId)}/${taskId}/status`, payload),

  delete: (workspaceId: number, projectId: number, sprintId: number, taskId: number) =>
    apiClient.delete<ApiResponse<void>>(`${base(workspaceId, projectId, sprintId)}/${taskId}`),

  getMyTasks: (workspaceId: number) =>
    apiClient.get<ApiResponse<Task[]>>(`/workspaces/${workspaceId}/my-tasks`),
};