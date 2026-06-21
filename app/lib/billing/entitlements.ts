import { FREE_TRIAL_DAYS } from '@/app/lib/billing/products';
import { countWorkoutPlans } from '@/app/lib/db/workout-plans';
import { getProfile } from '@/app/lib/db/profiles';
import { DbProfile } from '@/app/types/database';
import { UserProfile } from '@/app/types/user';
import type { CheckoutProduct } from '@/app/lib/billing/products';

export interface Entitlements {
  isLoggedIn: boolean;
  planCount: number;
  defaultPlanId: string | null;
  freeTrialExpiresAt: string | null;
  isTrialActive: boolean;
  nutritionPaid: boolean;
  paidPlanCredits: number;
  canCreateFreePlan: boolean;
  canCreatePlan: boolean;
  canUseNutrition: boolean;
}

export interface AnalyzeGateResult {
  allowed: boolean;
  code?:
    | 'login_required'
    | 'payment_required'
    | 'trial_expired';
  product?: CheckoutProduct;
  message?: string;
}

function isTrialActive(profile: DbProfile | null): boolean {
  if (!profile?.free_trial_expires_at) return true;
  return new Date(profile.free_trial_expires_at) > new Date();
}

export async function getEntitlements(userId: string | null): Promise<Entitlements> {
  if (!userId) {
    return {
      isLoggedIn: false,
      planCount: 0,
      defaultPlanId: null,
      freeTrialExpiresAt: null,
      isTrialActive: true,
      nutritionPaid: false,
      paidPlanCredits: 0,
      canCreateFreePlan: true,
      canCreatePlan: true,
      canUseNutrition: false,
    };
  }

  const [profile, planCount] = await Promise.all([
    getProfile(userId),
    countWorkoutPlans(userId),
  ]);

  const trialActive = isTrialActive(profile);
  const nutritionPaid = profile?.nutrition_paid ?? false;
  const paidPlanCredits = profile?.paid_plan_credits ?? 0;
  const canCreateFreePlan = planCount === 0;
  const canCreatePlan = canCreateFreePlan || paidPlanCredits > 0;

  return {
    isLoggedIn: true,
    planCount,
    defaultPlanId: profile?.default_plan_id ?? null,
    freeTrialExpiresAt: profile?.free_trial_expires_at ?? null,
    isTrialActive: trialActive,
    nutritionPaid,
    paidPlanCredits,
    canCreateFreePlan,
    canCreatePlan,
    canUseNutrition: nutritionPaid,
  };
}

export async function checkAnalyzeAccess(
  userId: string | null,
  profile: UserProfile
): Promise<AnalyzeGateResult> {
  if (profile.nutritionEnabled) {
    if (!userId) {
      return {
        allowed: false,
        code: 'login_required',
        message: 'برای دریافت برنامه تغذیه باید وارد حسابت شوی',
      };
    }

    const entitlements = await getEntitlements(userId);
    if (!entitlements.nutritionPaid) {
      return {
        allowed: false,
        code: 'payment_required',
        product: 'nutrition',
        message: 'برنامه تغذیه در نسخه رایگان نیست. ابتدا پرداخت را انجام بده.',
      };
    }
  }

  if (!userId) {
    return { allowed: true };
  }

  const entitlements = await getEntitlements(userId);

  if (entitlements.planCount === 0) {
    return { allowed: true };
  }

  if (entitlements.paidPlanCredits > 0) {
    return { allowed: true };
  }

  if (!entitlements.isTrialActive && entitlements.planCount > 0) {
    return {
      allowed: false,
      code: 'trial_expired',
      product: 'new_plan',
      message: 'دوره رایگان یک‌ماهه تمام شده. برای برنامه جدید پرداخت کن.',
    };
  }

  return {
    allowed: false,
    code: 'payment_required',
    product: 'new_plan',
    message: 'برنامه اول رایگان بود. برای ساخت برنامه جدید پرداخت کن.',
  };
}

export function getFreeTrialExpiryDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + FREE_TRIAL_DAYS);
  return d.toISOString();
}
