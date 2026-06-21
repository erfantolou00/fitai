import { AIResult, UserProfile } from '@/app/types/user';

const KEYS = {
  result: 'fitai_result',
  profile: 'fitai_profile',
  pendingProfile: 'fitai_pending_profile',
} as const;

export function saveResult(result: AIResult, profile: UserProfile): void {
  localStorage.setItem(KEYS.result, JSON.stringify(result));
  localStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

export function loadResult(): AIResult | null {
  try {
    const raw = localStorage.getItem(KEYS.result);
    if (!raw) return null;
    return JSON.parse(raw) as AIResult;
  } catch {
    return null;
  }
}

export function loadProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.profile);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function clearFitaiData(): void {
  localStorage.removeItem(KEYS.result);
  localStorage.removeItem(KEYS.profile);
  localStorage.removeItem(KEYS.pendingProfile);
}

export function savePendingProfile(profile: UserProfile): void {
  localStorage.setItem(KEYS.pendingProfile, JSON.stringify(profile));
}

export function loadPendingProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(KEYS.pendingProfile);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function clearPendingProfile(): void {
  localStorage.removeItem(KEYS.pendingProfile);
}
