export type SprintStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED';

export interface Sprint {
  id: number;
  projectId: number;
  name: string;
  goal: string | null;
  startDate: string | null;
  endDate: string | null;
  status: SprintStatus;
  createdById: number;
  createdByName: string;
  createdAt: string;
}

export interface CreateSprintPayload {
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}

export interface UpdateSprintPayload {
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
}