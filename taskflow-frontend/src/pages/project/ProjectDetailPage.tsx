import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CheckCircle2, Layers, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';
import { projectApi } from '../../api/projectApi';
import { sprintApi } from '../../api/sprintApi';
import { dashboardApi } from '../../api/dashboardApi';
import type { Project } from '../../types/project.types';
import type { Sprint } from '../../types/sprint.types';
import type { ProjectOverview } from '../../types/dashboard.types';
import { SprintCard } from '../../components/sprint/SprintCard';
import { CreateSprintModal } from '../../components/sprint/CreateSprintModal';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dropdown } from '../../components/ui/Dropdown';
import { ProgressRing } from '../../components/shared/ProgressRing';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export default function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const user = useAuthStore((s) => s.user);
  const isPM = user?.role === 'PROJECT_MANAGER';

  const [project, setProject] = useState<Project | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [overview, setOverview] = useState<ProjectOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!activeWorkspace || !projectId) return;
    const wsId = activeWorkspace.id;
    const pId = Number(projectId);

    setIsLoading(true);
    Promise.all([
      projectApi.getById(wsId, pId),
      sprintApi.getAll(wsId, pId),
      dashboardApi.getProjectOverview(wsId, pId),
    ])
      .then(([projectRes, sprintsRes, overviewRes]) => {
        setProject(projectRes.data.data);
        setSprints(sprintsRes.data.data);
        setOverview(overviewRes.data.data);
      })
      .finally(() => setIsLoading(false));
  }, [activeWorkspace, projectId]);

  const handleCompleteProject = async () => {
    if (!activeWorkspace || !project) return;
    try {
      const res = await projectApi.complete(activeWorkspace.id, project.id);
      setProject(res.data.data);
      toast.success('Project marked as completed!');
    } catch {
      toast.error('Failed to complete project');
    }
  };

  const handleArchiveProject = async () => {
    if (!activeWorkspace || !project) return;
    try {
      await projectApi.archive(activeWorkspace.id, project.id);
      toast.success('Project archived');
      navigate('/projects');
    } catch {
      toast.error('Failed to archive project');
    }
  };

  if (!activeWorkspace) return null;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-24 shimmer-bg rounded-xl" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="animate-fade-in space-y-6">
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-sm font-medium text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </button>

      {/* Project header card */}
      <div className="card-surface p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            {overview && <ProgressRing percentage={overview.completionPercentage} />}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold text-surface-900 dark:text-surface-50">
                  {project.name}
                </h1>
                <Badge color={project.status === 'COMPLETED' ? 'success' : project.status === 'ARCHIVED' ? 'neutral' : 'info'} dot>
                  {project.status}
                </Badge>
              </div>
              <p className="mt-1.5 max-w-xl text-sm text-surface-500 dark:text-surface-400">
                {project.description || 'No description provided'}
              </p>
              <p className="mt-2 text-xs text-surface-400">Created by {project.createdByName}</p>
            </div>
          </div>

          {isPM && project.status === 'ACTIVE' && (
            <Dropdown
              trigger={
                <button className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              }
              items={[
                { label: 'Mark as Completed', icon: <CheckCircle2 className="h-4 w-4" />, onClick: handleCompleteProject },
                { label: 'Archive Project', icon: <Layers className="h-4 w-4" />, onClick: handleArchiveProject, danger: true },
              ]}
            />
          )}
        </div>

        {overview && (
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-surface-100 dark:border-surface-800 pt-5 sm:grid-cols-5">
            <MiniStat label="To Do" value={overview.todoCount} />
            <MiniStat label="In Progress" value={overview.inProgressCount} />
            <MiniStat label="Review" value={overview.reviewCount} />
            <MiniStat label="Done" value={overview.doneCount} accent="success" />
            <MiniStat label="Delayed" value={overview.delayedCount} accent="danger" />
          </div>
        )}
      </div>

      {/* Sprints */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-surface-900 dark:text-surface-50">
          Sprints
        </h2>
        {isPM && (
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
            New Sprint
          </Button>
        )}
      </div>

      {sprints.length === 0 ? (
        <EmptyState
          icon={<Layers className="h-6 w-6" />}
          title="No sprints yet"
          description={isPM ? 'Create a sprint to start organizing tasks' : 'No sprints have been created for this project yet'}
          action={isPM && (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
              Create Sprint
            </Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sprints.map((sprint) => (
            <SprintCard
              key={sprint.id}
              sprint={sprint}
              workspaceId={activeWorkspace.id}
              projectId={project.id}
            />
          ))}
        </div>
      )}

      <CreateSprintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceId={activeWorkspace.id}
        projectId={project.id}
        onCreated={(sprint) => setSprints((prev) => [sprint, ...prev])}
      />
    </div>
  );
}

function MiniStat({ label, value, accent }: { label: string; value: number; accent?: 'success' | 'danger' }) {
  return (
    <div>
      <p
        className={
          accent === 'success'
            ? 'font-display text-lg font-bold text-success-600 dark:text-success-400'
            : accent === 'danger'
            ? 'font-display text-lg font-bold text-danger-500'
            : 'font-display text-lg font-bold text-surface-800 dark:text-surface-100'
        }
      >
        {value}
      </p>
      <p className="text-xs text-surface-400">{label}</p>
    </div>
  );
}