import { clsx } from 'clsx';
import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className, children, ...props }, ref) => {
    const variants: Record<Variant, string> = {
      primary:
        'bg-sky-600 text-white hover:bg-sky-700 focus-visible:outline-sky-600',
      secondary:
        'bg-slate-100 text-slate-900 hover:bg-slate-200 focus-visible:outline-slate-500',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus-visible:outline-rose-600',
      ghost:
        'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:outline-slate-500',
    };

    const sizes: Record<Size, string> = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-9 px-4 text-sm',
      lg: 'h-11 px-6 text-sm',
    };

    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
