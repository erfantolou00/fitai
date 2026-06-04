import { createAdminClient } from '@/app/lib/supabase/admin';
import { DbProfile } from '@/app/types/database';

export async function getProfile(userId: string): Promise<DbProfile | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertProfile(
  userId: string,
  fields: Partial<
    Pick<
      DbProfile,
      | 'full_name'
      | 'username'
      | 'phone'
      | 'email'
      | 'avatar_url'
      | 'auth_provider'
      | 'onboarding_completed'
    >
  >
): Promise<DbProfile> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProfileByPhone(phone: string): Promise<DbProfile | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .select('*')
    .eq('phone', phone)
    .maybeSingle();

  if (error) throw error;
  return data;
}
