/**
 * DISABLED — SMS OTP auth (Kavenegar)
 * Classic username/password auth is active.
 * See: app/api/auth/signup, app/api/auth/login
 */

import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'احراز هویت پیامکی غیرفعال است' },
    { status: 503 }
  );
}

/*
import { NextRequest, NextResponse } from 'next/server';
import { isValidIranPhone, normalizePhone } from '@/app/lib/auth/phone';
import { createAndSendOtp } from '@/app/lib/db/otp';

export async function POST(req: NextRequest) {
  try {
    const { phone: rawPhone } = await req.json();

    if (!rawPhone || typeof rawPhone !== 'string') {
      return NextResponse.json(
        { error: 'شماره موبایل الزامی است' },
        { status: 400 }
      );
    }

    if (!isValidIranPhone(rawPhone)) {
      return NextResponse.json(
        { error: 'شماره موبایل نامعتبر است (مثال: 09123456789)' },
        { status: 400 }
      );
    }

    const phone = normalizePhone(rawPhone);
    await createAndSendOtp(phone);

    return NextResponse.json({ success: true, phone });
  } catch (error) {
    console.error('OTP send error:', error);
    const message =
      error instanceof Error ? error.message : 'خطا در ارسال کد تایید';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
*/
