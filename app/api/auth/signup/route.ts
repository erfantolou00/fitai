import { NextRequest, NextResponse } from 'next/server';
import { signUpWithCredentials } from '@/app/lib/auth/credentials';

export async function POST(req: NextRequest) {
  try {
    const { username, password, fullName } = await req.json();

    if (!username?.trim() || !password || !fullName?.trim()) {
      return NextResponse.json(
        { error: 'نام، نام کاربری و رمز عبور الزامی است' },
        { status: 400 }
      );
    }

    await signUpWithCredentials(username, password, fullName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Signup error:', error);
    const message =
      error instanceof Error ? error.message : 'خطا در ثبت‌نام';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
