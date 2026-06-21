'use client';

import { cn } from '@/app/lib/utils/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled,
}: ToggleProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors',
        checked ? 'border-primary/40 bg-primary/5' : 'border-border bg-surface',
        disabled && 'opacity-60'
      )}
    >
      <div className="min-w-0">
        <p className="font-medium text-sm m-0">{label}</p>
        {description && (
          <p className="text-xs text-muted mt-1 mb-0 leading-relaxed">{description}</p>
        )}
      </div>
        <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative shrink-0 w-12 h-7 rounded-full transition-colors cursor-pointer border-none p-0',
          checked ? 'bg-primary' : 'bg-surface-muted',
          disabled && 'cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-all',
            checked ? 'right-0.5' : 'right-[calc(100%-1.625rem)]'
          )}
        />
      </button>
    </div>
  );
}
