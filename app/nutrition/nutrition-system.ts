/**
 * Nutrition System Integration
 * Complete system combining nutrition planning and food database
 */

import { generateNutritionPlan, type UserProfile, type Goal, type NutritionPlan } from './nutrition';
import {
  loadFoodsDatabase,
  searchFoodsByName,
  calculateMealNutrition,
  getHighProteinFoods,
  getLowFatFoods,
  type Food,
} from './foods';

export interface NutritionSystem {
  userProfile: UserProfile;
  nutritionPlan: NutritionPlan;
  foods: Food[];
  recommendedFoods: {
    highProtein: Food[];
    lowFat: Food[];
  };
}

export interface MealPlan {
  date: string;
  meals: {
    breakfast: Array<{ foodId: string; quantity: number }>;
    lunch: Array<{ foodId: string; quantity: number }>;
    dinner: Array<{ foodId: string; quantity: number }>;
    snacks: Array<{ foodId: string; quantity: number }>;
  };
}

/**
 * Initialize the nutrition system
 */
export function initializeNutritionSystem(
  userProfile: UserProfile,
  goal: Goal,
  foodsFilePath: string,
  calorieAdjustment: number = 400
): NutritionSystem {
  const nutritionPlan = generateNutritionPlan(userProfile, goal, calorieAdjustment);
  const foods = loadFoodsDatabase(foodsFilePath);

  const recommendedFoods = {
    highProtein: getHighProteinFoods(foods, 15),
    lowFat: getLowFatFoods(foods, 5),
  };

  return {
    userProfile,
    nutritionPlan,
    foods,
    recommendedFoods,
  };
}

/**
 * Get food recommendations based on nutrition goals
 */
export function getFoodRecommendations(
  system: NutritionSystem,
  query: string
) {
  const results = searchFoodsByName(system.foods, query);
  return results.map((food) => ({
    food,
    macroMatch: calculateMacroAlignment(food, system.nutritionPlan),
  }));
}

/**
 * Calculate how well a food aligns with current goals
 */
function calculateMacroAlignment(
  food: Food,
  plan: NutritionPlan
): {
  proteinScore: number;
  score: string;
} {
  const proteinPer100 = (food.nutrition.protein / food.portion_size) * 100;
  const fatPer100 = (food.nutrition.fat / food.portion_size) * 100;

  // Bulk: prefer high protein
  // Cut: prefer high protein, low fat
  // Maintain: balanced

  let proteinScore = Math.min(100, (proteinPer100 / 25) * 100);

  if (plan.goal === 'cut') {
    const fatScore = Math.max(0, 100 - (fatPer100 / 20) * 100);
    proteinScore = (proteinScore + fatScore) / 2;
  }

  return {
    proteinScore: Math.round(proteinScore),
    score: proteinScore > 75 ? '⭐⭐⭐' : proteinScore > 50 ? '⭐⭐' : '⭐',
  };
}

/**
 * Analyze meal against nutrition plan
 */
export function analyzeMeal(
  system: NutritionSystem,
  mealItems: Array<{ foodId: string; quantity: number }>
) {
  const mealNutrition = calculateMealNutrition(system.foods, mealItems);

  const macroAlignment = {
    proteinRatio:
      (mealNutrition.totals.protein * 4) / (mealNutrition.totals.calories || 1),
    carbRatio:
      (mealNutrition.totals.carbs * 4) / (mealNutrition.totals.calories || 1),
    fatRatio:
      (mealNutrition.totals.fat * 9) / (mealNutrition.totals.calories || 1),
  };

  const goalAlignment = {
    proteinTarget: system.nutritionPlan.macros.protein.grams,
    caloriesPerMeal: Math.round(system.nutritionPlan.dailyCalories / 3),
    actualCalories: mealNutrition.totals.calories,
    caloriePercentage: Math.round(
      (mealNutrition.totals.calories / (system.nutritionPlan.dailyCalories / 3)) * 100
    ),
  };

  return {
    nutrition: mealNutrition,
    macroAlignment,
    goalAlignment,
  };
}

/**
 * Generate daily meal plan summary
 */
