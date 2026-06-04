'use client';

import { useAuth } from '@/app/components/auth/auth-provider';
import { Button } from '@/app/components/ui/button';
import { usernameToDisplay } from '@/app/lib/auth/username';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function AuthNav() {
  const { user, profile, loading, signOut } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="w-16 h-8 bg-surface-muted rounded-lg animate-pulse" />;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/plans"
          className="text-xs text-muted hover:text-primary no-underline transition-colors"
        >
          {profile?.full_name ||
            (profile?.username
              ? usernameToDisplay(profile.username)
              : 'برنامه‌های من')}
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs py-1.5 px-3"
          onClick={async () => {
            await signOut();
            router.refresh();
          }}
        >
          خروج
        </Button>
      </div>
    );
  }

  return (
    <Link href="/login" className="no-underline">
      <Button variant="outline" size="sm" className="text-xs py-1.5 px-3">
        ورود
      </Button>
    </Link>
  );
}
