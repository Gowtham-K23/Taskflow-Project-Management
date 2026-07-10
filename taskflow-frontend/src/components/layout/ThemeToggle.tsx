import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/themeStore';
import { clsx } from 'clsx';

export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className={clsx(
        'relative flex h-9 w-16 items-center rounded-full p-1 transition-colors duration-300',
        isDark ? 'bg-surface-800' : 'bg-brand-100'
      )}
    >
      <span
        className={clsx(
          'flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-surface-900 shadow-[var(--shadow-soft)]',
          'transition-transform duration-300 ease-[var(--ease-snappy)]',
          isDark ? 'translate-x-7' : 'translate-x-0'
        )}
      >
        {isDark ? (
          <Moon className="h-3.5 w-3.5 text-brand-400" />
        ) : (
          <Sun className="h-3.5 w-3.5 text-accent-500" />
        )}
      </span>
    </button>
  );
}