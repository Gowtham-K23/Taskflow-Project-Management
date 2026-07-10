import { useNavigate } from 'react-router-dom';
import { Calendar, Target } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../ui/Badge';
import type { Sprint } from '../../types/sprint.types';

const statusConfig = {
  PLANNED: { label: 'Planned', color: 'neutral' as const },
  ACTIVE: { label: 'Active', color: 'info' as const },
  COMPLETED: { label: 'Completed', color: 'success' as const },
};

interface SprintCardProps {
  sprint: Sprint;
  workspaceId: number;
  projectId: number;
}

export function SprintCard({ sprint, workspaceId, projectId }: SprintCardProps) {
  const navigate = useNavigate();
  const config = statusConfig[sprint.status];

  return (
    <div
      className="card-surface-interactive p-5 animate-fade-in"
      onClick={() => navigate(`/workspaces/${workspaceId}/projects/${projectId}/sprints/${sprint.id}`)}
    >
      <div className="flex items-start justify-between">
        <h3 className="font-display text-base font-semibold text-surface-900 dark:text-surface-50">
          {sprint.name}
        </h3>
        <Badge color={config.color} dot>{config.label}</Badge>
      </div>

      {sprint.goal && (
        <div className="mt-2 flex items-start gap-1.5 text-sm text-surface-500 dark:text-surface-400">
          <Target className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <p className="line-clamp-2">{sprint.goal}</p>
        </div>
      )}

      {(sprint.startDate || sprint.endDate) && (
        <div className="mt-3 flex items-center gap-1.5 border-t border-surface-100 dark:border-surface-800 pt-3 text-xs text-surface-400">
          <Calendar className="h-3.5 w-3.5" />
          {sprint.startDate ? format(new Date(sprint.startDate), 'MMM d') : '—'}
          {' → '}
          {sprint.endDate ? format(new Date(sprint.endDate), 'MMM d, yyyy') : '—'}
        </div>
      )}
    </div>
  );
}