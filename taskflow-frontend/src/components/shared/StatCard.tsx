import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: 'brand' | 'success' | 'warning' | 'danger';
  trend?: string;
}

const colorStyles = {
  brand: 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400',
  success: 'bg-success-500/10 text-success-600 dark:text-success-400',
  warning: 'bg-warning-500/10 text-warning-600 dark:text-warning-400',
  danger: 'bg-danger-500/10 text-danger-600 dark:text-danger-400',
};

export function StatCard({ label, value, icon, color = 'brand', trend }: StatCardProps) {
  return (
    <div className="card-surface p-5 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-surface-500 dark:text-surface-400">{label}</p>
          <p className="mt-2 font-display text-2xl font-bold text-surface-900 dark:text-surface-50">
            {value}
          </p>
          {trend && <p className="mt-1 text-xs text-surface-400">{trend}</p>}
        </div>
        <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', colorStyles[color])}>
          {icon}
        </div>
      </div>
    </div>
  );
}