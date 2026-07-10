import apiClient from './client';
import type { ApiResponse } from '../types/common.types';
import type {
  DashboardSummary,
  ProjectOverview,
  TeamPerformance,
  DelayedTask,
} from '../types/dashboard.types';

export const dashboardApi = {
  getSummary: (workspaceId: number) =>
    apiClient.get<ApiResponse<DashboardSummary>>(`/workspaces/${workspaceId}/dashboard/summary`),

  getProjectOverview: (workspaceId: number, projectId: number) =>
    apiClient.get<ApiResponse<ProjectOverview>>(
      `/workspaces/${workspaceId}/dashboard/projects/${projectId}/overview`
    ),

  getTeamPerformance: (workspaceId: number) =>
    apiClient.get<ApiResponse<TeamPerformance[]>>(`/workspaces/${workspaceId}/dashboard/team-performance`),

  getDelayedTasks: (workspaceId: number) =>
    apiClient.get<ApiResponse<DelayedTask[]>>(`/workspaces/${workspaceId}/dashboard/delayed-tasks`),
};