/**
 * Nutrition Module - BMR, TDEE, Goals, and Macros calculation
 * Using Mifflin-St Jeor formula for BMR calculation
 */

export type Gender = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
export type Goal = 'bulk' | 'cut' | 'maintain';

export interface UserProfile {
  gender: Gender;
  age: number;
  weight: number; // kg
  height: number; // cm
  activityLevel: ActivityLevel;
}

export interface NutritionPlan {
  bmr: number; // Basal Metabolic Rate (kcal/day)
  tdee: number; // Total Daily Energy Expenditure (kcal/day)
  dailyCalories: number; // Adjusted for goal
  macros: MacroBreakdown;
  goal: Goal;
}

export interface MacroBreakdown {
  protein: {
    grams: number;
    calories: number;
    percentage: number;
  };
  carbs: {
    grams: number;
    calories: number;
    percentage: number;
  };
  fat: {
    grams: number;
    calories: number;
    percentage: number;
  };
}

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2, // Little to no exercise
  light: 1.375, // Exercise 1-3 days/week
  moderate: 1.55, // Exercise 3-5 days/week
  active: 1.725, // Exercise 6-7 days/week
  veryActive: 1.9, // Intense exercise daily or twice a day
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor formula
 * Formula:
 * Male: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
 * Female: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
 */
export function calculateBMR(profile: UserProfile): number {
  const { gender, age, weight, height } = profile;
  const base = 10 * weight + 6.25 * height - 5 * age;

  return gender === 'male' ? base + 5 : base - 161;
}

/**
 * Calculate Total Daily Energy Expenditure
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
  return Math.round(bmr * multiplier);
}

/**
 * Calculate daily caloric needs adjusted for goal
 * Bulk: +300-500 kcal
 * Cut: -300-500 kcal
 * Maintain: no change
 */
export function calculateAdjustedCalories(
  tdee: number,
  goal: Goal,
  adjustmentValue: number = 400
): number {
  switch (goal) {
    case 'bulk':
      return tdee + adjustmentValue;
    case 'cut':
      return tdee - adjustmentValue;
    case 'maintain':
    default:
      return tdee;
  }
}

/**
 * Calculate macronutrient breakdown
 * Default ratios:
 * - Protein: 30% (1.6-2.2g per kg body weight)
 * - Carbs: 45%
 * - Fat: 25% (0.8-1.2g per kg body weight)
 */
export function calculateMacros(
  dailyCalories: number,
  weight: number,
  proteinRatio: number = 0.3,
  carbRatio: number = 0.45,
  fatRatio: number = 0.25
): MacroBreakdown {
  // Validate ratios sum to 1
  const totalRatio = proteinRatio + carbRatio + fatRatio;
  if (Math.abs(totalRatio - 1) > 0.01) {
    throw new Error('Macro ratios must sum to 1.0 (they sum to ' + totalRatio + ')');
  }

  const proteinCalories = dailyCalories * proteinRatio;
  const carbsCalories = dailyCalories * carbRatio;
  const fatCalories = dailyCalories * fatRatio;

  // 1g protein = 4 kcal, 1g carbs = 4 kcal, 1g fat = 9 kcal
  const proteinGrams = proteinCalories / 4;
  const carbsGrams = carbsCalories / 4;
  const fatGrams = fatCalories / 9;

  return {
    protein: {
      grams: Math.round(proteinGrams * 10) / 10,
      calories: Math.round(proteinCalories),
      percentage: Math.round(proteinRatio * 100),
    },
    carbs: {
      grams: Math.round(carbsGrams * 10) / 10,
      calories: Math.round(carbsCalories),
      percentage: Math.round(carbRatio * 100),
    },
    fat: {
      grams: Math.round(fatGrams * 10) / 10,
      calories: Math.round(fatCalories),
      percentage: Math.round(fatRatio * 100),
    },
  };
}

/**
 * Generate complete nutrition plan for a user
 */
export function generateNutritionPlan(
  profile: UserProfile,
  goal: Goal,
  calorieAdjustment: number = 400,
  macroRatios?: {
    protein?: number;
    carbs?: number;
    fat?: number;
  }
): NutritionPlan {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const dailyCalories = calculateAdjustedCalories(tdee, goal, calorieAdjustment);

  const macros = calculateMacros(
    dailyCalories,
    profile.weight,
    macroRatios?.protein ?? 0.3,
    macroRatios?.carbs ?? 0.45,
    macroRatios?.fat ?? 0.25
  );

  return {
    bmr: Math.round(bmr),
    tdee,
    dailyCalories,
    macros,
    goal,
  };
}

/**
 * Format nutrition plan for display (Persian-friendly)
 */
export function formatNutritionPlan(plan: NutritionPlan): string {
  return `
📊 برنامه تغذیهای

🔥 کالری روزانه: ${plan.dailyCalories} kcal
   BMR: ${plan.bmr} | TDEE: ${plan.tdee} | هدف: ${plan.goal}

💪 پروتئین: ${plan.macros.protein.grams}g (${plan.macros.protein.percentage}%)
🌾 کربوهیدرات: ${plan.macros.carbs.grams}g (${plan.macros.carbs.percentage}%)
🧈 چربی: ${plan.macros.fat.grams}g (${plan.macros.fat.percentage}%)
  `.trim();
}
