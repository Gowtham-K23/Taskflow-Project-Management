export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'DUE_DATE_APPROACHING'
  | 'INVITATION_RECEIVED';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  referenceType: string | null;
  referenceId: number | null;
  isRead: boolean;
  createdAt: string;
}