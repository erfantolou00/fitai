import { NextResponse } from 'next/server';
import { dbToProfile } from '@/app/lib/db/mappers';
import { getActiveFitnessProfile } from '@/app/lib/db/fitness-profiles';
import { getProfile } from '@/app/lib/db/profiles';
import { getLatestWorkoutPlan, listWorkoutPlans } from '@/app/lib/db/workout-plans';
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

  const [profile, fitness, latest, plans] = await Promise.all([
    getProfile(user.id),
    getActiveFitnessProfile(user.id),
    getLatestWorkoutPlan(user.id),
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
        }
      : null,
    tips,
  });
}
