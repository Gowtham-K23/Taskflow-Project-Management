import type { TaskStatus, Priority } from './task.types';
import type { SprintStatus } from './sprint.types';

export interface DashboardSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;

  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  delayedTasks: number;

  teamPerformance: TeamPerformance[];
  activeSprints: SprintProgress[];
}

export interface ProjectOverview {
  projectId: number;
  projectName: string;
  totalTasks: number;
  todoCount: number;
  inProgressCount: number;
  reviewCount: number;
  doneCount: number;
  delayedCount: number;
  completionPercentage: number;
}

export interface SprintProgress {
  sprintId: number;
  sprintName: string;
  status: SprintStatus;
  startDate: string | null;
  endDate: string | null;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

export interface TeamPerformance {
  userId: number;
  userName: string;
  assignedTasks: number;
  completedTasks: number;
  pendingTasks: number;
  delayedTasks: number;
  completionRate: number;
}

export interface DelayedTask {
  taskId: number;
  title: string;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  daysOverdue: number;
  assignedToName: string;
  sprintName: string;
}