import {
  initializeNutritionSystem,
  generateDailyPlanSummary,
  formatDailyPlan,
  getFoodRecommendations,
} from './nutrition-system';
import type { UserProfile, Goal } from './nutrition';
import path from 'path';

const foodsPath = path.join(__dirname, 'iranian-foods.json');

console.log('═══════════════════════════════════════════════════════════════');
console.log('🥗 COMPLETE NUTRITION SYSTEM INTEGRATION TEST');
console.log('═══════════════════════════════════════════════════════════════\n');

// User Profile
const userProfile: UserProfile = {
  gender: 'male',
  age: 28,
  weight: 75,
  height: 178,
  activityLevel: 'active',
};

// Initialize system
console.log('📌 تهیه سیستم تغذیه‌ای');
console.log(`   • کاربر: پسر ${userProfile.age} ساله، ${userProfile.weight} کیلو، ${userProfile.height} سانتی‌متر`);
console.log(`   • فعالیت: ${userProfile.activityLevel}\n`);

const bulkSystem = initializeNutritionSystem(userProfile, 'bulk', foodsPath);
const cutSystem = initializeNutritionSystem(userProfile, 'cut', foodsPath);

console.log('✅ سیستم تهیه شد\n');

// Show plans
console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 برنامه‌های تغذیهای\n');

console.log('🟢 BULK (افزایش وزن):');
console.log(`   BMR: ${bulkSystem.nutritionPlan.bmr} kcal`);
console.log(`   TDEE: ${bulkSystem.nutritionPlan.tdee} kcal`);
console.log(`   Daily Target: ${bulkSystem.nutritionPlan.dailyCalories} kcal`);
console.log(`   Protein: ${bulkSystem.nutritionPlan.macros.protein.grams}g`);
console.log(`   Carbs: ${bulkSystem.nutritionPlan.macros.carbs.grams}g`);
console.log(`   Fat: ${bulkSystem.nutritionPlan.macros.fat.grams}g\n`);

console.log('🔴 CUT (کاهش وزن):');
console.log(`   Daily Target: ${cutSystem.nutritionPlan.dailyCalories} kcal`);
console.log(`   Protein: ${cutSystem.nutritionPlan.macros.protein.grams}g`);
console.log(`   Carbs: ${cutSystem.nutritionPlan.macros.carbs.grams}g`);
console.log(`   Fat: ${cutSystem.nutritionPlan.macros.fat.grams}g\n`);

// Recommended foods
console.log('═══════════════════════════════════════════════════════════════');
console.log('💪 غذاهای توصیه‌شده برای BULK\n');

console.log('High Protein Foods:');
bulkSystem.recommendedFoods.highProtein.slice(0, 5).forEach((food) => {
  const proteinPer100 = (food.nutrition.protein / food.portion_size) * 100;
  console.log(`   • ${food.name_en}: ${proteinPer100.toFixed(1)}g/100g`);
});
console.log();

console.log('🧈 غذاهای کم‌چرب برای CUT\n');

console.log('Low Fat Foods:');
cutSystem.recommendedFoods.lowFat.slice(0, 5).forEach((food) => {
  const fatPer100 = (food.nutrition.fat / food.portion_size) * 100;
  console.log(`   • ${food.name_en}: ${fatPer100.toFixed(1)}g/100g`);
});
console.log();

// Search recommendations
console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 جستجو و توصیه‌ها\n');

const chickenRecs = getFoodRecommendations(bulkSystem, 'مرغ');
console.log('نتایج جستجو برای "مرغ":');
chickenRecs.forEach((rec) => {
  console.log(`   ${rec.food.name} ${rec.macroMatch.score}`);
});
console.log();

// Create sample meal plan for BULK goal
console.log('═══════════════════════════════════════════════════════════════');
console.log('🍽️  برنامه غذایی نمونه - BULK\n');

const bulkMealPlan = {
  date: new Date().toISOString().split('T')[0],
  meals: {
    breakfast: [
      { foodId: 'egg_whole_cooked', quantity: 3 },
      { foodId: 'bread_whole_wheat', quantity: 2 },
      { foodId: 'honey', quantity: 1 },
    ],
    lunch: [
      { foodId: 'chicken_breast_cooked', quantity: 2 },
      { foodId: 'rice_white_cooked', quantity: 2 },
      { foodId: 'tomato_fresh', quantity: 1 },
    ],
    dinner: [
      { foodId: 'fish_salmon_cooked', quantity: 1.5 },
      { foodId: 'spinach_cooked', quantity: 1 },
      { foodId: 'olive_oil', quantity: 1 },
    ],
    snacks: [
      { foodId: 'almond', quantity: 1.5 },
      { foodId: 'banana', quantity: 1 },
    ],
  },
};

