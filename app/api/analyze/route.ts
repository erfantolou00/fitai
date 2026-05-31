import { NextRequest, NextResponse } from 'next/server';
import { generateFullPlan } from '@/app/lib/ai/generate';
import { UserProfile } from '@/app/types/user';

export async function POST(req: NextRequest) {
  try {
    const profile: UserProfile = await req.json();

    // validation ساده
    if (!profile.age || !profile.height || !profile.currentWeight) {
      return NextResponse.json({ error: 'اطلاعات ناقص است' }, { status: 400 });
    }

    const result = await generateFullPlan(profile);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Error:', error);
    return NextResponse.json({ error: 'خطا در سرور' }, { status: 500 });
  }
}