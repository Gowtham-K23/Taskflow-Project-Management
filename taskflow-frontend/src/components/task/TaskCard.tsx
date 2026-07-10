import { Calendar, MessageSquare, Paperclip } from 'lucide-react';
import { format, isPast } from 'date-fns';
import { clsx } from 'clsx';
import { PriorityBadge } from '../shared/PriorityBadge';
import { Avatar } from '../ui/Avatar';
import type { Task } from '../../types/task.types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, taskId: number) => void;
}

export function TaskCard({ task, onClick, onDragStart }: TaskCardProps) {
  const isOverdue = task.overdue;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onClick={onClick}
      className="card-surface-interactive cursor-grab active:cursor-grabbing p-4 animate-fade-in"
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-surface-800 dark:text-surface-100 line-clamp-2">
          {task.title}
        </h4>
      </div>

      {task.labels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.labels.map((label) => (
            <span
              key={label}
              className="rounded-full bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 text-[10px] font-medium text-brand-600 dark:text-brand-400"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        {task.assignedToName && <Avatar name={task.assignedToName} size="xs" />}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-surface-100 dark:border-surface-800 pt-2.5">
        {task.dueDate ? (
          <div
            className={clsx(
              'flex items-center gap-1 text-xs font-medium',
              isOverdue ? 'text-danger-500' : 'text-surface-400'
            )}
          >
            <Calendar className="h-3 w-3" />
            {format(new Date(task.dueDate), 'MMM d')}
          </div>
        ) : (
          <span />
        )}

        <div className="flex items-center gap-2 text-surface-400">
          <Paperclip className="h-3 w-3" />
        </div>
      </div>
    </div>
  );
}