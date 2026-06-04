const PHONE_EMAIL_DOMAIN = 'phone.fitai.app';

export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');

  if (digits.startsWith('98') && digits.length === 12) {
    return digits;
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return `98${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith('9')) {
    return `98${digits}`;
  }

  throw new Error('شماره موبایل نامعتبر است');
}

export function phoneToDisplay(phone: string): string {
  if (phone.startsWith('98') && phone.length === 12) {
    return `0${phone.slice(2)}`;
  }
  return phone;
}

export function phoneToEmail(phone: string): string {
  return `${phone}@${PHONE_EMAIL_DOMAIN}`;
}

export function isValidIranPhone(raw: string): boolean {
  try {
    normalizePhone(raw);
    return true;
  } catch {
    return false;
  }
}

export function phoneToKavenegarReceptor(phone: string): string {
  return phoneToDisplay(phone);
}
