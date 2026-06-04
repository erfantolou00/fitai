import { phoneToKavenegarReceptor } from '@/app/lib/auth/phone';

/**
 * DISABLED — Kavenegar SMS (OTP auth is commented out)
 * Kept for future re-enablement.
 */

interface SendOtpSmsOptions {
  phone: string;
  code: string;
}

export async function sendOtpSms({ phone, code }: SendOtpSmsOptions): Promise<void> {
  const apiKey = process.env.KAVENEGAR_API_KEY;
  if (!apiKey) {
    throw new Error('KAVENEGAR_API_KEY is not configured');
  }

  const receptor = phoneToKavenegarReceptor(phone);
  const template = process.env.KAVENEGAR_TEMPLATE;

  if (template) {
    const params = new URLSearchParams({
      receptor,
      token: code,
      template,
    });

    const res = await fetch(
      `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json?${params}`,
      { method: 'GET' }
    );

    const data = await res.json();
    if (!res.ok || data.return?.status !== 200) {
      throw new Error(data.return?.message ?? 'خطا در ارسال پیامک');
    }
    return;
  }

  const message = `کد تایید فیتار: ${code}\nاین کد تا ۵ دقیقه معتبر است.`;
  const params = new URLSearchParams({
    receptor,
    message,
  });

  const sender = process.env.KAVENEGAR_SENDER;
  if (sender) params.set('sender', sender);

  const res = await fetch(
    `https://api.kavenegar.com/v1/${apiKey}/sms/send.json?${params}`,
    { method: 'GET' }
  );

  const data = await res.json();
  if (!res.ok || data.return?.status !== 200) {
    throw new Error(data.return?.message ?? 'خطا در ارسال پیامک');
  }
}
