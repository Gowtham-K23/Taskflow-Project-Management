export interface Attachment {
  id: number;
  taskId: number;
  fileName: string;
  fileSize: number | null;
  contentType: string | null;
  uploadedByUserId: number;
  uploadedByName: string;
  uploadedAt: string;
  downloadUrl: string;
}