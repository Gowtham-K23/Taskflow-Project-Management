export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: number;
  sprintId: number;
  projectId: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null; // ISO date string, e.g. "2026-07-15"
  estimatedHours: number | null;

  assignedToUserId: number | null;
  assignedToName: string | null;

  createdById: number;
  createdByName: string;

  labels: string[];

  createdAt: string;
  updatedAt: string;
  completedAt: string | null;

  overdue: boolean;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  estimatedHours?: number;
  assignedToUserId?: number;
  labels?: string[];
}

export interface UpdateTaskPayload {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  estimatedHours?: number;
  labels?: string[];
}

export interface AssignTaskPayload {
  userId: number;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
}