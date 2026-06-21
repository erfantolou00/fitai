'use client';

import { SectionTitle } from '@/app/components/layout/page-shell';
import { Alert } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { useAuth } from '@/app/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface PlanSummary {
  id: string;
  title: string | null;
  createdAt: string;
  hasNutrition: boolean;
  phase?: string;
  isDefault?: boolean;
}

interface Entitlements {
  canCreatePlan: boolean;
  canCreateFreePlan: boolean;
  planCount: number;
}

export default function PlansPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<PlanSummary[]>([]);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [plansRes, entRes] = await Promise.all([
      fetch('/api/plans'),
      fetch('/api/entitlements'),
    ]);

    if (!plansRes.ok) {
      setError('خطا در بارگذاری برنامه‌ها');
      setLoading(false);
      return;
    }

    const plansData = await plansRes.json();
    setPlans(plansData.plans ?? []);

    if (entRes.ok) {
      setEntitlements(await entRes.json());
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadPlans().catch(() => {
      setError('خطا در بارگذاری برنامه‌ها');
      setLoading(false);
    });
  }, [loadPlans]);

  const handleNewPlan = () => {
    if (entitlements && !entitlements.canCreatePlan) {
      router.push(`/checkout?product=new_plan&return=${encodeURIComponent('/onboarding')}`);
      return;
    }
    router.push('/onboarding');
  };

  if (loading) {
    return <div className="text-center py-16 text-muted">در حال بارگذاری...</div>;
  }

  return (
    <>
      <SectionTitle
        title={`سلام${profile?.full_name ? ` ${profile.full_name.split(' ')[0]}` : ''}!`}
        subtitle="برنامه‌های ذخیره‌شده‌ات"
      />

      {entitlements && !entitlements.canCreateFreePlan && entitlements.planCount > 0 && (
        <Alert variant="info" className="mb-4">
          {entitlements.canCreatePlan
            ? `${entitlements.planCount} برنامه داری — یک اعتبار پولی برای برنامه جدید`
            : 'برنامه اول رایگان بود. برای برنامه جدید پرداخت لازم است.'}
        </Alert>
      )}

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {plans.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-muted m-0 mb-4">هنوز برنامه‌ای ذخیره نکردی</p>
          <Button onClick={handleNewPlan}>ساخت اولین برنامه (رایگان)</Button>
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
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold m-0 text-[15px]">
                      {plan.title ?? 'برنامه تمرینی'}
                    </p>
                    {plan.isDefault && (
                      <Badge variant="primary" className="text-[10px] py-0">
                        اصلی
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted m-0">
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

      <div className="mt-8">
        <Button fullWidth onClick={handleNewPlan}>
          {entitlements?.canCreatePlan && !entitlements.canCreateFreePlan
            ? 'برنامه جدید (پولی)'
            : 'برنامه جدید'}
        </Button>
      </div>
    </>
  );
}
