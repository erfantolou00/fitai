import { Card, CardDescription, CardTitle } from '@/app/components/ui/card';
import { cn } from '@/app/lib/utils/cn';

interface ComingSoonProps {
  title: string;
  description?: string;
  className?: string;
}

export function ComingSoon({ title, description, className }: ComingSoonProps) {
  return (
    <Card className={cn('border-dashed', className)} padding="md">
      <div className="flex items-start gap-3">
        <span className="text-xl opacity-50">🚧</span>
        <div>
          <CardTitle className="text-sm">{title}</CardTitle>
          {description && (
            <CardDescription className="mt-1">{description}</CardDescription>
          )}
          <span className="inline-block mt-2 text-[11px] font-medium text-accent-dark bg-accent-light px-2 py-0.5 rounded-full">
            در حال توسعه
          </span>
        </div>
      </div>
    </Card>
  );
}
