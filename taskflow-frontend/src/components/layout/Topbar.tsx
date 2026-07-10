import { useEffect, useState } from 'react';
import { Bell, LogOut, User as UserIcon, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { Avatar } from '../ui/Avatar';
import { ThemeToggle } from './ThemeToggle';
import { Dropdown } from '../ui/Dropdown';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { notificationApi } from '../../api/notificationApi';
import type { Notification } from '../../types/notification.types';

export function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const toggleMobileSidebar = useUIStore((s) => s.toggleMobileSidebar);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const loadNotifications = async () => {
    try {
      const [listRes, countRes] = await Promise.all([
        notificationApi.getAll(),
        notificationApi.getUnreadCount(),
      ]);

      setNotifications(listRes.data.data.slice(0, 8));
      setUnreadCount(countRes.data.data.count);
    } catch {
      // Silent fail — notifications aren't critical path
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead();
    loadNotifications();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-200 bg-white/80 px-6 backdrop-blur-xl dark:border-surface-800 dark:bg-surface-900/80">
      {/* Mobile hamburger */}
      <button
        onClick={toggleMobileSidebar}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        {/* Notification bell */}
        <div className="relative">
          <button
            onClick={() => setIsPanelOpen((v) => !v)}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg text-surface-500 transition-colors hover:bg-surface-100 dark:text-surface-400 dark:hover:bg-surface-800"
          >
            <Bell className="h-4.5 w-4.5" />

            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger-500 text-[10px] font-bold text-white animate-pulse-glow">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isPanelOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsPanelOpen(false)}
              />

              <div className="absolute right-0 top-11 z-50 w-80 animate-scale-in rounded-xl border border-surface-200 bg-white shadow-[var(--shadow-floating)] dark:border-surface-800 dark:bg-surface-900">
                <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3 dark:border-surface-800">
                  <p className="text-sm font-semibold text-surface-800 dark:text-surface-100">
                    Notifications
                  </p>

                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="px-4 py-8 text-center text-sm text-surface-400">
                      No notifications yet
                    </p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={clsx(
                          'border-b border-surface-50 px-4 py-3 last:border-0 dark:border-surface-800/60',
                          !n.isRead && 'bg-brand-50/50 dark:bg-brand-500/5'
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {!n.isRead && (
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                          )}

                          <div className={clsx(!n.isRead ? '' : 'pl-3.5')}>
                            <p className="text-sm font-medium text-surface-800 dark:text-surface-100">
                              {n.title}
                            </p>

                            <p className="mt-0.5 text-xs text-surface-500 dark:text-surface-400">
                              {n.message}
                            </p>

                            <p className="mt-1 text-[11px] text-surface-400">
                              {formatDistanceToNow(new Date(n.createdAt), {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User menu */}
        <Dropdown
          align="right"
          trigger={
            <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800">
              <Avatar name={user?.name ?? '?'} size="sm" />

              <div className="hidden text-left sm:block">
                <p className="text-sm font-medium text-surface-800 dark:text-surface-100">
                  {user?.name}
                </p>

                <p className="text-xs capitalize text-surface-400">
                  {user?.role.toLowerCase().replace('_', ' ')}
                </p>
              </div>
            </button>
          }
          items={[
            {
              label: 'Profile',
              icon: <UserIcon className="h-4 w-4" />,
              onClick: () => navigate('/settings'),
            },
            {
              label: 'Log out',
              icon: <LogOut className="h-4 w-4" />,
              onClick: handleLogout,
              danger: true,
            },
          ]}
        />
      </div>
    </header>
  );
}