'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/app/types/user';

const STEPS = ['اطلاعات پایه', 'سطح و سابقه', 'هدف', 'تجهیزات', 'تغذیه'];

const defaultProfile: UserProfile = {
  age: 25, gender: 'male', height: 175, currentWeight: 80, targetWeight: 70,
  fitnessLevel: 'beginner', experienceMonths: 0, injuries: '',
  goal: 'fat_loss',
  location: 'gym', daysPerWeek: 4, minutesPerSession: 60,
  nutritionEnabled: false, mealsPerDay: 3, dietaryRestrictions: '',
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof UserProfile, value: unknown) =>
    setProfile(prev => ({ ...prev, [key]: value }));

  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      // ذخیره در localStorage برای دمو
      localStorage.setItem('fitai_result', JSON.stringify(data));
      localStorage.setItem('fitai_profile', JSON.stringify(profile));
      router.push('/result');
    } catch {
      alert('خطایی رخ داد، دوباره تلاش کنید');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" style={{ maxWidth: 480, margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Progress */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: 13,
              background: i <= step ? '#1D9E75' : '#e5e7eb',
              color: i <= step ? '#fff' : '#6b7280',
              fontWeight: 500,
            }}>{i + 1}</div>
          ))}
        </div>
        <div style={{ height: 4, background: '#e5e7eb', borderRadius: 2 }}>
          <div style={{
            height: 4, background: '#1D9E75', borderRadius: 2,
            width: `${((step) / (STEPS.length - 1)) * 100}%`,
            transition: 'width 0.3s',
          }} />
        </div>
        <p style={{ marginTop: 8, fontSize: 13, color: '#6b7280' }}>
          مرحله {step + 1} از {STEPS.length} — {STEPS[step]}
        </p>
      </div>

      {/* Step 1 */}
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>اطلاعات پایه</h2>

          <label style={{ fontSize: 14, color: '#374151' }}>
            جنسیت
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {['male', 'female'].map(g => (
                <button key={g}
                  onClick={() => update('gender', g as 'male' | 'female')}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 14,
                    border: profile.gender === g ? '2px solid #1D9E75' : '1px solid #d1d5db',
                    background: profile.gender === g ? '#E1F5EE' : '#fff',
                    color: profile.gender === g ? '#085041' : '#374151',
                    cursor: 'pointer',
                  }}>
                  {g === 'male' ? 'مرد' : 'زن'}
                </button>
              ))}
            </div>
          </label>

          {[
            { label: 'سن (سال)', key: 'age' as const, min: 14, max: 70 },
            { label: 'قد (سانتی‌متر)', key: 'height' as const, min: 140, max: 220 },
            { label: 'وزن فعلی (کیلوگرم)', key: 'currentWeight' as const, min: 40, max: 200 },
            { label: 'وزن هدف (کیلوگرم)', key: 'targetWeight' as const, min: 40, max: 200 },
          ].map(({ label, key, min, max }) => (
            <label key={key} style={{ fontSize: 14, color: '#374151' }}>
              {label}
              <input
                type="number" min={min} max={max}
                value={profile[key] as number}
                onChange={e => update(key, Number(e.target.value))}
                style={{
                  display: 'block', width: '100%', marginTop: 6,
                  padding: '10px 12px', borderRadius: 8, fontSize: 15,
                  border: '1px solid #d1d5db', boxSizing: 'border-box',
                }}
              />
            </label>
          ))}
        </div>
      )}

      {/* Step 2 */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>سطح و سابقه</h2>

          <label style={{ fontSize: 14, color: '#374151' }}>سطح ورزشی شما</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { v: 'beginner', label: 'مبتدی', desc: 'کمتر از ۶ ماه سابقه یا تازه شروع کردم' },
              { v: 'intermediate', label: 'متوسط', desc: '۶ ماه تا ۲ سال تمرین منظم' },
              { v: 'advanced', label: 'پیشرفته', desc: 'بیش از ۲ سال تمرین اصولی' },
            ].map(({ v, label, desc }) => (
              <button key={v}
                onClick={() => update('fitnessLevel', v)}
                style={{
                  padding: '12px 16px', borderRadius: 8, textAlign: 'right', cursor: 'pointer',
                  border: profile.fitnessLevel === v ? '2px solid #1D9E75' : '1px solid #d1d5db',
                  background: profile.fitnessLevel === v ? '#E1F5EE' : '#fff',
                }}>
                <div style={{ fontWeight: 500, fontSize: 14, color: profile.fitnessLevel === v ? '#085041' : '#111' }}>{label}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{desc}</div>
              </button>
            ))}
          </div>

          <label style={{ fontSize: 14, color: '#374151' }}>
            ماه‌های سابقه ورزش
            <input type="number" min={0} max={120}
              value={profile.experienceMonths}
              onChange={e => update('experienceMonths', Number(e.target.value))}
              style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 8, fontSize: 15, border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </label>

          <label style={{ fontSize: 14, color: '#374151' }}>
            آسیب یا محدودیت جسمی (اختیاری)
            <input type="text" placeholder="مثلاً: زانو درد، کمر درد — یا خالی بگذارید"
              value={profile.injuries}
              onChange={e => update('injuries', e.target.value)}
              style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 8, fontSize: 15, border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </label>
        </div>
      )}

      {/* Step 3 */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>هدف اصلی</h2>
          <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>مهم‌ترین هدفت از ورزش الان چیه؟</p>

          {[
            { v: 'fat_loss', label: 'کاهش چربی و لاغری', desc: 'می‌خوام وزنم پایین بیاد و چربی از دست بدم' },
            { v: 'muscle_gain', label: 'افزایش حجم عضلانی', desc: 'می‌خوام عضله بسازم و بدنم پرتر بشه' },
            { v: 'strength', label: 'افزایش قدرت', desc: 'می‌خوام قوی‌تر بشم، وزنه بیشتری بزنم' },
            { v: 'general_fitness', label: 'تناسب اندام عمومی', desc: 'می‌خوام فیت‌تر باشم، انرژی بیشتری داشته باشم' },
          ].map(({ v, label, desc }) => (
            <button key={v}
              onClick={() => update('goal', v)}
              style={{
                padding: '14px 16px', borderRadius: 8, textAlign: 'right', cursor: 'pointer',
                border: profile.goal === v ? '2px solid #1D9E75' : '1px solid #d1d5db',
                background: profile.goal === v ? '#E1F5EE' : '#fff',
              }}>
              <div style={{ fontWeight: 500, fontSize: 15, color: profile.goal === v ? '#085041' : '#111' }}>{label}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 3 }}>{desc}</div>
            </button>
          ))}
        </div>
      )}

      {/* Step 4 */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>تجهیزات و زمان</h2>

          <label style={{ fontSize: 14, color: '#374151' }}>کجا تمرین می‌کنی؟</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { v: 'gym', label: 'باشگاه' },
              { v: 'home', label: 'خانه' },
              { v: 'both', label: 'هر دو' },
            ].map(({ v, label }) => (
              <button key={v}
                onClick={() => update('location', v)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 14, cursor: 'pointer',
                  border: profile.location === v ? '2px solid #1D9E75' : '1px solid #d1d5db',
                  background: profile.location === v ? '#E1F5EE' : '#fff',
                  color: profile.location === v ? '#085041' : '#374151',
                }}>
                {label}
              </button>
            ))}
          </div>

          <label style={{ fontSize: 14, color: '#374151' }}>
            چند روز در هفته؟
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {[3, 4, 5, 6].map(d => (
                <button key={d}
                  onClick={() => update('daysPerWeek', d)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 15, cursor: 'pointer',
                    border: profile.daysPerWeek === d ? '2px solid #1D9E75' : '1px solid #d1d5db',
                    background: profile.daysPerWeek === d ? '#E1F5EE' : '#fff',
                    color: profile.daysPerWeek === d ? '#085041' : '#374151',
                    fontWeight: 500,
                  }}>
                  {d}
                </button>
              ))}
            </div>
          </label>

          <label style={{ fontSize: 14, color: '#374151' }}>
            هر جلسه چند دقیقه؟
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              {[45, 60, 75, 90].map(m => (
                <button key={m}
                  onClick={() => update('minutesPerSession', m)}
                  style={{
                    flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 14, cursor: 'pointer',
                    border: profile.minutesPerSession === m ? '2px solid #1D9E75' : '1px solid #d1d5db',
                    background: profile.minutesPerSession === m ? '#E1F5EE' : '#fff',
                    color: profile.minutesPerSession === m ? '#085041' : '#374151',
                  }}>
                  {m} دقیقه
                </button>
              ))}
            </div>
          </label>
        </div>
      )}

      {/* Step 5 */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 500, margin: 0 }}>تغذیه</h2>

          <label style={{ fontSize: 14, color: '#374151' }}>آیا برنامه تغذیه هم می‌خواهی؟</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { v: true, label: 'بله، می‌خوام' },
              { v: false, label: 'فعلاً نه' },
            ].map(({ v, label }) => (
              <button key={String(v)}
                onClick={() => update('nutritionEnabled', v)}
                style={{
                  flex: 1, padding: '12px 0', borderRadius: 8, fontSize: 14, cursor: 'pointer',
                  border: profile.nutritionEnabled === v ? '2px solid #1D9E75' : '1px solid #d1d5db',
                  background: profile.nutritionEnabled === v ? '#E1F5EE' : '#fff',
                  color: profile.nutritionEnabled === v ? '#085041' : '#374151',
                }}>
                {label}
              </button>
            ))}
          </div>

          {profile.nutritionEnabled && (
            <>
              <label style={{ fontSize: 14, color: '#374151' }}>
                چند وعده در روز می‌خوری؟
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  {[3, 4, 5, 6].map(m => (
                    <button key={m}
                      onClick={() => update('mealsPerDay', m)}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 8, fontSize: 15, cursor: 'pointer',
                        border: profile.mealsPerDay === m ? '2px solid #1D9E75' : '1px solid #d1d5db',
                        background: profile.mealsPerDay === m ? '#E1F5EE' : '#fff',
                        color: profile.mealsPerDay === m ? '#085041' : '#374151',
                        fontWeight: 500,
                      }}>
                      {m}
                    </button>
                  ))}
                </div>
              </label>
              <label style={{ fontSize: 14, color: '#374151' }}>
                رژیم یا محدودیت غذایی (اختیاری)
                <input type="text" placeholder="مثلاً: گیاهخوار، بدون گلوتن، دیابت..."
                  value={profile.dietaryRestrictions}
                  onChange={e => update('dietaryRestrictions', e.target.value)}
                  style={{ display: 'block', width: '100%', marginTop: 6, padding: '10px 12px', borderRadius: 8, fontSize: 15, border: '1px solid #d1d5db', boxSizing: 'border-box' }}
                />
              </label>
            </>
          )}

          <div style={{
            padding: 16, borderRadius: 8,
            background: '#FEF9C3', border: '1px solid #FDE68A',
            fontSize: 13, color: '#92400E', lineHeight: 1.6,
          }}>
            آماده‌ای؟ وقتی دکمه رو بزنی، AI در حدود ۵–۱۰ ثانیه یک برنامه کامل شخصی‌سازی‌شده برات می‌سازه.
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
        {step > 0 && (
          <button onClick={prev} style={{
            flex: 1, padding: '12px 0', borderRadius: 8, fontSize: 15,
            border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer',
          }}>
            قبلی
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={next} style={{
            flex: 2, padding: '12px 0', borderRadius: 8, fontSize: 15, fontWeight: 500,
            border: 'none', background: '#1D9E75', color: '#fff', cursor: 'pointer',
          }}>
            بعدی
          </button>
        ) : (
          <button onClick={submit} disabled={loading} style={{
            flex: 2, padding: '12px 0', borderRadius: 8, fontSize: 15, fontWeight: 500,
            border: 'none', background: loading ? '#9CA3AF' : '#1D9E75',
            color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'در حال آنالیز...' : 'ساخت برنامه من'}
          </button>
        )}
      </div>
    </div>
  );
}