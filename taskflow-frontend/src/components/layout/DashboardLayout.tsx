import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader2, LayoutGrid, Plus } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { workspaceApi } from '../../api/workspaceApi';
import { Button } from '../ui/Button';
import { CreateWorkspaceModal } from '../workspace/CreateWorkspaceModal';

export function DashboardLayout() {
  const { workspaces, setWorkspaces } = useWorkspaceStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const loadWorkspaces = async () => {
      try {
        const res = await workspaceApi.getAll();
        setWorkspaces(res.data.data);
      } finally {
        setIsLoading(false);
      }
    };
    loadWorkspaces();
  }, [setWorkspaces]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-50 dark:bg-surface-950">
        <Loader2 className="h-6 w-6 animate-spin text-brand-500" />
      </div>
    );
  }

  if (workspaces.length === 0) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-surface-50 dark:bg-surface-950 px-4">
        <div className="w-full max-w-md text-center animate-fade-in">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 shadow-[var(--shadow-glow-brand)]">
            <LayoutGrid className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-xl font-bold text-surface-900 dark:text-surface-50">
            Create your first workspace
          </h1>
          <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
            A workspace is where your team's projects, sprints, and tasks come together.
          </p>
          <Button className="mt-6" size="lg" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setIsCreateModalOpen(true)}>
            Create Workspace
          </Button>
        </div>

        <CreateWorkspaceModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}