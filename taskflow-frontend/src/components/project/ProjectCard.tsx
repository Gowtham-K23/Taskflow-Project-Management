import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Archive, Calendar } from 'lucide-react';
import { Badge } from '../ui/Badge';
import type { Project } from '../../types/project.types';
import { format } from 'date-fns';

const statusConfig = {
  ACTIVE: { label: 'Active', color: 'info' as const },
  COMPLETED: { label: 'Completed', color: 'success' as const },
  ARCHIVED: { label: 'Archived', color: 'neutral' as const },
};

export function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();
  const config = statusConfig[project.status];

  return (
    <div
      className="card-surface-interactive p-5 animate-fade-in"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
          {project.status === 'COMPLETED' ? (
            <CheckCircle2 className="h-5 w-5 text-success-500" />
          ) : project.status === 'ARCHIVED' ? (
            <Archive className="h-5 w-5 text-surface-400" />
          ) : (
            <span className="font-display text-sm font-bold text-brand-600 dark:text-brand-400">
              {project.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <Badge color={config.color} dot>{config.label}</Badge>
      </div>

      <h3 className="mt-3 font-display text-base font-semibold text-surface-900 dark:text-surface-50 line-clamp-1">
        {project.name}
      </h3>
      <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 line-clamp-2 min-h-[2.5rem]">
        {project.description || 'No description provided'}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-surface-100 dark:border-surface-800 pt-3">
        <div className="flex items-center gap-1.5 text-xs text-surface-400">
          <Calendar className="h-3.5 w-3.5" />
          {format(new Date(project.createdAt), 'MMM d, yyyy')}
        </div>
        <p className="text-xs text-surface-400">by {project.createdByName}</p>
      </div>
    </div>
  );
}