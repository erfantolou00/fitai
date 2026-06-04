/**
 * DISABLED — Phone OTP auth via Kavenegar
 * Classic username/password auth is active.
 * See: app/lib/auth/credentials.ts
 */

/*
import { createAdminClient } from '@/app/lib/supabase/admin';
import { phoneToEmail } from '@/app/lib/auth/phone';
import { upsertProfile } from '@/app/lib/db/profiles';

export async function signInOrCreatePhoneUser(
  phone: string,
  fullName: string
): Promise<{ userId: string; email: string; tokenHash: string }> {
  const admin = createAdminClient();
  const email = phoneToEmail(phone);

  let linkData = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  });

  if (linkData.error) {
    const { error: createError } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {
        phone,
        full_name: fullName,
        auth_provider: 'phone',
      },
    });

    if (createError) throw createError;

    linkData = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    if (linkData.error || !linkData.data.properties.hashed_token) {
      throw linkData.error ?? new Error('خطا در ایجاد نشست');
    }
  } else {
    await admin.auth.admin.updateUserById(linkData.data.user.id, {
      user_metadata: {
        phone,
        full_name: fullName,
        auth_provider: 'phone',
      },
    });
  }

  const userId = linkData.data.user.id;
  const tokenHash = linkData.data.properties.hashed_token;

  if (!tokenHash) throw new Error('خطا در ایجاد نشست');

  await upsertProfile(userId, {
    phone,
    full_name: fullName,
    auth_provider: 'phone',
  });

  return { userId, email, tokenHash };
}
*/
