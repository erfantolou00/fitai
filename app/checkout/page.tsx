'use client';

import { PageShell, SectionTitle } from '@/app/components/layout/page-shell';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import {
  CHECKOUT_PRODUCTS,
  CheckoutProduct,
} from '@/app/lib/billing/products';
import { cn } from '@/app/lib/utils/cn';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const product = (searchParams.get('product') ?? 'new_plan') as CheckoutProduct;
  const returnTo = searchParams.get('return') ?? '/home';

  const info = CHECKOUT_PRODUCTS[product] ?? CHECKOUT_PRODUCTS.new_plan;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/checkout/mock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'خطا در پرداخت');
        return;
      }

      setDone(true);
      setTimeout(() => router.push(returnTo), 1500);
    } catch {
      setError('خطایی رخ داد');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell showBack title="پرداخت" maxWidth="sm">
      <SectionTitle title="تکمیل خرید" subtitle="درگاه پرداخت — نسخه آزمایشی" />

      <Card padding="lg" className="mb-6">
        <h2 className="text-lg font-semibold m-0 mb-1">{info.name}</h2>
        <p className="text-sm text-muted m-0 mb-4">{info.description}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">{info.priceLabel}</span>
        </div>
      </Card>

      <Alert variant="info" className="mb-6">
        این یک صفحه آزمایشی است. با کلیک روی «پرداخت آزمایشی»، خرید شبیه‌سازی
        می‌شود و بعداً به درگاه واقعی وصل خواهد شد.
      </Alert>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {done ? (
        <Alert variant="success">پرداخت موفق! در حال بازگشت...</Alert>
      ) : (
        <div className="flex flex-col gap-3">
          <Button fullWidth disabled={loading} onClick={handlePay}>
            {loading ? 'در حال پردازش...' : 'پرداخت آزمایشی'}
          </Button>
          <Button variant="secondary" fullWidth onClick={() => router.back()}>
            انصراف
          </Button>
        </div>
      )}

      <div className="mt-8 flex gap-2">
        {(['new_plan', 'nutrition'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() =>
              router.push(`/checkout?product=${p}&return=${encodeURIComponent(returnTo)}`)
            }
            className={cn(
              'flex-1 py-2 text-xs rounded-lg border cursor-pointer transition-colors',
              product === p
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted hover:border-primary/40'
            )}
          >
            {CHECKOUT_PRODUCTS[p].name}
          </button>
        ))}
      </div>
    </PageShell>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
