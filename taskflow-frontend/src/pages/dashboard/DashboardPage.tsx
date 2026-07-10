import { useEffect, useState } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { dashboardApi } from '../../api/dashboardApi';
import type { DashboardSummary } from '../../types/dashboard.types';
import { StatCard } from '../../components/shared/StatCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Avatar } from '../../components/ui/Avatar';

export default function DashboardPage() {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    dashboardApi
      .getSummary(activeWorkspace.id)
      .then((res) => setSummary(res.data.data))
      .finally(() => setIsLoading(false));
  }, [activeWorkspace]);

  if (!activeWorkspace) {
    return (
      <EmptyState
        icon={<FolderKanban className="h-6 w-6" />}
        title="No workspace selected"
        description="Create or select a workspace to get started"
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-surface-50">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
          Overview of {activeWorkspace.name}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Active Projects"
              value={summary.activeProjects}
              icon={<FolderKanban className="h-5 w-5" />}
              color="brand"
              trend={`${summary.totalProjects} total`}
            />
            <StatCard
              label="Pending Tasks"
              value={summary.pendingTasks}
              icon={<Clock className="h-5 w-5" />}
              color="warning"
            />
            <StatCard
              label="Completed Tasks"
              value={summary.completedTasks}
              icon={<CheckCircle2 className="h-5 w-5" />}
              color="success"
              trend={`${summary.totalTasks} total`}
            />
            <StatCard
              label="Delayed Tasks"
              value={summary.delayedTasks}
              icon={<AlertTriangle className="h-5 w-5" />}
              color="danger"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Active sprints */}
            <div className="card-surface p-5">
              <h2 className="mb-4 font-display text-base font-semibold text-surface-900 dark:text-surface-50">
                Active Sprints
              </h2>
              {summary.activeSprints.length === 0 ? (
                <p className="py-8 text-center text-sm text-surface-400">No active sprints right now</p>
              ) : (
                <div className="space-y-4">
                  {summary.activeSprints.map((sprint) => (
                    <div key={sprint.sprintId}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <p className="text-sm font-medium text-surface-700 dark:text-surface-200">
                          {sprint.sprintName}
                        </p>
                        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                          {sprint.completionPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600 transition-all duration-500"
                          style={{ width: `${sprint.completionPercentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-surface-400">
                        {sprint.completedTasks} of {sprint.totalTasks} tasks done
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Team performance */}
            <div className="card-surface p-5">
              <div className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-500" />
                <h2 className="font-display text-base font-semibold text-surface-900 dark:text-surface-50">
                  Team Performance
                </h2>
              </div>
              {summary.teamPerformance.length === 0 ? (
                <p className="py-8 text-center text-sm text-surface-400">No team members yet</p>
              ) : (
                <div className="space-y-3">
                  {summary.teamPerformance.map((member) => (
                    <div key={member.userId} className="flex items-center gap-3">
                      <Avatar name={member.userName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-medium text-surface-700 dark:text-surface-200">
                            {member.userName}
                          </p>
                          <span className="text-xs font-semibold text-surface-500 dark:text-surface-400">
                            {member.completionRate.toFixed(0)}%
                          </span>
                        </div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface-100 dark:bg-surface-800">
                          <div
                            className="h-full rounded-full bg-success-500 transition-all duration-500"
                            style={{ width: `${member.completionRate}%` }}
                          />
                        </div>
                      </div>
                      {member.delayedTasks > 0 && (
                        <span className="flex items-center gap-1 rounded-full bg-danger-500/10 px-2 py-0.5 text-[11px] font-medium text-danger-500">
                          {member.delayedTasks} late
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}