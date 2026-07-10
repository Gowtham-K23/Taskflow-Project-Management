import type { HTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';

type BadgeColor = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: BadgeColor;
  dot?: boolean;
  children: ReactNode;
}

const colorStyles: Record<BadgeColor, string> = {
  brand: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  success: 'bg-success-500/10 text-success-600 dark:text-success-400',
  warning: 'bg-warning-500/10 text-warning-600 dark:text-warning-400',
  danger: 'bg-danger-500/10 text-danger-600 dark:text-danger-400',
  info: 'bg-info-500/10 text-info-500 dark:text-info-400',
  neutral: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-300',
};

const dotColorStyles: Record<BadgeColor, string> = {
  brand: 'bg-brand-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  info: 'bg-info-500',
  neutral: 'bg-surface-400',
};

export function Badge({ color = 'neutral', dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        colorStyles[color],
        className
      )}
      {...props}
    >
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full', dotColorStyles[color])} />}
      {children}
    </span>
  );
}