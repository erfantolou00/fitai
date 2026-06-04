import { cn } from '@/app/lib/utils/cn';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, id, ...props }, ref) => {
    const inputId = id ?? label?.replace(/\s/g, '-');

    return (
      <label className="block text-sm text-foreground">
        {label && <span className="block mb-1.5">{label}</span>}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full px-3 py-2.5 rounded-lg text-[15px]',
            'bg-surface border border-border-strong',
            'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
            'placeholder:text-muted-light transition-colors',
            className
          )}
          {...props}
        />
      </label>
    );
  }
);

Input.displayName = 'Input';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  InputHTMLAttributes<HTMLTextAreaElement> & { label?: string }
>(({ className, label, id, ...props }, ref) => {
  const inputId = id ?? label?.replace(/\s/g, '-');

  return (
    <label className="block text-sm text-foreground">
      {label && <span className="block mb-1.5">{label}</span>}
      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          'block w-full px-3 py-2.5 rounded-lg text-[15px] min-h-[80px] resize-y',
          'bg-surface border border-border-strong',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          'placeholder:text-muted-light transition-colors',
          className
        )}
        {...props}
      />
    </label>
  );
});

Textarea.displayName = 'Textarea';
