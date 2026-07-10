import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: ReactNode;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export function Modal({ isOpen, onClose, title, description, size = 'md', children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-surface-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div
        className={clsx(
          'relative w-full rounded-2xl bg-white dark:bg-surface-900',
          'border border-surface-200 dark:border-surface-800',
          'shadow-[var(--shadow-floating)] animate-scale-in',
          sizeStyles[size]
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-surface-100 dark:border-surface-800 px-6 py-4">
            <div>
              {title && (
                <h2 className="font-display text-lg font-semibold text-surface-900 dark:text-surface-50">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{description}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-surface-400 hover:bg-surface-100 hover:text-surface-600 dark:hover:bg-surface-800 dark:hover:text-surface-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body
  );
}