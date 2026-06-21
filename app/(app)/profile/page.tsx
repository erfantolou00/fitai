'use client';

import { useAuth } from '@/app/components/auth/auth-provider';
import { SectionTitle } from '@/app/components/layout/page-shell';
import { ComingSoon } from '@/app/components/ui/coming-soon';
import { Card } from '@/app/components/ui/card';
import { usernameToDisplay } from '@/app/lib/auth/username';

export default function ProfilePage() {
  const { profile } = useAuth();

  const displayName =
    profile?.full_name ||
    (profile?.username ? usernameToDisplay(profile.username) : 'ورزشکار');

  return (
    <>
      <SectionTitle title="پروفایل" subtitle="تنظیمات و اطلاعات حساب" />

      <Card className="mb-6">
        <p className="text-xs text-muted m-0">نام</p>
        <p className="font-semibold m-0 mt-1">{displayName}</p>
        {profile?.username && (
          <>
            <p className="text-xs text-muted m-0 mt-3">نام کاربری</p>
            <p className="font-medium m-0 mt-1 text-sm" dir="ltr">
              {usernameToDisplay(profile.username)}
            </p>
          </>
        )}
      </Card>

      <SectionTitle title="به‌زودی" />
      <div className="grid sm:grid-cols-2 gap-3">
        <ComingSoon title="پیشرفت وزن" description="نمودار تغییرات وزن و BMI" />
        <ComingSoon title="اشتراک و پرداخت" description="مدیریت پلن اشتراک" />
        <ComingSoon title="آنالیز بدنی پیشرفته" description="گزارش تفصیلی ترکیب بدن" />
        <ComingSoon title="تنظیمات اعلان" description="یادآوری تمرین و وعده غذایی" />
      </div>
    </>
  );
}
