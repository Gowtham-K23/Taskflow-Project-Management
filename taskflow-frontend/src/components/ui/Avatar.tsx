import { clsx } from 'clsx';

interface AvatarProps {
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

// Deterministic color from name, so the same person always gets the same color
const gradients = [
  'from-brand-400 to-brand-600',
  'from-accent-400 to-accent-600',
  'from-success-400 to-success-600',
  'from-info-400 to-info-500',
  'from-warning-400 to-warning-600',
];

function getGradient(name: string) {
  const index = name.charCodeAt(0) % gradients.length;
  return gradients[index];
}

function getInitials(name: string) {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  return (
    <div
      className={clsx(
        'flex items-center justify-center rounded-full font-semibold text-white shrink-0',
        'bg-gradient-to-br shadow-sm ring-2 ring-white dark:ring-surface-900',
        getGradient(name),
        sizeStyles[size],
        className
      )}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}