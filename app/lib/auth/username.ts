import { isValidIranPhone, normalizePhone, phoneToEmail } from '@/app/lib/auth/phone';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type UsernameType = 'email' | 'phone';

export interface ResolvedUsername {
  authEmail: string;
  username: string;
  type: UsernameType;
  phone: string | null;
  email: string | null;
}

export function isEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function resolveUsername(raw: string): ResolvedUsername {
  const trimmed = raw.trim();

  if (!trimmed) {
    throw new Error('نام کاربری الزامی است');
  }

  if (isEmail(trimmed)) {
    const email = trimmed.toLowerCase();
    return {
      authEmail: email,
      username: email,
      type: 'email',
      phone: null,
      email,
    };
  }

  if (!isValidIranPhone(trimmed)) {
    throw new Error('نام کاربری باید ایمیل یا شماره موبایل معتبر باشد');
  }

  const phone = normalizePhone(trimmed);
  return {
    authEmail: phoneToEmail(phone),
    username: phone,
    type: 'phone',
    phone,
    email: null,
  };
}

export function validatePassword(password: string): string | null {
  if (password.length < 6) {
    return 'رمز عبور باید حداقل ۶ کاراکتر باشد';
  }
  return null;
}

export function usernameToDisplay(username: string): string {
  if (username.startsWith('98') && username.length === 12) {
    return `0${username.slice(2)}`;
  }
  return username;
}
