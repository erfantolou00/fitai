import { createAdminClient } from '@/app/lib/supabase/admin';
import {
  generateOtpCode,
  getOtpExpiry,
  hashOtp,
  isOtpExpired,
  MAX_ATTEMPTS,
} from '@/app/lib/auth/otp';
import { sendOtpSms } from '@/app/lib/kavenegar/sms';

export async function createAndSendOtp(phone: string): Promise<void> {
  const admin = createAdminClient();
  const code = generateOtpCode();
  const codeHash = hashOtp(code, phone);
  const expiresAt = getOtpExpiry();

  await admin
    .from('otp_verifications')
    .update({ verified: true })
    .eq('phone', phone)
    .eq('verified', false);

  const { error } = await admin.from('otp_verifications').insert({
    phone,
    code_hash: codeHash,
    expires_at: expiresAt.toISOString(),
  });

  if (error) throw error;

  if (process.env.NODE_ENV === 'development' && !process.env.KAVENEGAR_API_KEY) {
    console.log(`[DEV OTP] phone=${phone} code=${code}`);
    return;
  }

  await sendOtpSms({ phone, code });
}

export async function verifyOtpCode(
  phone: string,
  code: string
): Promise<boolean> {
  const admin = createAdminClient();

  const { data: record, error } = await admin
    .from('otp_verifications')
    .select('*')
    .eq('phone', phone)
    .eq('verified', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !record) return false;
  if (isOtpExpired(record.expires_at)) return false;
  if (record.attempts >= MAX_ATTEMPTS) return false;

  const isValid = record.code_hash === hashOtp(code, phone);

  await admin
    .from('otp_verifications')
    .update({
      attempts: record.attempts + 1,
      verified: isValid,
    })
    .eq('id', record.id);

  return isValid;
}
