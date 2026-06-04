'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AIResult } from '@/app/types/user';

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AIResult | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem('fitai_result');
    if (!raw) {
      router.push('/onboarding');
      return;
    }
    const parsed: AIResult = JSON.parse(raw);
    setResult(parsed);
  }, [router]);

  if (!result) return (
    <div dir="rtl" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <p>در حال بارگذاری...</p>
    </div>
  );

  const { analysis, program } = result;

  return (
    <div dir="rtl" style={{ maxWidth: 520, margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ fontSize: 22, fontWeight: 500 }}>برنامه شخصی تو</h1>

      {/* Analysis Card */}
      <div style={{
        padding: 20, borderRadius: 12, marginBottom: 20,
        border: '1px solid #d1fae5', background: '#f0fdf4',
      }}>
        <h2 style={{ fontSize: 16, fontWeight: 500, color: '#065f46', margin: '0 0 12px' }}>آنالیز بدنی</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>BMI</p>
            <p style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 500 }}>
              {analysis.bmi?.toFixed(1)}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>{analysis.bmiStatus}</p>
          </div>
          <div style={{ background: '#fff', padding: 12, borderRadius: 8 }}>
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280' }}>دوره پیشنهادی</p>
            <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 500 }}>{analysis.recommendedPhase}</p>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>{analysis.timeEstimate}</p>
          </div>
        </div>
        {analysis.importantNote && (
          <div style={{
            marginTop: 12, padding: 12, background: '#fef3c7',
            borderRadius: 8, fontSize: 13, color: '#92400e', lineHeight: 1.6,
          }}>
            {analysis.importantNote}
          </div>
        )}
      </div>

      {/* Weekly Program */}
      <h2 style={{ fontSize: 18, fontWeight: 500 }}>برنامه هفتگی</h2>
      {program.weeklyPlan?.map((day, i) => (
        <div key={i} style={{
          marginBottom: 12, borderRadius: 10,
          border: day.isRest ? '1px solid #e5e7eb' : '1px solid #dbeafe',
          background: day.isRest ? '#f9fafb' : '#eff6ff',
        }}>
          <div style={{
            padding: '12px 16px',
            borderBottom: day.isRest ? 'none' : '1px solid #dbeafe',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 500, fontSize: 15 }}>{day.day}</span>
              {day.isRest
                ? <span style={{ fontSize: 12, color: '#6b7280' }}>استراحت</span>
                : <span style={{ fontSize: 12, color: '#1e40af' }}>{day.muscleGroups?.join(' · ')}</span>
              }
            </div>
          </div>
          {!day.isRest && day.exercises?.map((ex, j) => (
            <div key={j} style={{
              padding: '10px 16px',
              borderBottom: j < day.exercises.length - 1 ? '1px solid #dbeafe' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{ex.name}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{ex.sets} ست × {ex.reps}</span>
              </div>
              {ex.homeAlternative && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
                  جایگزین خانگی: {ex.homeAlternative}
                </p>
              )}
              {ex.notes && (
                <p style={{ margin: '2px 0 0', fontSize: 11, color: '#9ca3af' }}>
                  {ex.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* CTA */}
      <div style={{
        marginTop: 24, padding: 20, borderRadius: 12,
        border: '1px solid #fde68a', background: '#fffbeb', textAlign: 'center',
      }}>
        <p style={{ margin: '0 0 8px', fontWeight: 500 }}>این یک نمونه دموست</p>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>
          با اشتراک کامل: آموزش تصویری حرکات، برنامه تغذیه، و پیگیری پیشرفت
        </p>
        <button style={{
          padding: '12px 32px', borderRadius: 8, fontSize: 15, fontWeight: 500,
          border: 'none', background: '#1D9E75', color: '#fff', cursor: 'pointer',
        }}>
          مشاهده پلن‌ها
        </button>
      </div>
    </div>
  );
}