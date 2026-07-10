import type { Role } from './auth.types';

export interface Workspace {
  id: number;
  name: string;
  createdById: number;
  createdByName: string;
  createdAt: string;
}

export interface CreateWorkspacePayload {
  name: string;
}

export interface WorkspaceMember {
  userId: number;
  name: string;
  email: string;
  role: Role;
}

export interface AddMemberPayload {
  email: string;
  role: Role;
}
