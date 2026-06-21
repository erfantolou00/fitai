import { NextResponse } from 'next/server';
import { dbToProfile } from '@/app/lib/db/mappers';
import { getProfile } from '@/app/lib/db/profiles';
import { getActiveFitnessProfile } from '@/app/lib/db/fitness-profiles';
import { getDefaultWorkoutPlan, listWorkoutPlans } from '@/app/lib/db/workout-plans';
import { getDailyTips } from '@/app/lib/constants/dashboard-content';
import { GOAL_LABELS, LEVEL_LABELS, LOCATION_LABELS } from '@/app/lib/constants/labels';
import { createClient } from '@/app/lib/supabase/server';
import { Goal, Level, Location } from '@/app/types/user';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const profile = await getProfile(user.id);

  const [fitness, latest, plans] = await Promise.all([
    getActiveFitnessProfile(user.id),
    getDefaultWorkoutPlan(user.id, profile?.default_plan_id ?? null),
    listWorkoutPlans(user.id),
  ]);

  const tips = getDailyTips();
  const analysis = latest?.result.analysis;

  const weightDiff =
    fitness != null
      ? Number(fitness.target_weight) - Number(fitness.current_weight)
      : null;

  return NextResponse.json({
    profile,
    fitness: fitness
      ? {
          ...dbToProfile(fitness),
          labels: {
            goal: GOAL_LABELS[fitness.goal as Goal]?.label ?? fitness.goal,
            level: LEVEL_LABELS[fitness.fitness_level as Level]?.label ?? fitness.fitness_level,
            location: LOCATION_LABELS[fitness.location as Location] ?? fitness.location,
          },
        }
      : null,
    stats: {
      planCount: plans.length,
      bmi: analysis?.bmi ?? null,
      bmiStatus: analysis?.bmiStatus ?? null,
      phase: analysis?.recommendedPhase ?? null,
      timeEstimate: analysis?.timeEstimate ?? null,
      weightDiff,
      dailyCalories: latest?.result.nutrition?.dailyCalories ?? null,
    },
    latestPlan: latest
      ? {
          id: latest.plan.id,
          title: latest.plan.title,
          createdAt: latest.plan.created_at,
          importantNote: analysis?.importantNote ?? null,
          hasNutrition: !!latest.result.nutrition,
          isDefault: latest.plan.id === profile?.default_plan_id,
        }
      : null,
    billing: {
      freeTrialExpiresAt: profile?.free_trial_expires_at ?? null,
      nutritionPaid: profile?.nutrition_paid ?? false,
      paidPlanCredits: profile?.paid_plan_credits ?? 0,
      defaultPlanId: profile?.default_plan_id ?? null,
    },
    tips,
  });
}
