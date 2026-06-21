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

export async function updateProfileFields(
  userId: string,
  fields: Partial<
    Pick<
      DbProfile,
      | 'default_plan_id'
      | 'free_trial_expires_at'
      | 'nutrition_paid'
      | 'paid_plan_credits'
      | 'onboarding_completed'
    >
  >
): Promise<DbProfile> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function setDefaultPlan(
  userId: string,
  planId: string
): Promise<DbProfile> {
  return updateProfileFields(userId, { default_plan_id: planId });
}

export async function grantMockPurchase(
  userId: string,
  product: 'new_plan' | 'nutrition'
): Promise<DbProfile> {
  const profile = await getProfile(userId);
  if (!profile) throw new Error('Profile not found');

  if (product === 'nutrition') {
    return updateProfileFields(userId, { nutrition_paid: true });
  }

  return updateProfileFields(userId, {
    paid_plan_credits: (profile.paid_plan_credits ?? 0) + 1,
  });
}

export async function consumePlanCredit(userId: string): Promise<void> {
  const profile = await getProfile(userId);
  if (!profile) return;

  const credits = profile.paid_plan_credits ?? 0;
  if (credits > 0) {
    await updateProfileFields(userId, { paid_plan_credits: credits - 1 });
  }
}
