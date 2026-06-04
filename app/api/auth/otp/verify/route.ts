/**
 * DISABLED — SMS OTP auth (Kavenegar)
 * Classic username/password auth is active.
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
import { signInOrCreatePhoneUser } from '@/app/lib/auth/phone-auth';
import { verifyOtpCode } from '@/app/lib/db/otp';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone: rawPhone, code, fullName } = body;

    if (!rawPhone || !code || !fullName?.trim()) {
      return NextResponse.json(
        { error: 'شماره، نام و کد تایید الزامی است' },
        { status: 400 }
      );
    }

    if (!isValidIranPhone(rawPhone)) {
      return NextResponse.json(
        { error: 'شماره موبایل نامعتبر است' },
        { status: 400 }
      );
    }

    const phone = normalizePhone(rawPhone);
    const otpValid = await verifyOtpCode(phone, String(code).trim());

    if (!otpValid) {
      return NextResponse.json(
        { error: 'کد تایید نامعتبر یا منقضی شده' },
        { status: 401 }
      );
    }

    const { tokenHash } = await signInOrCreatePhoneUser(
      phone,
      fullName.trim()
    );

    const supabase = await createClient();
    const { error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: 'email',
    });

    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json(
        { error: 'خطا در ورود. دوباره تلاش کنید.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('OTP verify error:', error);
    const message =
      error instanceof Error ? error.message : 'خطا در تایید کد';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
*/
