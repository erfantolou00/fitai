import { cn } from '@/app/lib/utils/cn';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'info' | 'warning' | 'danger';
  padding?: 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-surface border-border',
  success: 'bg-primary-light/30 border-primary/20',
  info: 'bg-info-light border-info/20',
  warning: 'bg-accent-light border-accent/30',
  danger: 'bg-danger-light border-danger/20',
};

const paddingStyles = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({
  className,
  variant = 'default',
  padding = 'md',
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border',
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base font-semibold text-foreground m-0', className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted m-0', className)} {...props}>
      {children}
    </p>
  );
}

export function StatBox({
  label,
  value,
  sub,
  className,
}: {
  label: string;
  value: string | number;
  sub?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'bg-surface rounded-lg p-3 border border-border/60',
        className
      )}
    >
      <p className="text-xs text-muted m-0">{label}</p>
      <p className="text-2xl font-semibold mt-1 mb-0">{value}</p>
      {sub && <p className="text-xs text-muted mt-0.5 mb-0">{sub}</p>}
    </div>
  );
}
