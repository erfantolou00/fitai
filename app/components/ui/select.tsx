import { cn } from '@/app/lib/utils/cn';

interface SelectChipProps<T extends string | number | boolean> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SelectChip<T extends string | number | boolean>({
  options,
  value,
  onChange,
  className,
}: SelectChipProps<T>) {
  return (
    <div className={cn('flex gap-2 flex-wrap', className)}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 min-w-[60px] py-2.5 px-3 rounded-lg text-sm font-medium transition-all',
              'border cursor-pointer',
              selected
                ? 'border-primary bg-primary-light text-primary-dark border-2'
                : 'border-border-strong bg-surface text-foreground hover:border-primary/40'
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

interface SelectCardProps<T extends string> {
  options: { value: T; label: string; desc?: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function SelectCard<T extends string>({
  options,
  value,
  onChange,
  className,
}: SelectCardProps<T>) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              'p-3.5 rounded-xl text-right transition-all border cursor-pointer',
              selected
                ? 'border-primary bg-primary-light border-2'
                : 'border-border-strong bg-surface hover:border-primary/30'
            )}
          >
            <div
              className={cn(
                'font-medium text-[15px]',
                selected ? 'text-primary-dark' : 'text-foreground'
              )}
            >
              {opt.label}
            </div>
            {opt.desc && (
              <div className="text-xs text-muted mt-1 leading-relaxed">
                {opt.desc}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
