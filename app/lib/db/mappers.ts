import { UserProfile, AIResult, BodyAnalysis } from '@/app/types/user';
import { DbFitnessProfile, DbWorkoutPlan } from '@/app/types/database';

export function profileToDb(
  userId: string,
  profile: UserProfile
): Omit<DbFitnessProfile, 'id' | 'created_at' | 'updated_at' | 'is_active'> {
  return {
    user_id: userId,
    age: profile.age,
    gender: profile.gender,
    height: profile.height,
    current_weight: profile.currentWeight,
    target_weight: profile.targetWeight,
    fitness_level: profile.fitnessLevel,
    experience_months: profile.experienceMonths,
    injuries: profile.injuries,
    goal: profile.goal,
    location: profile.location,
    days_per_week: profile.daysPerWeek,
    minutes_per_session: profile.minutesPerSession,
    nutrition_enabled: profile.nutritionEnabled,
    meals_per_day: profile.mealsPerDay,
    dietary_restrictions: profile.dietaryRestrictions,
  };
}

export function dbToProfile(row: DbFitnessProfile): UserProfile {
  return {
    age: row.age,
    gender: row.gender,
    height: row.height,
    currentWeight: Number(row.current_weight),
    targetWeight: Number(row.target_weight),
    fitnessLevel: row.fitness_level as UserProfile['fitnessLevel'],
    experienceMonths: row.experience_months,
    injuries: row.injuries,
    goal: row.goal as UserProfile['goal'],
    location: row.location as UserProfile['location'],
    daysPerWeek: row.days_per_week,
    minutesPerSession: row.minutes_per_session,
    nutritionEnabled: row.nutrition_enabled,
    mealsPerDay: row.meals_per_day,
    dietaryRestrictions: row.dietary_restrictions,
  };
}

export function resultToDbPlan(
  userId: string,
  result: AIResult,
  fitnessProfileId?: string | null,
  title?: string
): Omit<DbWorkoutPlan, 'id' | 'created_at'> {
  return {
    user_id: userId,
    fitness_profile_id: fitnessProfileId ?? null,
    analysis: result.analysis as unknown as Record<string, unknown>,
    program: result.program as unknown as Record<string, unknown>,
    nutrition: (result.nutrition ?? null) as Record<string, unknown> | null,
    title: title ?? `برنامه ${new Date().toLocaleDateString('fa-IR')}`,
  };
}

export function dbToResult(row: DbWorkoutPlan): AIResult {
  return {
    analysis: row.analysis as unknown as BodyAnalysis,
    program: row.program as AIResult['program'],
    nutrition: row.nutrition as AIResult['nutrition'],
  };
}
