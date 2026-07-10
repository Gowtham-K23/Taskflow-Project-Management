import { create } from 'zustand';
import type { Workspace } from '../types/workspace.types';

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setActiveWorkspace: (workspace: Workspace) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,

  setWorkspaces: (workspaces) => {
    const currentActiveId = get().activeWorkspace?.id;
    const stillExists = workspaces.find((w) => w.id === currentActiveId);

    set({
      workspaces,
      activeWorkspace: stillExists ?? workspaces[0] ?? null,
    });
  },

  setActiveWorkspace: (workspace) => {
    localStorage.setItem('taskflow-active-workspace-id', String(workspace.id));
    set({ activeWorkspace: workspace });
  },
}));