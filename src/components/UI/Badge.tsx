import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 bg-opacity-100 text-emerald-700',
    warning: 'bg-amber-50 bg-opacity-100 text-amber-700',
    danger: 'bg-rose-50 bg-opacity-100 text-rose-700',
    info: 'bg-sky-50 bg-opacity-100 text-sky-700',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
