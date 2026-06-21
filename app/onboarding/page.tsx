'use client';

import {
  LoadingOverlay,
  PageShell,
  SectionTitle,
  StepProgress,
} from '@/app/components/layout/page-shell';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { SelectCard, SelectChip } from '@/app/components/ui/select';
import {
  GOAL_LABELS,
  LEVEL_LABELS,
  LOCATION_LABELS,
  ONBOARDING_STEPS,
} from '@/app/lib/constants/labels';
import { saveResult, savePendingProfile, loadPendingProfile, clearPendingProfile } from '@/app/lib/storage';
import { DEFAULT_PROFILE, UserProfile } from '@/app/types/user';
import { Toggle } from '@/app/components/ui/toggle';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Entitlements {
  planCount: number;
  canCreateFreePlan: boolean;
  canCreatePlan: boolean;
  canUseNutrition: boolean;
  isLoggedIn: boolean;
  nutritionPaid: boolean;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(() => loadPendingProfile() ?? DEFAULT_PROFILE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlements | null>(null);

  useEffect(() => {
    fetch('/api/entitlements')
      .then((r) => r.json())
      .then(setEntitlements)
      .catch(() => null);
  }, []);

  useEffect(() => {
    if (loadPendingProfile()) {
      setStep(ONBOARDING_STEPS.length - 1);
      clearPendingProfile();
    }
  }, []);

  const update = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) =>
    setProfile((prev) => ({ ...prev, [key]: value }));

  const next = () => setStep((s) => Math.min(s + 1, ONBOARDING_STEPS.length - 1));
  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === 'payment_required' && data.product) {
          savePendingProfile(profile);
          router.push(
            `/checkout?product=${data.product}&return=${encodeURIComponent('/onboarding')}`
          );
          return;
        }
        if (data.code === 'login_required') {
          savePendingProfile(profile);
          router.push(`/login?redirect=${encodeURIComponent('/onboarding')}`);
          return;
        }
        const hint =
          data.code === 'quota_exhausted'
            ? ' (مشکل از سمت سرور AI است، نه فرم شما)'
            : '';
        setError((data.error ?? `خطای سرور: ${res.status}`) + hint);
        return;
      }

      saveResult(data, profile);
      router.push(data.planId ? `/result?id=${data.planId}` : '/result');
    } catch {
      setError('خطایی رخ داد، دوباره تلاش کنید');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell showBack title="ساخت برنامه">
      {loading && (
        <LoadingOverlay message="AI در حال ساخت برنامه شخصی‌اته... (۵–۱۵ ثانیه)" />
      )}

      <StepProgress steps={ONBOARDING_STEPS} currentStep={step} />

      {error && (
        <Alert variant="danger" className="mb-6">
          {error}
        </Alert>
      )}

      {step === 0 && (
        <div className="flex flex-col gap-4">
          <SectionTitle title="اطلاعات پایه" />
          <div>
            <span className="block text-sm mb-1.5">جنسیت</span>
            <SelectChip
              options={[
                { value: 'male' as const, label: 'مرد' },
                { value: 'female' as const, label: 'زن' },
              ]}
              value={profile.gender}
              onChange={(v) => update('gender', v)}
            />
          </div>
          <Input
            label="سن (سال)"
            type="number"
            min={14}
            max={70}
            value={profile.age}
            onChange={(e) => update('age', Number(e.target.value))}
          />
          <Input
            label="قد (سانتی‌متر)"
            type="number"
            min={140}
            max={220}
            value={profile.height}
            onChange={(e) => update('height', Number(e.target.value))}
          />
          <Input
            label="وزن فعلی (کیلوگرم)"
            type="number"
            min={40}
            max={200}
            value={profile.currentWeight}
            onChange={(e) => update('currentWeight', Number(e.target.value))}
          />
          <Input
            label="وزن هدف (کیلوگرم)"
            type="number"
            min={40}
            max={200}
            value={profile.targetWeight}
            onChange={(e) => update('targetWeight', Number(e.target.value))}
          />
        </div>
      )}

      {step === 1 && (
        <div className="flex flex-col gap-4">
          <SectionTitle title="سطح و سابقه" />
          <SelectCard
            options={Object.entries(LEVEL_LABELS).map(([v, { label, desc }]) => ({
              value: v as UserProfile['fitnessLevel'],
              label,
              desc,
            }))}
            value={profile.fitnessLevel}
            onChange={(v) => update('fitnessLevel', v)}
          />
          <Input
            label="ماه‌های سابقه ورزش"
            type="number"
            min={0}
            max={120}
            value={profile.experienceMonths}
            onChange={(e) => update('experienceMonths', Number(e.target.value))}
          />
          <Input
            label="آسیب یا محدودیت جسمی (اختیاری)"
            placeholder="مثلاً: زانو درد، کمر درد — یا خالی بگذارید"
            value={profile.injuries}
            onChange={(e) => update('injuries', e.target.value)}
          />
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-4">
          <SectionTitle
            title="هدف اصلی"
            subtitle="مهم‌ترین هدفت از ورزش الان چیه؟"
          />
          <SelectCard
            options={Object.entries(GOAL_LABELS).map(([v, { label, desc }]) => ({
              value: v as UserProfile['goal'],
              label,
              desc,
            }))}
            value={profile.goal}
            onChange={(v) => update('goal', v)}
          />
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-4">
          <SectionTitle title="تجهیزات و زمان" />
          <div>
            <span className="block text-sm mb-1.5">کجا تمرین می‌کنی؟</span>
            <SelectChip
              options={Object.entries(LOCATION_LABELS).map(([v, label]) => ({
                value: v as UserProfile['location'],
                label,
              }))}
              value={profile.location}
              onChange={(v) => update('location', v)}
            />
          </div>
          <div>
            <span className="block text-sm mb-1.5">چند روز در هفته؟</span>
            <SelectChip
              options={[3, 4, 5, 6].map((d) => ({ value: d, label: String(d) }))}
              value={profile.daysPerWeek}
              onChange={(v) => update('daysPerWeek', v)}
            />
          </div>
          <div>
            <span className="block text-sm mb-1.5">هر جلسه چند دقیقه؟</span>
            <SelectChip
              options={[45, 60, 75, 90].map((m) => ({
                value: m,
                label: `${m} دقیقه`,
              }))}
              value={profile.minutesPerSession}
              onChange={(v) => update('minutesPerSession', v)}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex flex-col gap-4">
          <SectionTitle title="تغذیه" />

          {entitlements && !entitlements.canCreateFreePlan && !entitlements.canCreatePlan && (
            <Alert variant="warning">
              برنامه اول رایگان بود. برای برنامه جدید باید پرداخت کنی.
            </Alert>
          )}

          <Toggle
            checked={profile.nutritionEnabled}
            onChange={(v) => update('nutritionEnabled', v)}
            label="برنامه تغذیه ایرانی"
            description={
              profile.nutritionEnabled
                ? entitlements?.nutritionPaid
                  ? 'پرداخت تغذیه انجام شده — برنامه غذایی هم ساخته می‌شود'
                  : 'فعال‌سازی تغذیه نیاز به پرداخت جداگانه دارد (حتی در برنامه اول)'
                : 'فقط برنامه تمرینی — رایگان برای اولین برنامه'
            }
          />

          {profile.nutritionEnabled && !entitlements?.nutritionPaid && (
            <Alert variant="warning">
              برنامه تغذیه در نسخه رایگان نیست. با زدن «ساخت برنامه»، به صفحه
              پرداخت هدایت می‌شوی.
            </Alert>
          )}

          {profile.nutritionEnabled && (
            <>
              <div>
                <span className="block text-sm mb-1.5">
                  چند وعده در روز می‌خوری؟
                </span>
                <SelectChip
                  options={[3, 4, 5, 6].map((m) => ({
                    value: m,
                    label: String(m),
                  }))}
                  value={profile.mealsPerDay}
                  onChange={(v) => update('mealsPerDay', v)}
                />
              </div>
              <Input
                label="رژیم یا محدودیت غذایی (اختیاری)"
                placeholder="مثلاً: گیاهخوار، بدون گلوتن، دیابت..."
                value={profile.dietaryRestrictions}
                onChange={(e) => update('dietaryRestrictions', e.target.value)}
              />
            </>
          )}

          <Alert variant="info">
            {entitlements?.canCreateFreePlan
              ? 'اولین برنامه تمرینی یک ماه رایگان است. برنامه‌های بعدی پولی هستند.'
              : entitlements?.canCreatePlan
                ? 'یک اعتبار برنامه پولی داری — آماده ساخت.'
                : 'برای ساخت برنامه جدید، ابتدا پرداخت کن.'}
          </Alert>
        </div>
      )}

      <div className="flex gap-2 mt-8">
        {step > 0 && (
          <Button variant="secondary" fullWidth onClick={prev}>
            قبلی
          </Button>
        )}
        {step < ONBOARDING_STEPS.length - 1 ? (
          <Button fullWidth className={step === 0 ? 'flex-2' : ''} onClick={next}>
            بعدی
          </Button>
        ) : (
          <Button fullWidth disabled={loading} onClick={submit}>
            {loading ? 'در حال آنالیز...' : 'ساخت برنامه من'}
          </Button>
        )}
      </div>
    </PageShell>
  );
}
