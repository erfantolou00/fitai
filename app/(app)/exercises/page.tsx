'use client';

import { SectionTitle } from '@/app/components/layout/page-shell';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
interface ExerciseItem {
  id: string;
  external_id: string;
  name_en: string;
  name_fa: string;
  body_part: string;
  body_part_fa: string;
  target_muscle: string;
  target_muscle_fa: string;
  secondary_muscles: string[];
  equipment: string;
  equipment_fa: string;
  instructions_en: string[];
  gif_public_url: string | null;
}

interface FilterOption {
  value: string;
  label: string;
}

interface ExercisesResponse {
  results: ExerciseItem[];
  count: number;
  meta?: {
    bodyParts: FilterOption[];
    muscles: FilterOption[];
    equipment: FilterOption[];
  };
}

const PAGE_SIZE = 30;

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [bodyParts, setBodyParts] = useState<FilterOption[]>([]);
  const [muscles, setMuscles] = useState<FilterOption[]>([]);
  const [equipmentOptions, setEquipmentOptions] = useState<FilterOption[]>([]);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedBodyPart, setSelectedBodyPart] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // debounce جستجو — جلوگیری از درخواست به ازای هر کلید
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  // بارگذاری اولیه + هر تغییر فیلتر
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      setOffset(0);

      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: '0',
          meta: 'true',
        });
        if (debouncedQuery) params.set('query', debouncedQuery);
        if (selectedBodyPart) params.set('bodyPart', selectedBodyPart);
        if (selectedMuscle) params.set('target', selectedMuscle);
        if (selectedEquipment) params.set('equipment', selectedEquipment);

        const res = await fetch(`/api/exercises?${params.toString()}`);
        if (!res.ok) {
          const payload = await res.json().catch(() => null);
          throw new Error(payload?.error || 'خطا در دریافت حرکات');
        }

        const data: ExercisesResponse = await res.json();
        setExercises(data.results ?? []);
        setTotal(data.count ?? 0);
        if (data.meta) {
          setBodyParts(data.meta.bodyParts ?? []);
          setMuscles(data.meta.muscles ?? []);
          setEquipmentOptions(data.meta.equipment ?? []);
        }
      } catch (err) {
        setError((err as Error).message ?? 'خطا در دریافت حرکات');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [debouncedQuery, selectedBodyPart, selectedMuscle, selectedEquipment]);

  // بارگذاری بیشتر — infinite scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || loading) return;
    if (exercises.length >= total) return;

    setLoadingMore(true);
    const nextOffset = offset + PAGE_SIZE;

    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(nextOffset),
      });
      if (debouncedQuery) params.set('query', debouncedQuery);
      if (selectedBodyPart) params.set('bodyPart', selectedBodyPart);
      if (selectedMuscle) params.set('target', selectedMuscle);
      if (selectedEquipment) params.set('equipment', selectedEquipment);

      const res = await fetch(`/api/exercises?${params.toString()}`);
      const data: ExercisesResponse = await res.json();

      setExercises(prev => [...prev, ...(data.results ?? [])]);
      setOffset(nextOffset);
    } catch {
      // silent fail on load-more
    } finally {
      setLoadingMore(false);
    }
  }, [offset, loadingMore, loading, exercises.length, total, debouncedQuery, selectedBodyPart, selectedMuscle, selectedEquipment]);

  // IntersectionObserver برای infinite scroll
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: '200px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const hasActiveFilters = query || selectedBodyPart || selectedMuscle || selectedEquipment;

  const clearFilters = () => {
    setQuery('');
    setSelectedBodyPart('');
    setSelectedMuscle('');
    setSelectedEquipment('');
  };

  const muscleFaMap = useMemo(() => {
    const map: Record<string, string> = {};
    muscles.forEach(m => { map[m.value] = m.label; });
    return map;
  }, [muscles]);

  return (
    <>
      <SectionTitle
        title="بانک حرکات"
        subtitle={
          loading
            ? 'در حال بارگذاری...'
            : `${exercises.length.toLocaleString('fa-IR')} از ${total.toLocaleString('fa-IR')} حرکت`
        }
      />

      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
      {/* Filters */}
      <div className="mb-5 space-y-3">
        <Input
          placeholder="جستجوی نام حرکت — مثلاً پرس سینه یا اسکوات"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <select
            value={selectedBodyPart}
            onChange={(e) => setSelectedBodyPart(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-[14px] bg-surface border border-border-strong focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            <option value="">همه نواحی بدن</option>
            {bodyParts.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={selectedMuscle}
            onChange={(e) => setSelectedMuscle(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-[14px] bg-surface border border-border-strong focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            <option value="">همه عضلات هدف</option>
            {muscles.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            className="w-full px-3 py-2.5 rounded-lg text-[14px] bg-surface border border-border-strong focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          >
            <option value="">همه تجهیزات</option>
            {equipmentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-muted border border-border/50 text-sm">
            <span className="text-muted">{total.toLocaleString('fa-IR')} نتیجه پیدا شد</span>
            <button type="button" onClick={clearFilters} className="text-primary hover:underline">
              پاک کردن فیلترها
            </button>
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-surface overflow-hidden animate-pulse">
              <div className="h-40 bg-surface-muted" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-surface-muted rounded" />
                <div className="h-3 w-1/2 bg-surface-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && exercises.length === 0 && (
        <div className="text-center py-16">
          <p className="text-lg font-medium text-foreground mb-1">حرکتی پیدا نشد</p>
          <p className="text-sm text-muted mb-4">فیلترها را تغییر بده یا جستجو را پاک کن</p>
          <Button size="sm" variant="outline" onClick={clearFilters}>پاک کردن فیلترها</Button>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && exercises.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((ex) => {
              const isExpanded = expandedId === ex.id;
              return (
                <div
                  key={ex.id}
                  className="rounded-xl border border-border bg-surface overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : ex.id)}
                >
                  <div className="relative w-full h-40 bg-surface-muted flex items-center justify-center overflow-hidden">
                    {ex.gif_public_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={ex.gif_public_url}
                        alt={ex.name_fa || ex.name_en}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-3xl opacity-30">🏋️</span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <h3 className="text-[15px] font-medium text-foreground m-0">
                      {ex.name_fa || ex.name_en}
                    </h3>
                    {!ex.name_fa && (
                      <p className="text-xs text-muted m-0">{ex.name_en}</p>
                    )}

                    <div className="flex flex-wrap gap-1.5">
                      {ex.body_part_fa && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary-dark">
                          {ex.body_part_fa}
                        </span>
                      )}
                      {ex.equipment_fa && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-surface-muted text-muted">
                          {ex.equipment_fa}
                        </span>
                      )}
                    </div>

                    {ex.target_muscle_fa && (
                      <p className="text-xs text-muted m-0">
                        عضله هدف: {ex.target_muscle_fa}
                      </p>
                    )}

                    {isExpanded && (
                      <div className="pt-2 mt-2 border-t border-border space-y-2">
                        {ex.secondary_muscles?.length > 0 && (
                          <div className="text-xs">
                            <p className="text-muted font-medium mb-1 m-0">عضلات فرعی:</p>
                            <div className="flex flex-wrap gap-1">
                              {ex.secondary_muscles.map((m) => (
                                <span key={m} className="rounded-full bg-surface-muted px-2 py-0.5 text-muted">
                                  {muscleFaMap[m] || m}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {ex.instructions_en?.length > 0 && (
                          <div className="text-xs">
                            <p className="text-muted font-medium mb-1 m-0">مراحل اجرا:</p>
                            <ol className="text-muted space-y-1 pr-4 m-0" style={{ listStyleType: 'decimal' }}>
                              {ex.instructions_en.slice(0, 5).map((step, i) => (
                                <li key={i}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-4">
            {loadingMore && (
              <span className="text-sm text-muted">در حال بارگذاری بیشتر...</span>
            )}
            {!loadingMore && exercises.length >= total && total > 0 && (
              <span className="text-sm text-muted">همه {total.toLocaleString('fa-IR')} حرکت نمایش داده شد</span>
            )}
          </div>
        </>
      )}
    </>
  );
}