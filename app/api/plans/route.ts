import { NextResponse } from 'next/server';
import { getProfile } from '@/app/lib/db/profiles';
import { listWorkoutPlans } from '@/app/lib/db/workout-plans';
import { createClient } from '@/app/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [plans, profile] = await Promise.all([
    listWorkoutPlans(user.id),
    getProfile(user.id),
  ]);

  const defaultPlanId = profile?.default_plan_id ?? null;

  return NextResponse.json({
    plans: plans.map((p) => ({
      id: p.id,
      title: p.title,
      createdAt: p.created_at,
      hasNutrition: !!p.nutrition,
      phase: (p.analysis as { recommendedPhase?: string })?.recommendedPhase,
      isDefault: p.id === defaultPlanId,
    })),
    defaultPlanId,
  });
}
