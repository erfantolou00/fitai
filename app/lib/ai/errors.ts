export type AIErrorCode =
  | 'quota_exhausted'
  | 'unauthorized'
  | 'unconfigured'
  | 'rate_limited'
  | 'unknown';

export class AIProviderError extends Error {
  readonly code: AIErrorCode;
  readonly status: number;

  constructor(message: string, code: AIErrorCode, status = 503) {
    super(message);
    this.name = 'AIProviderError';
    this.code = code;
    this.status = status;
  }
}

export function parseAIError(error: unknown): AIProviderError {
  if (error instanceof AIProviderError) return error;

  const err = error as { message?: string; status?: number; error?: { message?: string } };
  const msg =
    err?.error?.message ?? err?.message ?? String(error);
  const status = err?.status;

  if (msg.includes('GAPGPT_API_KEY') || msg.includes('not configured')) {
    return new AIProviderError(
      'سرویس AI پیکربندی نشده. کلید GAPGPT_API_KEY در .env.local تنظیم نشده.',
      'unconfigured',
      503
    );
  }

  if (
    msg.includes('quota exhausted') ||
    msg.includes('insufficient_quota') ||
    msg.includes('billing')
  ) {
    return new AIProviderError(
      'سهمیه API تمام شده. حساب GapGPT را شارژ کنید یا API key جدید در .env.local قرار دهید.',
      'quota_exhausted',
      503
    );
  }

  if (status === 401 || msg.includes('invalid') || msg.includes('Incorrect API key')) {
    return new AIProviderError(
      'API key نامعتبر است. کلید GAPGPT_API_KEY را بررسی کنید.',
      'unauthorized',
      401
    );
  }

  if (status === 429 || msg.includes('rate limit')) {
    return new AIProviderError(
      'تعداد درخواست‌ها زیاد است. چند دقیقه صبر کنید و دوباره تلاش کنید.',
      'rate_limited',
      429
    );
  }

  return new AIProviderError(
    'خطا در ارتباط با سرویس هوش مصنوعی. لطفاً دوباره تلاش کنید.',
    'unknown',
    503
  );
}
