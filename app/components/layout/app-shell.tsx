'use client';

import { useAuth } from '@/app/components/auth/auth-provider';
import { AppTabBar } from '@/app/components/layout/app-tab-bar';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/lib/utils/cn';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

export function AppShell({ children }: { children: ReactNode }) {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between gap-4">
          <Link href="/home" className="text-lg font-bold no-underline text-foreground shrink-0">
            فیتار<span className="text-primary">.</span>
          </Link>

          <div className="hidden md:flex flex-1 justify-center">
            <AppTabBar variant="top" />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted hidden sm:inline max-w-[100px] truncate">
              {profile?.full_name?.split(' ')[0] ?? 'ورزشکار'}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs py-1.5 px-3"
              onClick={async () => {
                await signOut();
                window.location.href = '/';
              }}
            >
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main
        className={cn(
          'flex-1 mx-auto w-full max-w-5xl px-4 py-6',
          'pb-24 md:pb-8'
        )}
      >
        {children}
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-border bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)]">
        <AppTabBar variant="bottom" />
      </nav>
    </div>
  );
}
