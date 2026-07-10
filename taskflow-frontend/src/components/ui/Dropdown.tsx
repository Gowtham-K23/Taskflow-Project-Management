import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 6,
        left: align === 'right' ? rect.right + window.scrollX : rect.left + window.scrollX,
      });
    }
    setIsOpen((v) => !v);
  };

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    window.addEventListener('click', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('click', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [isOpen]);

  return (
    <>
      <div ref={triggerRef} onClick={(e) => { e.stopPropagation(); toggle(); }}>
        {trigger}
      </div>

      {isOpen &&
        createPortal(
          <div
            className="fixed z-50 min-w-[180px] animate-scale-in rounded-xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 p-1.5 shadow-[var(--shadow-floating)]"
            style={{
              top: position.top,
              left: align === 'right' ? undefined : position.left,
              right: align === 'right' ? window.innerWidth - position.left : undefined,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item, i) => (
              <button
                key={i}
                onClick={() => {
                  item.onClick();
                  setIsOpen(false);
                }}
                className={clsx(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors',
                  item.danger
                    ? 'text-danger-500 hover:bg-danger-500/10'
                    : 'text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800'
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}