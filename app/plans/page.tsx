'use client';

import { useAuth } from '@/app/components/auth/auth-provider';
import { PageShell, SectionTitle } from '@/app/components/layout/page-shell';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface PlanSummary {
  id: string;
  title: string | null;
  createdAt: string;
  hasNutrition: boolean;
  phase?: string;
}

export default function PlansPage() {
  const { profile, refreshAuth } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/plans');

    if (res.status === 401) {
      router.replace('/login?redirect=/plans');
      return;
    }

    if (!res.ok) {
      setError('خطا در بارگذاری برنامه‌ها');
      setLoading(false);
      return;
    }

    const data = await res.json();
    setPlans(data.plans ?? []);
    await refreshAuth();
    setLoading(false);
  }, [router, refreshAuth]);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  if (loading) {
    return (
      <PageShell title="برنامه‌های من">
        <div className="text-center py-16 text-muted">در حال بارگذاری...</div>
      </PageShell>
    );
  }

  return (
    <PageShell title="برنامه‌های من" maxWidth="md">
      <SectionTitle
        title={`سلام${profile?.full_name ? ` ${profile.full_name.split(' ')[0]}` : ''}!`}
        subtitle="برنامه‌های ذخیره‌شده‌ات"
      />

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {plans.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-muted m-0 mb-4">هنوز برنامه‌ای ذخیره نکردی</p>
          <Button onClick={() => router.push('/onboarding')}>
            ساخت اولین برنامه
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              padding="md"
              className="cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => router.push(`/result?id=${plan.id}`)}
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-semibold m-0 text-[15px]">
                    {plan.title ?? 'برنامه تمرینی'}
                  </p>
                  <p className="text-xs text-muted mt-1 mb-0">
                    {new Date(plan.createdAt).toLocaleDateString('fa-IR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {plan.phase && (
                    <span className="text-xs bg-primary-light text-primary-dark px-2 py-0.5 rounded-full">
                      {plan.phase}
                    </span>
                  )}
                  {plan.hasNutrition && (
                    <span className="text-[11px] text-muted">+ تغذیه</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 flex gap-2">
        <Button variant="secondary" fullWidth onClick={() => router.push('/dashboard')}>
          داشبورد
        </Button>
        <Button fullWidth onClick={() => router.push('/onboarding')}>
          برنامه جدید
        </Button>
      </div>
    </PageShell>
  );
}
