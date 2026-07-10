import { Badge } from '../ui/Badge';
import type { TaskStatus } from '../../types/task.types';

const statusConfig: Record<TaskStatus, { label: string; color: 'neutral' | 'info' | 'warning' | 'success' }> = {
  TODO: { label: 'To Do', color: 'neutral' },
  IN_PROGRESS: { label: 'In Progress', color: 'info' },
  REVIEW: { label: 'Review', color: 'warning' },
  DONE: { label: 'Done', color: 'success' },
};

export function StatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status];
  return (
    <Badge color={config.color} dot>
      {config.label}
    </Badge>
  );
}