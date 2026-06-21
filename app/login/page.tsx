'use client';

import { PageShell, SectionTitle } from '@/app/components/layout/page-shell';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useAuth } from '@/app/components/auth/auth-provider';
import { cn } from '@/app/lib/utils/cn';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

type AuthMode = 'login' | 'register';

function AuthForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/home';
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  const { refreshAuth } = useAuth();

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    if (mode === 'register' && password !== confirmPassword) {
      setError('رمز عبور و تکرار آن یکسان نیست');
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'register' ? '/api/auth/signup' : '/api/auth/login';
      const body =
        mode === 'register'
          ? { username, password, fullName }
          : { username, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'خطایی رخ داد');
        return;
      }

      await refreshAuth();
      window.location.href = redirect;
    } catch {
      setError('خطایی رخ داد، دوباره تلاش کنید');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell showBack title={mode === 'login' ? 'ورود' : 'ثبت‌نام'} maxWidth="sm">
      <SectionTitle
        title={mode === 'login' ? 'ورود به فیتار' : 'ثبت‌نام در فیتار'}
        subtitle="برنامه‌هات رو ذخیره کن و هر وقت خواستی ببین"
      />

      <div className="flex gap-2 mb-6 p-1 bg-surface-muted rounded-xl">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={cn(
              'flex-1 py-2.5 rounded-lg text-sm font-medium transition-all border-none cursor-pointer',
              mode === m
                ? 'bg-surface text-foreground shadow-sm'
                : 'bg-transparent text-muted'
            )}
          >
            {m === 'login' ? 'ورود' : 'ثبت‌نام'}
          </button>
        ))}
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <div className="flex flex-col gap-4">
        {mode === 'register' && (
          <Input
            label="نام و نام خانوادگی"
            placeholder="مثلاً: علی محمدی"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        )}

        <Input
          label="نام کاربری"
          placeholder="ایمیل یا شماره موبایل (09123456789)"
          type="text"
          dir="ltr"
          className="text-left"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <Input
          label="رمز عبور"
          placeholder="حداقل ۶ کاراکتر"
          type="password"
          dir="ltr"
          className="text-left"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {mode === 'register' && (
          <Input
            label="تکرار رمز عبور"
            placeholder="رمز عبور را دوباره وارد کن"
            type="password"
            dir="ltr"
            className="text-left"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        )}

        <Button
          fullWidth
          disabled={
            loading ||
            !username.trim() ||
            !password ||
            (mode === 'register' && !fullName.trim())
          }
          onClick={handleSubmit}
        >
          {loading
            ? 'لطفاً صبر کن...'
            : mode === 'login'
              ? 'ورود'
              : 'ثبت‌نام'}
        </Button>
      </div>

      <p className="text-xs text-muted text-center mt-8 leading-relaxed">
        با {mode === 'login' ? 'ورود' : 'ثبت‌نام'}، شرایط استفاده از فیتار را
        می‌پذیری.
      </p>

      {/* ─── DISABLED: Google OAuth ─── */}
      {/*
      <Button variant="outline" fullWidth className="mt-6 gap-2" onClick={signInWithGoogle}>
        <GoogleIcon />
        ورود با Google
      </Button>

      const signInWithGoogle = async () => {
        const supabase = createClient();
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirect)}`,
          },
        });
      };
      */}

      {/* ─── DISABLED: SMS OTP (Kavenegar) ─── */}
      {/*
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted">یا با شماره موبایل</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      // Step 1: POST /api/auth/otp/send { phone }
      // Step 2: POST /api/auth/otp/verify { phone, code, fullName }
      */}
    </PageShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}