export function generateDailyPlanSummary(
  system: NutritionSystem,
  mealPlan: MealPlan
) {
  const breakfastAnalysis = analyzeMeal(system, mealPlan.meals.breakfast);
  const lunchAnalysis = analyzeMeal(system, mealPlan.meals.lunch);
  const dinnerAnalysis = analyzeMeal(system, mealPlan.meals.dinner);
  const snackAnalysis = analyzeMeal(system, mealPlan.meals.snacks);

  const dailyTotals = {
    calories:
      breakfastAnalysis.nutrition.totals.calories +
      lunchAnalysis.nutrition.totals.calories +
      dinnerAnalysis.nutrition.totals.calories +
      snackAnalysis.nutrition.totals.calories,
    protein:
      breakfastAnalysis.nutrition.totals.protein +
      lunchAnalysis.nutrition.totals.protein +
      dinnerAnalysis.nutrition.totals.protein +
      snackAnalysis.nutrition.totals.protein,
    carbs:
      breakfastAnalysis.nutrition.totals.carbs +
      lunchAnalysis.nutrition.totals.carbs +
      dinnerAnalysis.nutrition.totals.carbs +
      snackAnalysis.nutrition.totals.carbs,
    fat:
      breakfastAnalysis.nutrition.totals.fat +
      lunchAnalysis.nutrition.totals.fat +
      dinnerAnalysis.nutrition.totals.fat +
      snackAnalysis.nutrition.totals.fat,
    fiber:
      breakfastAnalysis.nutrition.totals.fiber +
      lunchAnalysis.nutrition.totals.fiber +
      dinnerAnalysis.nutrition.totals.fiber +
      snackAnalysis.nutrition.totals.fiber,
  };

  const targetAlignment = {
    calorieTarget: system.nutritionPlan.dailyCalories,
    calorieActual: Math.round(dailyTotals.calories),
    caloriePercentage: Math.round(
      (dailyTotals.calories / system.nutritionPlan.dailyCalories) * 100
    ),
    proteinTarget: system.nutritionPlan.macros.protein.grams,
    proteinActual: Math.round(dailyTotals.protein),
    proteinPercentage: Math.round(
      (dailyTotals.protein / system.nutritionPlan.macros.protein.grams) * 100
    ),
  };

  return {
    date: mealPlan.date,
    meals: {
      breakfast: breakfastAnalysis,
      lunch: lunchAnalysis,
      dinner: dinnerAnalysis,
      snacks: snackAnalysis,
    },
    dailyTotals: {
      nutrition: dailyTotals,
      alignment: targetAlignment,
    },
  };
}

/**
 * Format daily plan for display
 */
export function formatDailyPlan(summary: ReturnType<typeof generateDailyPlanSummary>): string {
  const {
    meals,
    dailyTotals: { nutrition, alignment },
  } = summary;

  return `
📋 برنامه غذایی روزانه - ${summary.date}

🍳 صبحانه: ${meals.breakfast.nutrition.totals.calories} kcal | 💪 ${meals.breakfast.nutrition.totals.protein}g
🍽️  ناهار:  ${meals.lunch.nutrition.totals.calories} kcal | 💪 ${meals.lunch.nutrition.totals.protein}g
🍽️  شام:   ${meals.dinner.nutrition.totals.calories} kcal | 💪 ${meals.dinner.nutrition.totals.protein}g
🥤 میان‌وعده: ${meals.snacks.nutrition.totals.calories} kcal | 💪 ${meals.snacks.nutrition.totals.protein}g

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 خلاصه روزانه

🔥 کالری:
   هدف: ${alignment.calorieTarget} kcal
   واقعی: ${alignment.calorieActual} kcal (${alignment.caloriePercentage}%)

💪 پروتئین:
   هدف: ${alignment.proteinTarget}g
   واقعی: ${alignment.proteinActual}g (${alignment.proteinPercentage}%)

🌾 کربوهیدرات: ${Math.round(nutrition.carbs)}g
🧈 چربی: ${Math.round(nutrition.fat)}g
🌿 فیبر: ${Math.round(nutrition.fiber)}g

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `.trim();
}