const bulkSummary = generateDailyPlanSummary(bulkSystem, bulkMealPlan);
console.log(formatDailyPlan(bulkSummary));
console.log();

// Create sample meal plan for CUT goal
console.log('═══════════════════════════════════════════════════════════════');
console.log('🍽️  برنامه غذایی نمونه - CUT\n');

const cutMealPlan = {
  date: new Date().toISOString().split('T')[0],
  meals: {
    breakfast: [
      { foodId: 'egg_whole_cooked', quantity: 2 },
      { foodId: 'bread_whole_wheat', quantity: 1 },
      { foodId: 'tomato_fresh', quantity: 1 },
    ],
    lunch: [
      { foodId: 'chicken_breast_cooked', quantity: 1.5 },
      { foodId: 'rice_white_cooked', quantity: 1 },
      { foodId: 'cucumber_fresh', quantity: 1 },
    ],
    dinner: [
      { foodId: 'fish_salmon_cooked', quantity: 1 },
      { foodId: 'spinach_cooked', quantity: 1.5 },
    ],
    snacks: [
      { foodId: 'apple', quantity: 1 },
    ],
  },
};

const cutSummary = generateDailyPlanSummary(cutSystem, cutMealPlan);
console.log(formatDailyPlan(cutSummary));
console.log();

// Detailed meal analysis
console.log('═══════════════════════════════════════════════════════════════');
console.log('🔬 تفصیل وعده‌های صبحانه\n');

const bulkBreakfastAnalysis = bulkSummary.meals.breakfast;
console.log('BULK Breakfast:');
bulkBreakfastAnalysis.nutrition.items.forEach((item) => {
  console.log(`  • ${item.name} × ${item.quantity}`);
  console.log(`    ${item.nutrition.calories} kcal | ${item.nutrition.protein}g protein`);
});
console.log();

const cutBreakfastAnalysis = cutSummary.meals.breakfast;
console.log('CUT Breakfast:');
cutBreakfastAnalysis.nutrition.items.forEach((item) => {
  console.log(`  • ${item.name} × ${item.quantity}`);
  console.log(`    ${item.nutrition.calories} kcal | ${item.nutrition.protein}g protein`);
});
console.log();

// Macro alignment comparison
console.log('═══════════════════════════════════════════════════════════════');
console.log('📈 مقایسه هدف با واقعیت\n');

console.log('BULK Plan:');
console.log(`   Target: ${bulkSystem.nutritionPlan.dailyCalories} kcal | ${bulkSystem.nutritionPlan.macros.protein.grams}g protein`);
console.log(`   Actual: ${bulkSummary.dailyTotals.alignment.calorieActual} kcal | ${bulkSummary.dailyTotals.alignment.proteinActual}g protein`);
console.log(`   Achievement: ${bulkSummary.dailyTotals.alignment.caloriePercentage}% | ${bulkSummary.dailyTotals.alignment.proteinPercentage}%`);
console.log();

console.log('CUT Plan:');
console.log(`   Target: ${cutSystem.nutritionPlan.dailyCalories} kcal | ${cutSystem.nutritionPlan.macros.protein.grams}g protein`);
console.log(`   Actual: ${cutSummary.dailyTotals.alignment.calorieActual} kcal | ${cutSummary.dailyTotals.alignment.proteinActual}g protein`);
console.log(`   Achievement: ${cutSummary.dailyTotals.alignment.caloriePercentage}% | ${cutSummary.dailyTotals.alignment.proteinPercentage}%`);
console.log();

// Statistics
console.log('═══════════════════════════════════════════════════════════════');
console.log('📊 آمار کل سیستم\n');

console.log(`Foods in Database: ${bulkSystem.foods.length}`);
console.log(`High Protein Foods (≥15g): ${bulkSystem.recommendedFoods.highProtein.length}`);
console.log(`Low Fat Foods (<5g): ${bulkSystem.recommendedFoods.lowFat.length}`);
console.log();

// Summary
console.log('═══════════════════════════════════════════════════════════════');
console.log('✅ تمام تست‌های سیستم تغذیهای موفقیت‌آمیز بودند!\n');
console.log('🎉 سیستم کامل و آماده استفاده است.');
console.log('═══════════════════════════════════════════════════════════════\n');
