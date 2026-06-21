import type { UserProfile as FitnessProfile } from '@/app/types/user';
import type {
  ActivityLevel,
  Goal as NutritionGoal,
  UserProfile as NutritionProfile,
} from '@/app/nutrition/nutrition';

export function mapActivityLevel(daysPerWeek: number): ActivityLevel {
  if (daysPerWeek <= 1) return 'sedentary';
  if (daysPerWeek <= 2) return 'light';
  if (daysPerWeek <= 4) return 'moderate';
  if (daysPerWeek <= 5) return 'active';
  return 'veryActive';
}

export function mapFitnessGoalToNutritionGoal(
  goal: FitnessProfile['goal']
): NutritionGoal {
  switch (goal) {
    case 'fat_loss':
      return 'cut';
    case 'muscle_gain':
    case 'strength':
      return 'bulk';
    default:
      return 'maintain';
  }
}

export function mapFitnessToNutritionProfile(
  fitness: FitnessProfile
): NutritionProfile {
  return {
    gender: fitness.gender,
    age: fitness.age,
    weight: fitness.currentWeight,
    height: fitness.height,
    activityLevel: mapActivityLevel(fitness.daysPerWeek),
  };
}

export const FOOD_CATEGORY_LABELS: Record<string, string> = {
  grains: 'غلات',
  legumes: 'حبوبات',
  proteins: 'پروتئین‌ها',
  dairy: 'لبنیات',
  vegetables: 'سبزیجات',
  fruits: 'میوه‌ها',
  nuts: 'آجیل و دانه‌ها',
  oils: 'روغن‌ها',
  condiments: 'چاشنی‌ها',
};

export const NUTRITION_GOAL_LABELS: Record<NutritionGoal, string> = {
  bulk: 'افزایش حجم',
  cut: 'کاهش چربی',
  maintain: 'تثبیت وزن',
};
