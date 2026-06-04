import { createAdminClient } from '@/app/lib/supabase/admin';
import { createClient } from '@/app/lib/supabase/server';
import { upsertProfile } from '@/app/lib/db/profiles';
import { resolveUsername, validatePassword } from '@/app/lib/auth/username';

export async function signUpWithCredentials(
  rawUsername: string,
  password: string,
  fullName: string
): Promise<{ userId: string }> {
  const passwordError = validatePassword(password);
  if (passwordError) throw new Error(passwordError);

  const resolved = resolveUsername(rawUsername);
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email: resolved.authEmail,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName.trim(),
      username: resolved.username,
      phone: resolved.phone,
      email: resolved.email,
      auth_provider: 'password',
    },
  });

  if (error) {
    if (error.message.includes('already been registered')) {
      throw new Error('این نام کاربری قبلاً ثبت شده');
    }
    throw error;
  }

  await upsertProfile(data.user.id, {
    full_name: fullName.trim(),
    username: resolved.username,
    phone: resolved.phone,
    email: resolved.email,
    auth_provider: 'password',
  });

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: resolved.authEmail,
    password,
  });

  if (signInError) throw signInError;

  return { userId: data.user.id };
}

export async function signInWithCredentials(
  rawUsername: string,
  password: string
): Promise<{ userId: string }> {
  const resolved = resolveUsername(rawUsername);
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: resolved.authEmail,
    password,
  });

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      throw new Error('نام کاربری یا رمز عبور اشتباه است');
    }
    throw error;
  }

  if (!data.user) throw new Error('خطا در ورود');

  await upsertProfile(data.user.id, {
    username: resolved.username,
    phone: resolved.phone,
    email: resolved.email,
  });

  return { userId: data.user.id };
}
