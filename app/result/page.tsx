'use client';

import { PageShell, SectionTitle } from '@/app/components/layout/page-shell';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Card, CardTitle, StatBox } from '@/app/components/ui/card';
import { loadResult } from '@/app/lib/storage';
import { cn } from '@/app/lib/utils/cn';
import { AIResult, DEFAULT_ANALYSIS } from '@/app/types/user';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planId = searchParams.get('id');

  const [result, setResult] = useState<AIResult | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fromCloud, setFromCloud] = useState(false);

  useEffect(() => {
    setTimeout(() => setMounted(true), 0);

    async function load() {
      try {
        if (planId) {
          const res = await fetch(`/api/plans/${planId}`);
          if (res.ok) {
            const data = await res.json();
            setResult(data.result);
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

  if (!mounted) return null;

  if (error) {
    return (
      <PageShell showBack title="خطا">
        <div className="text-center py-16">
          <Alert variant="danger" className="mb-6 inline-block text-right">
            {error}
          </Alert>
          <br />
          <Button onClick={() => router.push('/onboarding')}>
            دوباره امتحان کن
          </Button>
        </div>
      </PageShell>
    );
  }

  if (!result) {
    return (
      <PageShell title="بارگذاری">
        <div className="text-center py-16 text-muted">در حال بارگذاری...</div>
      </PageShell>
    );
  }

  const { analysis, program, nutrition } = result;
  const hasProgram = program?.weeklyPlan?.length > 0;

  return (
    <PageShell showBack title="برنامه شخصی">
      <SectionTitle
        title="برنامه شخصی تو"
        subtitle={
          fromCloud
            ? 'از حساب کاربریت بارگذاری شد'
            : 'بر اساس اطلاعاتی که دادی ساخته شده'
        }
      />

      {!fromCloud && (
        <Alert variant="info" className="mb-4">
          <Link href="/login?mode=register" className="text-info-dark underline">
            ثبت‌نام کن
          </Link>{' '}
          یا{' '}
          <Link href="/login" className="text-info-dark underline">
            وارد شو
          </Link>{' '}
          تا برنامه‌ات ذخیره بشه.
        </Alert>
      )}

      <Card variant="success" className="mb-6">
        <CardTitle className="text-primary-dark mb-4">آنالیز بدنی</CardTitle>
        <div className="grid grid-cols-2 gap-3">
          <StatBox
            label="BMI"
            value={analysis?.bmi ? Number(analysis.bmi).toFixed(1) : '—'}
            sub={analysis?.bmiStatus}
          />
          <StatBox
            label="دوره پیشنهادی"
            value={analysis?.recommendedPhase ?? '—'}
            sub={analysis?.timeEstimate}
          />
        </div>
        {analysis?.importantNote && (
          <Alert variant="warning" className="mt-4 mb-0">
            {analysis.importantNote}
          </Alert>
        )}
      </Card>

      <SectionTitle title="برنامه هفتگی" />

      {!hasProgram && (
        <Alert variant="danger" className="mb-4">
          برنامه تمرینی دریافت نشد. لطفاً دوباره امتحان کنید.
        </Alert>
      )}

      <div className="flex flex-col gap-3 mb-8">
        {program?.weeklyPlan?.map((day, i) => (
          <Card
            key={i}
            padding="sm"
            variant={day.isRest ? 'default' : 'info'}
            className={cn('overflow-hidden p-0', day.isRest && 'opacity-80')}
          >
            <div
              className={cn(
                'px-4 py-3 flex justify-between items-center',
                !day.isRest && 'border-b border-info/15'
              )}
            >
              <span className="font-semibold text-[15px]">{day.day}</span>
              {day.isRest ? (
                <span className="text-xs text-muted">استراحت 😴</span>
              ) : (
                <span className="text-xs text-info-dark">
                  {day.muscleGroups?.join(' · ')}
                </span>
              )}
            </div>
            {!day.isRest &&
              day.exercises?.map((ex, j) => (
                <div
                  key={j}
                  className={cn(
                    'px-4 py-2.5',
                    j < (day.exercises?.length ?? 0) - 1 &&
                      'border-b border-info/10'
                  )}
                >
                  <div className="flex justify-between items-start gap-3">
                    <span className="text-sm font-medium">{ex.name}</span>
                    <span className="text-xs text-muted shrink-0">
                      {ex.sets} ست × {ex.reps}
                    </span>
                  </div>
                  {ex.homeAlternative && (
                    <p className="text-xs text-muted mt-1 mb-0">
                      جایگزین خانگی: {ex.homeAlternative}
                    </p>
                  )}
                  {ex.notes && (
                    <p className="text-[11px] text-muted-light mt-0.5 mb-0">
                      {ex.notes}
                    </p>
                  )}
                </div>
              ))}
          </Card>
        ))}
      </div>

      {nutrition && (
        <>
          <SectionTitle title="برنامه تغذیه" />
          <Card variant="success" className="mb-6">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatBox
                label="کالری روزانه"
                value={nutrition.dailyCalories}
                sub="کیلوکالری"
              />
              <StatBox
                label="ماکروها"
                value={`${nutrition.macros?.protein}g پروتئین`}
                sub={`${nutrition.macros?.carbs}g کرب · ${nutrition.macros?.fat}g چربی`}
              />
            </div>

            <div className="flex flex-col gap-3">
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
                    {meal.calories} kcal — P:{meal.protein} C:{meal.carbs} F:
                    {meal.fat}
                  </p>
                </div>
              ))}
            </div>

            {nutrition.tips?.length > 0 && (
              <Alert variant="info" className="mt-4 mb-0">
                <ul className="m-0 pr-4">
                  {nutrition.tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {nutrition.hydration && (
              <p className="text-xs text-muted mt-3 mb-0">
                💧 {nutrition.hydration}
              </p>
            )}
          </Card>
        </>
      )}

      <Card variant="warning" className="text-center">
        <p className="font-semibold m-0 mb-2">این یک نمونه دموست</p>
        <p className="text-sm text-muted m-0 mb-4">
          با اشتراک کامل: آموزش تصویری حرکات، برنامه تغذیه پیشرفته، و پیگیری
          پیشرفت
        </p>
        <div className="flex gap-2 justify-center flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/onboarding')}
          >
            برنامه جدید
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push('/plans')}
          >
            برنامه‌های من
          </Button>
          <Button size="sm" onClick={() => router.push('/pricing')}>
            مشاهده پلن‌ها
          </Button>
        </div>
      </Card>
    </PageShell>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={null}>
      <ResultContent />
    </Suspense>
  );
}
