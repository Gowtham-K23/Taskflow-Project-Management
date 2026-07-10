import apiClient from './client';
import type { ApiResponse } from '../types/common.types';
import type { Attachment } from '../types/attachment.types';

export const attachmentApi = {
  getByTask: (workspaceId: number, taskId: number) =>
    apiClient.get<ApiResponse<Attachment[]>>(`/workspaces/${workspaceId}/tasks/${taskId}/attachments`),

  upload: (workspaceId: number, taskId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<ApiResponse<Attachment>>(
      `/workspaces/${workspaceId}/tasks/${taskId}/attachments`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  download: (workspaceId: number, attachmentId: number) =>
    apiClient.get(`/workspaces/${workspaceId}/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    }),

  delete: (workspaceId: number, attachmentId: number) =>
    apiClient.delete<ApiResponse<void>>(`/workspaces/${workspaceId}/attachments/${attachmentId}`),
};