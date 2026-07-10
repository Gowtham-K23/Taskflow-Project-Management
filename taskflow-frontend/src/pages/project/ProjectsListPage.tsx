import { useEffect, useState } from 'react';
import { Plus, FolderKanban } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';
import { projectApi } from '../../api/projectApi';
import type { Project } from '../../types/project.types';
import { ProjectCard } from '../../components/project/ProjectCard';
import { CreateProjectModal } from '../../components/project/CreateProjectModal';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';

export default function ProjectsListPage() {
  const activeWorkspace = useWorkspaceStore((s) => s.activeWorkspace);
  const user = useAuthStore((s) => s.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isPM = user?.role === 'PROJECT_MANAGER';

  useEffect(() => {
    if (!activeWorkspace) return;
    setIsLoading(true);
    projectApi
      .getAll(activeWorkspace.id)
      .then((res) => setProjects(res.data.data))
      .finally(() => setIsLoading(false));
  }, [activeWorkspace]);

  if (!activeWorkspace) return null;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900 dark:text-surface-50">
            Projects
          </h1>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {activeWorkspace.name}
          </p>
        </div>
        {isPM && (
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
            New Project
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-6 w-6" />}
          title="No projects yet"
          description={isPM ? "Create your first project to start organizing sprints and tasks" : "Your project manager hasn't created any projects yet"}
          action={isPM && (
            <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
              Create Project
            </Button>
          )}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspaceId={activeWorkspace.id}
        onCreated={(project) => setProjects((prev) => [project, ...prev])}
      />
    </div>
  );
}