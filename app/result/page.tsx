'use client';

import { PageShell, SectionTitle } from '@/app/components/layout/page-shell';
import { Alert } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Card, CardTitle, StatBox } from '@/app/components/ui/card';
import { loadResult } from '@/app/lib/storage';
import { cn } from '@/app/lib/utils/cn';
import { AIResult, DEFAULT_ANALYSIS } from '@/app/types/user';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface PlanMeta {
  id: string;
  title: string | null;
  createdAt: string;
  isDefault: boolean;
}

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('id');

  const [result, setResult] = useState<AIResult | null>(null);
  const [meta, setMeta] = useState<PlanMeta | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCloud, setFromCloud] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);

    async function load() {
      try {
        if (planId) {
          const res = await fetch(`/api/plans/${planId}`);
          if (res.ok) {
            const data = await res.json();
            setResult(data.result);
            setMeta(data.meta);
            setIsDefault(data.meta?.isDefault ?? false);
            setFromCloud(true);
            return;
          }
        }

        const parsed = loadResult();
        if (!parsed) {
          router.push('/onboarding');
          return;
        }

        if (!parsed.analysis) parsed.analysis = { ...DEFAULT_ANALYSIS };
        if (!parsed.program) parsed.program = { weeklyPlan: [] };

        setResult(parsed);
      } catch {
        setError('خطا در خواندن نتیجه');
      }
    }

    load();
  }, [planId, router]);

  const handleSetDefault = async () => {
    if (!planId) return;
    setSettingDefault(true);
    try {
      const res = await fetch(`/api/plans/${planId}/default`, { method: 'POST' });
      if (res.ok) {
        setIsDefault(true);
      }
    } finally {
      setSettingDefault(false);
    }
  };

  if (!mounted) return null;

  if (error) {
    return (
      <div className="text-center py-16">
        <Alert variant="danger" className="mb-6 inline-block text-right">
          {error}
        </Alert>
        <br />
        <Button onClick={() => router.push('/onboarding')}>دوباره امتحان کن</Button>
      </div>
    );
  }

  if (!result) {
    return <div className="text-center py-16 text-muted">در حال بارگذاری...</div>;
  }

  const { analysis, program, nutrition } = result;
  const hasProgram = program?.weeklyPlan?.length > 0;
  const workoutDays = program?.weeklyPlan?.filter((d) => !d.isRest).length ?? 0;

  return (
    <>
      {/* Hero header */}
      <div className="relative mb-8 rounded-2xl overflow-hidden bg-linear-to-br from-primary/15 via-surface to-surface border border-primary/20 p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {isDefault && (
                <Badge variant="primary" className="text-xs">
                  ★ برنامه اصلی
                </Badge>
              )}
              {nutrition && (
                <Badge variant="outline" className="text-xs">
                  + تغذیه
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold m-0">
              {meta?.title ?? 'برنامه شخصی'}
            </h1>
            <p className="text-sm text-muted mt-1 mb-0">
              {meta?.createdAt
                ? new Date(meta.createdAt).toLocaleDateString('fa-IR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : fromCloud
                  ? 'از حساب کاربری'
                  : 'پیش‌نمایش محلی'}
            </p>
          </div>

          {fromCloud && planId && !isDefault && (
            <Button
              size="sm"
              variant="outline"
              disabled={settingDefault}
              onClick={handleSetDefault}
              className="shrink-0"
            >
              {settingDefault ? '...' : '★ تنظیم به‌عنوان برنامه اصلی'}
            </Button>
          )}
        </div>

        {hasProgram && (
          <div className="grid grid-cols-3 gap-3 mt-5">
            <StatBox label="روز تمرین" value={workoutDays} sub="در هفته" />
            <StatBox
              label="BMI"
              value={analysis?.bmi ? Number(analysis.bmi).toFixed(1) : '—'}
              sub={analysis?.bmiStatus}
            />
            <StatBox
              label="دوره"
              value={analysis?.recommendedPhase ?? '—'}
              sub={analysis?.timeEstimate}
            />
          </div>
        )}
      </div>

      {!fromCloud && (
        <Alert variant="info" className="mb-6">
          <Link href="/login?mode=register" className="text-info-dark underline">
            ثبت‌نام کن
          </Link>{' '}
          تا برنامه‌ات ذخیره بشه.
        </Alert>
      )}

      {analysis?.importantNote && (
        <Alert variant="warning" className="mb-6">
          {analysis.importantNote}
        </Alert>
      )}

      <SectionTitle title="برنامه هفتگی" subtitle="بر اساس بانک حرکات فیتار" />

      {!hasProgram && (
        <Alert variant="danger" className="mb-4">
          برنامه تمرینی دریافت نشد. لطفاً دوباره تلاش کنید.
        </Alert>
      )}

      <div className="flex flex-col gap-3 mb-8">
        {program?.weeklyPlan?.map((day, i) => (
          <Card
            key={i}
            padding="sm"
            className={cn(
              'overflow-hidden p-0',
              day.isRest ? 'opacity-70' : 'border-primary/20'
            )}
          >
            <div
              className={cn(
                'px-4 py-3 flex justify-between items-center',
                !day.isRest && 'bg-primary/5 border-b border-primary/10'
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-sm',
                    day.isRest
                      ? 'bg-surface-muted text-muted'
                      : 'bg-primary/15 text-primary-dark font-bold'
                  )}
                >
                  {day.isRest ? '😴' : i + 1}
                </span>
                <span className="font-semibold text-[15px]">{day.day}</span>
              </div>
              {day.isRest ? (
                <span className="text-xs text-muted">استراحت</span>
              ) : (
                <span className="text-xs text-primary-dark font-medium">
                  {day.muscleGroups?.join(' · ')}
                </span>
              )}
            </div>

            {!day.isRest &&
              day.exercises?.map((ex, j) => (
                <div
                  key={j}
                  className={cn(
                    'px-4 py-3 flex gap-3',
                    j < (day.exercises?.length ?? 0) - 1 && 'border-b border-border/50'
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-surface-muted flex items-center justify-center text-[11px] text-muted shrink-0 mt-0.5">
                    {j + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-sm font-medium">{ex.name}</span>
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0">
                        {ex.sets}×{ex.reps}
                      </span>
                    </div>
                    {ex.rest && (
                      <p className="text-[11px] text-muted mt-0.5 mb-0">
                        استراحت: {ex.rest}
                      </p>
                    )}
                    {ex.homeAlternative && (
                      <p className="text-xs text-muted mt-1 mb-0">
                        🏠 {ex.homeAlternative}
                      </p>
                    )}
                    {ex.notes && (
                      <p className="text-[11px] text-muted-light mt-0.5 mb-0">
                        {ex.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </Card>
        ))}
      </div>

      {nutrition && (
        <>
          <SectionTitle title="برنامه تغذیه" subtitle="بر اساس بانک غذای ایرانی" />
          <Card variant="success" className="mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <StatBox label="کالری" value={nutrition.dailyCalories} sub="kcal" />
              <StatBox label="پروتئین" value={`${nutrition.macros?.protein}g`} />
              <StatBox label="کرب" value={`${nutrition.macros?.carbs}g`} />
              <StatBox label="چربی" value={`${nutrition.macros?.fat}g`} />
            </div>

            <div className="flex flex-col gap-2">
              {nutrition.meals?.map((meal, i) => (
                <div
                  key={i}
                  className="bg-surface rounded-lg p-3 border border-border/60"
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-sm">{meal.name}</span>
                    <span className="text-xs text-muted">{meal.time}</span>
                  </div>
                  <p className="text-xs text-muted m-0 leading-relaxed">
                    {meal.foods?.join(' · ')}
                  </p>
                  <p className="text-[11px] text-primary-dark mt-1 mb-0">
                    {meal.calories} kcal
                  </p>
                </div>
              ))}
            </div>

            {nutrition.tips?.length > 0 && (
              <Alert variant="info" className="mt-4 mb-0 text-xs">
                {nutrition.tips[0]}
              </Alert>
            )}
          </Card>
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-2 sticky bottom-20 md:bottom-4 bg-background/95 backdrop-blur-sm py-3 -mx-1 px-1">
        <Button variant="secondary" fullWidth onClick={() => router.push('/plans')}>
          همه برنامه‌ها
        </Button>
        <Button fullWidth onClick={() => router.push('/onboarding')}>
          برنامه جدید
        </Button>
      </div>
    </>
  );
}

export default function ResultPage() {
  return (
    <PageShell showBack title="برنامه" maxWidth="lg">
      <Suspense fallback={<div className="text-center py-16 text-muted">در حال بارگذاری...</div>}>
        <ResultContent />
      </Suspense>
    </PageShell>
  );
}
