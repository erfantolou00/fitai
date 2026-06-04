import { cn } from '@/app/lib/utils/cn';
import { HTMLAttributes } from 'react';

type AlertVariant = 'info' | 'warning' | 'success' | 'danger';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  info: 'bg-info-light border-info/20 text-info-dark',
  warning: 'bg-accent-light border-accent/30 text-accent-dark',
  success: 'bg-primary-light/50 border-primary/20 text-primary-dark',
  danger: 'bg-danger-light border-danger/20 text-danger-dark',
};

export function Alert({
  variant = 'info',
  title,
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'p-4 rounded-xl border text-sm leading-relaxed',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {title && <p className="font-semibold m-0 mb-1">{title}</p>}
      <div>{children}</div>
    </div>
  );
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'outline';
}

export function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  const styles = {
    default: 'bg-surface-muted text-muted border-border',
    primary: 'bg-primary/10 text-primary border-primary/20',
    outline: 'bg-transparent text-muted border-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs border',
        styles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
