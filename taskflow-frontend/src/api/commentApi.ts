import apiClient from './client';
import type { ApiResponse } from '../types/common.types';
import type { Comment, CreateCommentPayload } from '../types/comment.types';

export const commentApi = {
  getByTask: (workspaceId: number, taskId: number) =>
    apiClient.get<ApiResponse<Comment[]>>(`/workspaces/${workspaceId}/tasks/${taskId}/comments`),

  create: (workspaceId: number, taskId: number, payload: CreateCommentPayload) =>
    apiClient.post<ApiResponse<Comment>>(`/workspaces/${workspaceId}/tasks/${taskId}/comments`, payload),

  delete: (workspaceId: number, taskId: number, commentId: number) =>
    apiClient.delete<ApiResponse<void>>(`/workspaces/${workspaceId}/tasks/${taskId}/comments/${commentId}`),
};