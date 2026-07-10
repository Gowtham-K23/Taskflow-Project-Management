import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  LayoutGrid,
  ChevronsUpDown,
  CheckSquare,
  Plus,
  X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Dropdown } from '../ui/Dropdown';
import { CreateWorkspaceModal } from '../workspace/CreateWorkspaceModal';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
  { to: '/members', label: 'Team', icon: Users, pmOnly: true },
];

export function Sidebar() {
  const { workspaces, activeWorkspace, setActiveWorkspace } =
    useWorkspaceStore();
  const user = useAuthStore((s) => s.user);
  const { isMobileSidebarOpen, closeMobileSidebar } = useUIStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const location = useLocation();

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  const visibleNavItems = navItems.filter(
    (item) => !item.pmOnly || user?.role === 'PROJECT_MANAGER'
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-surface-950/50 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={closeMobileSidebar}
        />
      )}

      <aside
        className={clsx(
          'flex h-screen w-64 shrink-0 flex-col border-r border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900',
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-[var(--ease-snappy)] lg:static lg:translate-x-0',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between gap-2.5 px-5 border-b border-surface-100 dark:border-surface-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700">
              <LayoutGrid className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-base font-bold text-surface-900 dark:text-surface-50">
              TaskFlow
            </span>
          </div>

          <button
            onClick={closeMobileSidebar}
            className="lg:hidden text-surface-400 hover:text-surface-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Workspace switcher */}
        <div className="border-b border-surface-100 px-3 py-3 dark:border-surface-800">
          <Dropdown
            align="left"
            trigger={
              <button className="flex w-full items-center justify-between rounded-lg border border-surface-200 px-3 py-2.5 text-left transition-colors hover:bg-surface-50 dark:border-surface-800 dark:hover:bg-surface-800/60">
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-surface-400">
                    Workspace
                  </p>
                  <p className="truncate text-sm font-semibold text-surface-800 dark:text-surface-100">
                    {activeWorkspace?.name ?? 'Select workspace'}
                  </p>
                </div>
                <ChevronsUpDown className="h-4 w-4 shrink-0 text-surface-400" />
              </button>
            }
            items={[
              ...workspaces.map((ws) => ({
                label: ws.name,
                onClick: () => setActiveWorkspace(ws),
              })),
              {
                label: 'Create new workspace',
                icon: <Plus className="h-4 w-4" />,
                onClick: () => setIsCreateModalOpen(true),
              },
            ]}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }: { isActive: boolean }) =>
                  clsx(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-100'
                  )
                }
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    <Icon
                      className={clsx(
                        'h-4.5 w-4.5',
                        isActive && 'text-brand-600 dark:text-brand-400'
                      )}
                    />
                    {item.label}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Settings pinned at bottom */}
        <div className="border-t border-surface-100 p-3 dark:border-surface-800">
          <NavLink
            to="/settings"
            className={({ isActive }: { isActive: boolean }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'text-surface-600 hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800'
              )
            }
          >
            <Settings className="h-4.5 w-4.5" />
            Settings
          </NavLink>
        </div>

        <CreateWorkspaceModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </aside>
    </>
  );
}