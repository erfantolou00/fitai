import { createAdminClient } from '@/app/lib/supabase/admin';
import { profileToDb } from '@/app/lib/db/mappers';
import { DbFitnessProfile } from '@/app/types/database';
import { UserProfile } from '@/app/types/user';

export async function saveFitnessProfile(
  userId: string,
  profile: UserProfile
): Promise<DbFitnessProfile> {
  const admin = createAdminClient();

  await admin
    .from('fitness_profiles')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true);

  const { data, error } = await admin
    .from('fitness_profiles')
    .insert({ ...profileToDb(userId, profile), is_active: true })
    .select()
    .single();

  if (error) throw error;

  await admin
    .from('profiles')
    .update({ onboarding_completed: true, updated_at: new Date().toISOString() })
    .eq('id', userId);

  return data;
}

export async function getActiveFitnessProfile(
  userId: string
): Promise<DbFitnessProfile | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('fitness_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data;
}
