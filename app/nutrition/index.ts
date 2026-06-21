/**
 * Nutrition Module - Main Export
 * Complete nutrition system for BMR, TDEE, macro calculation and meal planning
 */

// Core nutrition calculations
export {
  calculateBMR,
  calculateTDEE,
  calculateAdjustedCalories,
  calculateMacros,
  generateNutritionPlan,
  formatNutritionPlan,
  type Gender,
  type ActivityLevel,
  type Goal,
  type UserProfile,
  type NutritionPlan,
  type MacroBreakdown,
} from './nutrition';

// Food database utilities
export {
  loadFoodsDatabase,
  saveFoodsDatabase,
  findFoodById,
  searchFoodsByName,
  getFoodsByCategory,
  calculateFoodNutrition,
  calculateMealNutrition,
  getHighProteinFoods,
  getLowFatFoods,
  formatFoodNutrition,
  getFoodsByCalories,
  createFood,
  type Food,
  type MealEntry,
  type FoodDatabase,
} from './foods';

// Complete nutrition system
export {
  initializeNutritionSystem,
  getFoodRecommendations,
  analyzeMeal,
  generateDailyPlanSummary,
  formatDailyPlan,
  type NutritionSystem,
  type MealPlan,
} from './nutrition-system';
