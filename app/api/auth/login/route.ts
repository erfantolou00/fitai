import { NextRequest, NextResponse } from 'next/server';
import { signInWithCredentials } from '@/app/lib/auth/credentials';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username?.trim() || !password) {
      return NextResponse.json(
        { error: 'نام کاربری و رمز عبور الزامی است' },
        { status: 400 }
      );
    }

    await signInWithCredentials(username, password);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    const message =
      error instanceof Error ? error.message : 'خطا در ورود';
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
