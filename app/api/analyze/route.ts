import { NextRequest, NextResponse } from 'next/server';
import { generateFullPlan } from '@/app/lib/ai/generate';
import { AIProviderError, parseAIError } from '@/app/lib/ai/errors';
import { saveFitnessProfile } from '@/app/lib/db/fitness-profiles';
import { saveWorkoutPlan } from '@/app/lib/db/workout-plans';
import { createClient } from '@/app/lib/supabase/server';
import { DEFAULT_PROFILE, UserProfile } from '@/app/types/user';

function validateProfile(data: unknown): UserProfile | null {
  if (!data || typeof data !== 'object') return null;
  const p = data as Partial<UserProfile>;

  const requiredNumbers: (keyof UserProfile)[] = [
    'age',
    'height',
    'currentWeight',
    'targetWeight',
    'experienceMonths',
    'daysPerWeek',
    'minutesPerSession',
    'mealsPerDay',
  ];

  for (const key of requiredNumbers) {
    const val = p[key];
    if (typeof val !== 'number' || Number.isNaN(val)) return null;
  }

  if (p.gender !== 'male' && p.gender !== 'female') return null;
  if (!['beginner', 'intermediate', 'advanced'].includes(p.fitnessLevel ?? ''))
    return null;
  if (
    !['fat_loss', 'muscle_gain', 'strength', 'general_fitness'].includes(
      p.goal ?? ''
    )
  )
    return null;
  if (!['gym', 'home', 'both'].includes(p.location ?? '')) return null;
  if (typeof p.nutritionEnabled !== 'boolean') return null;

  return {
    ...DEFAULT_PROFILE,
    ...p,
    injuries: String(p.injuries ?? ''),
    dietaryRestrictions: String(p.dietaryRestrictions ?? ''),
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const profile = validateProfile(body);

    if (!profile) {
      return NextResponse.json(
        { error: 'اطلاعات ورودی نامعتبر است' },
        { status: 400 }
      );
    }

    const result = await generateFullPlan(profile);

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let planId: string | undefined;

    if (user) {
      try {
        const fitnessProfile = await saveFitnessProfile(user.id, profile);
        const plan = await saveWorkoutPlan(
          user.id,
          result,
          fitnessProfile.id
        );
        planId = plan.id;
      } catch (dbError) {
        console.error('DB save error:', dbError);
      }
    }

    return NextResponse.json({ ...result, planId });
  } catch (error) {
    const aiError =
      error instanceof AIProviderError ? error : parseAIError(error);
    console.error('AI Error:', aiError.code, aiError.message);
    return NextResponse.json(
      { error: aiError.message, code: aiError.code },
      { status: aiError.status }
    );
  }
}
