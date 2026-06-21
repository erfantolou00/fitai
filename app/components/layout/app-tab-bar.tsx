'use client';

import { cn } from '@/app/lib/utils/cn';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  {
    href: '/home',
    label: 'خانه',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9.5z" />
      </svg>
    ),
  },
  {
    href: '/plans',
    label: 'برنامه‌ها',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: '/exercises',
    label: 'حرکات',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 6.5h11M4 12h16M6.5 17.5h11" />
        <circle cx="4" cy="6.5" r="2" fill="currentColor" stroke="none" />
        <circle cx="20" cy="6.5" r="2" fill="currentColor" stroke="none" />
        <circle cx="4" cy="17.5" r="2" fill="currentColor" stroke="none" />
        <circle cx="20" cy="17.5" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    href: '/nutrition',
    label: 'تغذیه',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C9 3 7 5.5 7 8.5c0 3 2 5.5 5 11 3-5.5 5-8 5-11C17 5.5 15 3 12 3z" />
      </svg>
    ),
  },
  {
    href: '/profile',
    label: 'پروفایل',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface AppTabBarProps {
  variant: 'top' | 'bottom';
}

export function AppTabBar({ variant }: AppTabBarProps) {
  const pathname = usePathname();

  if (variant === 'top') {
    return (
      <nav className="flex items-center gap-1">
        {TABS.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium no-underline transition-colors',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:text-foreground hover:bg-surface-muted'
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex items-stretch justify-around px-1 pt-1 pb-1">
      {TABS.map(({ href, label, icon }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-col items-center gap-0.5 py-2 px-2 min-w-0 flex-1 no-underline transition-colors',
              active ? 'text-primary' : 'text-muted'
            )}
          >
            {icon(active)}
            <span className={cn('text-[10px] font-medium truncate', active && 'font-semibold')}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
