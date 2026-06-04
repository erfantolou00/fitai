'use client';

import { cn } from '@/app/lib/utils/cn';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

interface PageShellProps {
  children: ReactNode;
  variant?: 'light' | 'dark';
  maxWidth?: 'sm' | 'md' | 'lg';
  showHeader?: boolean;
  showBack?: boolean;
  title?: string;
  className?: string;
}

const maxWidthMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function PageShell({
  children,
  variant = 'light',
  maxWidth = 'md',
  showHeader = true,
  showBack = false,
  title,
  className,
}: PageShellProps) {
  const router = useRouter();
  const isDark = variant === 'dark';

  return (
    <div
      className={cn(
        'min-h-screen flex flex-col',
        isDark ? 'dark bg-background text-foreground' : 'bg-background',
        className
      )}
    >
      {showHeader && (
        <header
          className={cn(
            'sticky top-0 z-50 border-b backdrop-blur-md',
            isDark
              ? 'border-white/5 bg-background/80'
              : 'border-border bg-background/90'
          )}
        >
          <div
            className={cn(
              'mx-auto px-4 h-14 flex items-center justify-between',
              maxWidthMap[maxWidth]
            )}
          >
            <div className="flex items-center gap-3">
              {showBack && (
                <button
                  type="button"
                  onClick={() => router.back()}
                  className={cn(
                    'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                    isDark
                      ? 'hover:bg-white/5 text-muted'
                      : 'hover:bg-surface-muted text-muted'
                  )}
                  aria-label="بازگشت"
                >
                  →
                </button>
              )}
              <Link href="/" className="flex items-center gap-2 no-underline">
                <span
                  className={cn(
                    'text-lg font-bold tracking-tight',
                    isDark ? 'text-white' : 'text-foreground'
                  )}
                >
                  فیتار
                  <span className="text-primary">.</span>
                </span>
              </Link>
            </div>
            {title && (
              <span className="text-sm text-muted font-medium">{title}</span>
            )}
          </div>
        </header>
      )}

      <main
        className={cn(
          'flex-1 mx-auto w-full px-4 py-8',
          maxWidthMap[maxWidth]
        )}
      >
        {children}
      </main>
    </div>
  );
}

export function StepProgress({
  steps,
  currentStep,
}: {
  steps: readonly string[];
  currentStep: number;
}) {
  const progress =
    steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all',
              i <= currentStep
                ? 'bg-primary text-white'
                : 'bg-surface-muted text-muted border border-border'
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>
      <div className="h-1 bg-surface-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted">
        مرحله {currentStep + 1} از {steps.length} — {steps[currentStep]}
      </p>
    </div>
  );
}

export function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="text-center px-6">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <p className="text-sm text-muted">{message ?? 'در حال پردازش...'}</p>
      </div>
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-semibold m-0">{title}</h2>
      {subtitle && (
        <p className="text-sm text-muted mt-1 mb-0">{subtitle}</p>
      )}
    </div>
  );
}
