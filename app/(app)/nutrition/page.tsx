'use client';

import { ComingSoon } from '@/app/components/ui/coming-soon';
import { SectionTitle } from '@/app/components/layout/page-shell';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Card, CardTitle, StatBox } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { FOOD_CATEGORY_LABELS } from '@/app/lib/nutrition/helpers';
import { cn } from '@/app/lib/utils/cn';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface NutritionSummary {
  hasFitnessProfile: boolean;
  goalLabel?: string;
  plan?: {
    bmr: number;
    tdee: number;
    dailyCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      proteinPct: number;
      carbsPct: number;
      fatPct: number;
    };
  };
  recommended?: {
    highProtein: FoodItem[];
    lowFat: FoodItem[];
  };
}

interface FoodItem {
  id: string;
  name: string;
  name_en: string;
  category: string;
  portion_size: number;
  portion_unit: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export default function NutritionPage() {
  const router = useRouter();
  const [summary, setSummary] = useState<NutritionSummary | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [foodsLoading, setFoodsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/nutrition/summary')
      .then((r) => r.json())
      .then(setSummary)
      .catch(() => setError('خطا در بارگذاری اطلاعات تغذیه'))
      .finally(() => setLoading(false));
  }, []);

  const loadFoods = useCallback(async (q: string, cat: string) => {
    setFoodsLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (cat) params.set('category', cat);
      const res = await fetch(`/api/nutrition/foods?${params}`);
      const data = await res.json();
      setFoods(data.foods ?? []);
    } catch {
      setFoods([]);
    } finally {
      setFoodsLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => loadFoods(query, category), 300);
    return () => clearTimeout(t);
  }, [query, category, loadFoods]);

  if (loading) {
    return <div className="text-center py-16 text-muted">در حال بارگذاری...</div>;
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <>
      <SectionTitle
        title="تغذیه"
        subtitle="کالری، ماکرو و بانک غذای ایرانی"
      />

      {!summary?.hasFitnessProfile ? (
        <Alert variant="warning" className="mb-6">
          برای محاسبه کالری و ماکرو،{' '}
          <button
            type="button"
            className="underline bg-transparent border-none cursor-pointer text-accent-dark font-medium p-0"
            onClick={() => router.push('/onboarding')}
          >
            پروفایل ورزشی
          </button>{' '}
          بساز.
        </Alert>
      ) : (
        summary.plan && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold m-0">خلاصه روزانه</h2>
              {summary.goalLabel && (
                <span className="text-xs bg-primary/10 text-primary-dark px-3 py-1 rounded-full font-medium">
                  {summary.goalLabel}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <StatBox
                label="کالری"
                value={summary.plan.dailyCalories}
                sub="kcal / روز"
                className="col-span-2 md:col-span-1"
              />
              <StatBox
                label="پروتئین"
                value={`${summary.plan.macros.protein}g`}
                sub={`${summary.plan.macros.proteinPct}%`}
              />
              <StatBox
                label="کربوهیدرات"
                value={`${summary.plan.macros.carbs}g`}
                sub={`${summary.plan.macros.carbsPct}%`}
              />
              <StatBox
                label="چربی"
                value={`${summary.plan.macros.fat}g`}
                sub={`${summary.plan.macros.fatPct}%`}
              />
            </div>

            <Card padding="sm" className="text-xs text-muted">
              BMR: {summary.plan.bmr} kcal · TDEE: {summary.plan.tdee} kcal
            </Card>

            {summary.recommended && (
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <RecommendedList
                  title="پروتئین بالا"
                  foods={summary.recommended.highProtein}
                />
                <RecommendedList
                  title="چربی پایین"
                  foods={summary.recommended.lowFat}
                />
              </div>
            )}
          </div>
        )
      )}

      <SectionTitle title="بانک غذای ایرانی" subtitle="جستجو و فیلتر بر اساس دسته‌بندی" />

      <div className="mb-4 space-y-3">
        <Input
          placeholder="جستجوی غذا — مثلاً برنج، مرغ، عدس..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <CategoryChip
            label="همه"
            active={!category}
            onClick={() => setCategory('')}
          />
          {Object.entries(FOOD_CATEGORY_LABELS).map(([key, label]) => (
            <CategoryChip
              key={key}
              label={label}
              active={category === key}
              onClick={() => setCategory(key)}
            />
          ))}
        </div>
      </div>

      {foodsLoading ? (
        <div className="text-center py-8 text-muted text-sm">در حال جستجو...</div>
      ) : foods.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-muted m-0">غذایی پیدا نشد</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {foods.map((food) => (
            <Card key={food.id} padding="sm">
              <p className="font-semibold text-sm m-0">{food.name}</p>
              <p className="text-xs text-muted m-0 mt-0.5">{food.name_en}</p>
              <div className="flex flex-wrap gap-2 mt-2 text-xs">
                <span className="bg-primary/10 text-primary-dark px-2 py-0.5 rounded-full">
                  {food.nutrition.calories} kcal
                </span>
                <span className="bg-surface-muted text-muted px-2 py-0.5 rounded-full">
                  {food.nutrition.protein}g پروتئین
                </span>
                <span className="text-muted">
                  / {food.portion_size}{food.portion_unit}
                </span>
              </div>
              {FOOD_CATEGORY_LABELS[food.category] && (
                <p className="text-[11px] text-muted mt-2 mb-0">
                  {FOOD_CATEGORY_LABELS[food.category]}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <SectionTitle title="به‌زودی" />
      <div className="grid sm:grid-cols-2 gap-3">
        <ComingSoon title="برنامه‌ریزی وعده‌ها" description="ساخت برنامه غذایی روزانه" />
        <ComingSoon title="کالری از عکس" description="تشخیص کالری با هوش مصنوعی" />
      </div>
    </>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer transition-colors',
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-surface border-border text-muted hover:border-primary/40'
      )}
    >
      {label}
    </button>
  );
}

function RecommendedList({ title, foods }: { title: string; foods: FoodItem[] }) {
  return (
    <Card>
      <CardTitle className="mb-3 text-sm">{title}</CardTitle>
      <ul className="space-y-2 m-0 p-0 list-none">
        {foods.map((f) => (
          <li key={f.id} className="flex justify-between text-sm">
            <span>{f.name}</span>
            <span className="text-muted text-xs">{f.nutrition.protein}g پروتئین</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
