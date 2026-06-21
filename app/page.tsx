'use client';

import { Button } from '@/app/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#060606] text-white overflow-hidden">
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(29,158,117,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(29,158,117,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Glow orbs */}
      <div
        className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(29,158,117,0.18) 0%, transparent 65%)',
        }}
      />
      <div
        className="absolute bottom-[5%] right-[-10%] w-[400px] h-[400px] pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Diagonal accent line */}
      <div className="absolute top-0 right-0 w-1/3 h-full pointer-events-none overflow-hidden opacity-10">
        <div className="absolute top-[-20%] right-[-30%] w-[200%] h-[140%] border-l-2 border-primary rotate-[-15deg]" />
      </div>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="animate-fade-up mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_var(--primary)] animate-pulse" />
            باشگاه هوشمند
          </div>

          <h1 className="text-[clamp(3rem,10vw,5.5rem)] font-extrabold m-0 leading-none tracking-tight">
            فیتار<span className="text-primary">.</span>
          </h1>
          <p className="text-[clamp(1rem,3vw,1.2rem)] text-[#888] mt-5 max-w-sm mx-auto leading-relaxed m-0">
            تمرین شخصی‌سازی‌شده
            <br />
            با هوش مصنوعی
          </p>
        </div>

        <div className="animate-fade-up-delay-1 flex flex-col sm:flex-row gap-3 w-full max-w-xs sm:max-w-sm">
          <Button
            size="lg"
            className="animate-pulse-glow w-full"
            onClick={() => router.push('/login?mode=register')}
          >
            ثبت‌نام
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full border-white/20 text-white hover:border-primary hover:text-primary"
            onClick={() => router.push('/login')}
          >
            ورود
          </Button>
        </div>

        <p className="animate-fade-up-delay-2 text-xs text-[#444] mt-10 m-0 tracking-wide">
          تمرین · تغذیه · پیشرفت
        </p>
      </main>

      <footer className="relative z-10 py-6 text-center text-[11px] text-[#333]">
        © فیتار — هوش مصنوعی ورزشی
      </footer>
    </div>
  );
}
