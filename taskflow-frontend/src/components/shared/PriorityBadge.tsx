import { ArrowDown, ArrowUp, Equal, Flame } from 'lucide-react';
import type { Priority } from '../../types/task.types';
import { clsx } from 'clsx';

const priorityConfig: Record<Priority, { label: string; className: string; icon: typeof ArrowUp }> = {
  LOW: { label: 'Low', className: 'text-surface-500 bg-surface-100 dark:bg-surface-800 dark:text-surface-400', icon: ArrowDown },
  MEDIUM: { label: 'Medium', className: 'text-info-600 bg-info-500/10 dark:text-info-400', icon: Equal },
  HIGH: { label: 'High', className: 'text-warning-600 bg-warning-500/10 dark:text-warning-400', icon: ArrowUp },
  URGENT: { label: 'Urgent', className: 'text-danger-600 bg-danger-500/10 dark:text-danger-400', icon: Flame },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = priorityConfig[priority];
  const Icon = config.icon;
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        config.className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}