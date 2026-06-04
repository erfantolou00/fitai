'use client';

import { Badge } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { PageShell } from '@/app/components/layout/page-shell';
import { useRouter } from 'next/navigation';

const FEATURES = [
  { icon: '🎯', text: 'برنامه شخصی' },
  { icon: '🧬', text: 'آنالیز بدنی' },
  { icon: '🥗', text: 'تغذیه ایرانی' },
  { icon: '📸', text: 'کالری از عکس' },
] as const;

const STATS = [
  { num: '۵ دقیقه', label: 'زمان تنظیم' },
  { num: '۱۰۰٪', label: 'شخصی‌سازی' },
  { num: 'رایگان', label: 'برای همیشه' },
] as const;

export default function Home() {
  const router = useRouter();

  return (
    <PageShell variant="dark" maxWidth="lg" showHeader={false}>
      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center py-12">
        <div
          className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{
            background:
              'radial-gradient(circle, rgba(29,158,117,0.15) 0%, transparent 70%)',
          }}
        />

        <div className="animate-fade-up relative z-10 mb-10">
          <Badge
            variant="primary"
            className="mb-8 bg-primary/10 border-primary/30 text-primary"
          >
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)]" />
            هوش مصنوعی ورزشی
          </Badge>

          <h1 className="text-[clamp(2.5rem,8vw,5rem)] font-extrabold text-white m-0 leading-tight tracking-tight">
            فیتار<span className="text-primary">.</span>
          </h1>
          <p className="text-[clamp(1rem,3vw,1.25rem)] text-muted mt-4 max-w-md mx-auto leading-relaxed">
            برنامه تمرینی شخصی‌سازی‌شده با هوش مصنوعی
            <br />
            بدون مربی، بدون کاغذ A4
          </p>
        </div>

        <div className="animate-fade-up-delay-1 relative z-10 flex gap-3 flex-wrap justify-center mb-10">
          {FEATURES.map(({ icon, text }) => (
            <Badge
              key={text}
              variant="outline"
              className="bg-white/5 border-white/10 text-[#aaa]"
            >
              <span className="text-base">{icon}</span>
              {text}
            </Badge>
          ))}
        </div>

        <div className="animate-fade-up-delay-2 relative z-10 flex flex-col items-center gap-4">
          <Button
            size="lg"
            className="animate-pulse-glow"
            onClick={() => router.push('/onboarding')}
          >
            برنامه رایگان بگیر ←
          </Button>
          <button
            type="button"
            onClick={() => router.push('/login?mode=register')}
            className="text-sm text-muted bg-transparent border-none cursor-pointer hover:text-primary transition-colors"
          >
            حساب نداری؟ ثبت‌نام
          </button>
          <button
            type="button"
            onClick={() => router.push('/login')}
            className="text-sm text-muted bg-transparent border-none cursor-pointer hover:text-primary transition-colors"
          >
            قبلاً ثبت‌نام کردی؟ ورود
          </button>
          <p className="text-xs text-[#555] m-0">بدون ثبت‌نام · ۳۰ ثانیه</p>
        </div>

        <div className="animate-fade-up-delay-3 relative z-10 mt-16 flex gap-10">
          {STATS.map(({ num, label }) => (
            <div key={label} className="text-center">
              <div className="text-lg font-bold text-white">{num}</div>
              <div className="text-[11px] text-[#555] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
