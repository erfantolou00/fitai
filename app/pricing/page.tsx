'use client';

import { PageShell, SectionTitle } from '@/app/components/layout/page-shell';
import { Badge } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { PRICING_FAQ, PRICING_PLANS } from '@/app/lib/constants/pricing';
import { cn } from '@/app/lib/utils/cn';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const router = useRouter();

  return (
    <PageShell showBack title="پلن‌ها" maxWidth="lg">
      <div className="text-center mb-10">
        <Badge variant="primary" className="mb-4">
          پلن‌های اشتراک
        </Badge>
        <h1 className="text-2xl font-bold m-0 mb-2">پلن مناسب خودت رو انتخاب کن</h1>
        <p className="text-sm text-muted m-0 max-w-md mx-auto leading-relaxed">
          از برنامه رایگان شروع کن یا با اشتراک کامل به تمام امکانات AI دسترسی
          داشته باش
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-12">
        {PRICING_PLANS.map((plan) => (
          <Card
            key={plan.id}
            padding="lg"
            className={cn(
              'relative flex flex-col',
              plan.highlighted &&
                'border-primary border-2 shadow-[var(--shadow-md)] scale-[1.02]'
            )}
          >
            {plan.highlighted && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                محبوب‌ترین
              </span>
            )}

            <div className="mb-5">
              <h2 className="text-lg font-bold m-0">{plan.name}</h2>
              <p className="text-xs text-muted mt-1 mb-0">{plan.description}</p>
            </div>

            <div className="mb-5">
              <span className="text-3xl font-extrabold">{plan.price}</span>
              {plan.price !== '۰' && (
                <span className="text-sm text-muted mr-1">هزار تومان</span>
              )}
              <p className="text-xs text-muted mt-1 mb-0">{plan.period}</p>
            </div>

            <ul className="flex-1 space-y-2.5 mb-6 m-0 p-0 list-none">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className="text-sm flex items-start gap-2 leading-relaxed"
                >
                  <span className="text-primary shrink-0 mt-0.5">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              variant={plan.highlighted ? 'primary' : 'outline'}
              fullWidth
              onClick={() => {
                if (plan.id === 'free') router.push('/onboarding');
              }}
            >
              {plan.cta}
            </Button>
          </Card>
        ))}
      </div>

      <SectionTitle title="سوالات متداول" />
      <div className="flex flex-col gap-3">
        {PRICING_FAQ.map(({ q, a }) => (
          <Card key={q} padding="md">
            <p className="font-semibold text-sm m-0 mb-1">{q}</p>
            <p className="text-sm text-muted m-0 leading-relaxed">{a}</p>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
