import { forwardRef, useState } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, hint, leftIcon, type = 'text', className, id, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-surface-700 dark:text-surface-300"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-400">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? 'text' : type}
            className={clsx(
              'h-11 w-full rounded-lg border bg-white dark:bg-surface-900',
              'px-3.5 text-sm text-surface-900 dark:text-surface-100',
              'placeholder:text-surface-400 dark:placeholder:text-surface-500',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500',
              'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-surface-50 dark:disabled:bg-surface-800/50',
              leftIcon && 'pl-10',
              isPassword && 'pr-10',
              error
                ? 'border-danger-400 focus:ring-danger-400/30 focus:border-danger-500'
                : 'border-surface-300 dark:border-surface-700 hover:border-surface-400 dark:hover:border-surface-600',
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 transition-colors hover:text-surface-600 dark:hover:text-surface-300"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {error && (
          <p className="mt-1.5 animate-fade-in text-xs font-medium text-danger-500">
            {error}
          </p>
        )}

        {!error && hint && (
          <p className="mt-1.5 text-xs text-surface-500 dark:text-surface-400">
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';