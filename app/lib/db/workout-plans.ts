import { createAdminClient } from '@/app/lib/supabase/admin';
import { dbToResult, resultToDbPlan } from '@/app/lib/db/mappers';
import { DbWorkoutPlan } from '@/app/types/database';
import { AIResult } from '@/app/types/user';

export async function saveWorkoutPlan(
  userId: string,
  result: AIResult,
  fitnessProfileId?: string | null,
  title?: string
): Promise<DbWorkoutPlan> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('workout_plans')
    .insert(resultToDbPlan(userId, result, fitnessProfileId, title))
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getWorkoutPlan(
  planId: string,
  userId: string
): Promise<DbWorkoutPlan | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('workout_plans')
    .select('*')
    .eq('id', planId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listWorkoutPlans(userId: string): Promise<DbWorkoutPlan[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getLatestWorkoutPlan(
  userId: string
): Promise<{ plan: DbWorkoutPlan; result: AIResult } | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('workout_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return { plan: data, result: dbToResult(data) };
}

export { dbToResult };
