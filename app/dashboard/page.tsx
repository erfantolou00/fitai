'use client';

import { useAuth } from '@/app/components/auth/auth-provider';
import { PageShell, SectionTitle } from '@/app/components/layout/page-shell';
import { Alert } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Card, CardTitle, StatBox } from '@/app/components/ui/card';
import { GOAL_LABELS } from '@/app/lib/constants/labels';
import { cn } from '@/app/lib/utils/cn';
import { Goal } from '@/app/types/user';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface DashboardData {
  profile: { full_name: string | null; onboarding_completed: boolean } | null;
  fitness: {
    age: number;
    currentWeight: number;
    targetWeight: number;
    daysPerWeek: number;
    minutesPerSession: number;
    goal: string;
    labels: { goal: string; level: string; location: string };
  } | null;
  stats: {
    planCount: number;
    bmi: number | null;
    bmiStatus: string | null;
    phase: string | null;
    timeEstimate: string | null;
    weightDiff: number | null;
    dailyCalories: number | null;
  };
  latestPlan: {
    id: string;
    title: string | null;
    createdAt: string;
    importantNote: string | null;
    hasNutrition: boolean;
  } | null;
  tips: {
    food: { icon: string; title: string; text: string };
    workout: { icon: string; title: string; text: string };
  };
}

export default function DashboardPage() {
  const { refreshAuth } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/dashboard');

    if (res.status === 401) {
      router.replace('/login?redirect=/dashboard');
      return;
    }

    if (!res.ok) {
      setError('خطا در بارگذاری داشبورد');
      setLoading(false);
      return;
    }

    const json = await res.json();
    setData(json);
    await refreshAuth();
    setLoading(false);
  }, [router, refreshAuth]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await loadDashboard();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('خطا در بارگذاری داشبورد');
      } finally {
        setLoading(false);
      }
    };
    fetchData().catch(console.error);
  }, [loadDashboard]);

  if (loading) {
    return (
      <PageShell title="داشبورد">
        <div className="text-center py-16 text-muted">در حال بارگذاری...</div>
      </PageShell>
    );
  }

  if (error || !data) {
    return (
      <PageShell title="داشبورد">
        <Alert variant="danger">{error ?? 'خطا'}</Alert>
      </PageShell>
    );
  }

  const firstName = data.profile?.full_name?.split(' ')[0] ?? 'ورزشکار';
  const { stats, fitness, latestPlan, tips } = data;

  return (
    <PageShell title="داشبورد" maxWidth="lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold m-0">
          سلام {firstName} 👋
        </h1>
        <p className="text-sm text-muted mt-1 mb-0">
          {fitness
            ? `هدف: ${fitness.labels.goal} · ${fitness.daysPerWeek} روز در هفته`
            : 'هنوز پروفایل ورزشی نساختی'}
        </p>
      </div>

      {!fitness && (
        <Alert variant="warning" className="mb-6">
          برای دریافت آنالیز شخصی،{' '}
          <button
            type="button"
            className="underline bg-transparent border-none cursor-pointer text-accent-dark font-medium p-0"
            onClick={() => router.push('/onboarding')}
          >
            اولین برنامه‌ات
          </button>{' '}
          را بساز.
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatBox
          label="BMI"
          value={stats.bmi ? Number(stats.bmi).toFixed(1) : '—'}
          sub={stats.bmiStatus ?? undefined}
        />
        <StatBox
          label="دوره"
          value={stats.phase ?? '—'}
          sub={stats.timeEstimate ?? undefined}
        />
        <StatBox
          label="برنامه‌ها"
          value={stats.planCount}
          sub="ذخیره‌شده"
        />
        <StatBox
          label="کالری روزانه"
          value={stats.dailyCalories ?? '—'}
          sub={stats.dailyCalories ? 'kcal' : 'بدون تغذیه'}
        />
      </div>

      {fitness && (
        <Card className="mb-6">
          <CardTitle className="mb-4">پروفایل ورزشی</CardTitle>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted">وزن فعلی</span>
              <p className="font-semibold m-0 mt-0.5">{fitness.currentWeight} kg</p>
            </div>
            <div>
              <span className="text-muted">وزن هدف</span>
              <p className="font-semibold m-0 mt-0.5">{fitness.targetWeight} kg</p>
            </div>
            <div>
              <span className="text-muted">سطح</span>
              <p className="font-semibold m-0 mt-0.5">{fitness.labels.level}</p>
            </div>
            <div>
              <span className="text-muted">محل تمرین</span>
              <p className="font-semibold m-0 mt-0.5">{fitness.labels.location}</p>
            </div>
            <div>
              <span className="text-muted">هر جلسه</span>
              <p className="font-semibold m-0 mt-0.5">{fitness.minutesPerSession} دقیقه</p>
            </div>
            <div>
              <span className="text-muted">فاصله تا هدف</span>
              <p className="font-semibold m-0 mt-0.5">
                {stats.weightDiff != null
                  ? `${Math.abs(stats.weightDiff).toFixed(1)} kg ${stats.weightDiff < 0 ? 'کاهش' : 'افزایش'}`
                  : '—'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {latestPlan && (
        <Card variant="success" className="mb-6">
          <div className="flex justify-between items-start gap-3 mb-3">
            <CardTitle className="text-primary-dark">آخرین برنامه</CardTitle>
            <Badge variant="primary">
              {GOAL_LABELS[fitness?.goal as Goal]?.label ?? 'شخصی'}
            </Badge>
          </div>
          <p className="text-sm font-medium m-0">{latestPlan.title}</p>
          <p className="text-xs text-muted mt-1 mb-0">
            {new Date(latestPlan.createdAt).toLocaleDateString('fa-IR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
            {latestPlan.hasNutrition && ' · شامل تغذیه'}
          </p>
          {latestPlan.importantNote && (
            <Alert variant="warning" className="mt-3 mb-0 text-xs">
              {latestPlan.importantNote}
            </Alert>
          )}
          <Button
            size="sm"
            className="mt-4"
            onClick={() => router.push(`/result?id=${latestPlan.id}`)}
          >
            مشاهده برنامه کامل
          </Button>
        </Card>
      )}

      <SectionTitle title="دانستنی امروز" />

      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <TipCard
          emoji={tips.food.icon}
          category="تغذیه"
          title={tips.food.title}
          text={tips.food.text}
          variant="success"
        />
        <TipCard
          emoji={tips.workout.icon}
          category="تمرین"
          title={tips.workout.title}
          text={tips.workout.text}
          variant="info"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Button fullWidth onClick={() => router.push('/onboarding')}>
          برنامه جدید
        </Button>
        <Button variant="secondary" fullWidth onClick={() => router.push('/plans')}>
          همه برنامه‌ها
        </Button>
      </div>
    </PageShell>
  );
}

function TipCard({
  emoji,
  category,
  title,
  text,
  variant,
}: {
  emoji: string;
  category: string;
  title: string;
  text: string;
  variant: 'success' | 'info';
}) {
  return (
    <Card variant={variant} padding="md">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{emoji}</span>
        <span className="text-xs text-muted uppercase tracking-wide">{category}</span>
      </div>
      <p className={cn('font-semibold text-sm m-0 mb-1', variant === 'success' ? 'text-primary-dark' : 'text-info-dark')}>
        {title}
      </p>
      <p className="text-sm text-muted m-0 leading-relaxed">{text}</p>
    </Card>
  );
}
