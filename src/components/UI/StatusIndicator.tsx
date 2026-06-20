import { clsx } from 'clsx';

interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'danger' | 'neutral';
  label?: string;
  className?: string;
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const colors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    neutral: 'bg-slate-400',
  };

  return (
    <div className={clsx('flex items-center gap-1.5', className)}>
      <span
        className={clsx(
          'h-2 w-2 rounded-full',
          colors[status],
          status !== 'neutral' && 'animate-pulse'
        )}
      />
      {label && <span className="text-xs text-slate-600">{label}</span>}
    </div>
  );
}
