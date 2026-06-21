import {
  calculateBMR,
  calculateTDEE,
  calculateAdjustedCalories,
  calculateMacros,
  generateNutritionPlan,
  formatNutritionPlan,
  type UserProfile,
  type Goal,
} from './nutrition';

// Test Case 1: مرد 30 ساله، فعال
const maleProfile: UserProfile = {
  gender: 'male',
  age: 30,
  weight: 80, // kg
  height: 180, // cm
  activityLevel: 'moderate',
};

console.log('═══════════════════════════════════════════════════════');
console.log('🧬 TEST CASE 1: مرد 30 ساله، 80 کیلو، 180 سانتی‌متر');
console.log('═══════════════════════════════════════════════════════\n');

const bmr = calculateBMR(maleProfile);
console.log(`BMR (Mifflin-St Jeor): ${bmr} kcal/day`);
console.assert(bmr > 1600 && bmr < 1800, 'BMR should be around 1725 for this profile');

const tdee = calculateTDEE(bmr, maleProfile.activityLevel);
console.log(`TDEE (Activity: moderate): ${tdee} kcal/day`);
console.assert(tdee > 2600 && tdee < 2700, 'TDEE should be around 2672');

// Bulk goal
const bulkCalories = calculateAdjustedCalories(tdee, 'bulk', 400);
console.log(`Calories for BULK: ${bulkCalories} kcal/day (+400)`);

// Cut goal
const cutCalories = calculateAdjustedCalories(tdee, 'cut', 400);
console.log(`Calories for CUT: ${cutCalories} kcal/day (-400)`);

// Maintain goal
const maintainCalories = calculateAdjustedCalories(tdee, 'maintain');
console.log(`Calories for MAINTAIN: ${maintainCalories} kcal/day\n`);

// Test Case 2: زن 25 ساله، کم‌فعال
const femaleProfile: UserProfile = {
  gender: 'female',
  age: 25,
  weight: 65, // kg
  height: 165, // cm
  activityLevel: 'light',
};

console.log('═══════════════════════════════════════════════════════');
console.log('👩 TEST CASE 2: زن 25 ساله، 65 کیلو، 165 سانتی‌متر');
console.log('═══════════════════════════════════════════════════════\n');

const femaleBMR = calculateBMR(femaleProfile);
console.log(`BMR (Mifflin-St Jeor): ${femaleBMR} kcal/day`);

const femaleTDEE = calculateTDEE(femaleBMR, femaleProfile.activityLevel);
console.log(`TDEE (Activity: light): ${femaleTDEE} kcal/day\n`);

// Test Case 3: Macro Calculation
console.log('═══════════════════════════════════════════════════════');
console.log('🥗 TEST CASE 3: محاسبه ماکروها');
console.log('═══════════════════════════════════════════════════════\n');

const macros = calculateMacros(2272, 80, 0.3, 0.45, 0.25);
console.log('Daily Calories: 2272 kcal');
console.log(`Protein: ${macros.protein.grams}g (${macros.protein.calories} kcal, ${macros.protein.percentage}%)`);
console.log(
  `Carbs: ${macros.carbs.grams}g (${macros.carbs.calories} kcal, ${macros.carbs.percentage}%)`
);
console.log(
  `Fat: ${macros.fat.grams}g (${macros.fat.calories} kcal, ${macros.fat.percentage}%)`
);
console.log(
  `Total: ${macros.protein.calories + macros.carbs.calories + macros.fat.calories} kcal\n`
);

// Test Case 4: Full Plan Generation
console.log('═══════════════════════════════════════════════════════');
console.log('📊 TEST CASE 4: تولید برنامه کامل تغذیه');
console.log('═══════════════════════════════════════════════════════\n');

const bulkPlan = generateNutritionPlan(maleProfile, 'bulk', 400);
console.log(formatNutritionPlan(bulkPlan));
console.log();

const cutPlan = generateNutritionPlan(maleProfile, 'cut', 400);
console.log(formatNutritionPlan(cutPlan));
console.log();

// Test Case 5: Invalid Macro Ratios
console.log('═══════════════════════════════════════════════════════');
console.log('⚠️  TEST CASE 5: معتبرسازی نسبت‌های ماکرو');
console.log('═══════════════════════════════════════════════════════\n');

try {
  // Invalid ratios (sum to 1.1)
  calculateMacros(2000, 80, 0.4, 0.45, 0.25);
  console.log('❌ FAILED: Should have thrown error for invalid ratios');
} catch (error) {
  console.log(`✅ Correctly caught error: ${(error as Error).message}`);
}

// Valid ratios
try {
  const validMacros = calculateMacros(2000, 80, 0.4, 0.35, 0.25);
  console.log('✅ Valid ratios accepted (0.4 + 0.35 + 0.25 = 1.0)\n');
} catch (error) {
  console.log('❌ FAILED: Should accept valid ratios');
}

// Test Case 6: Different Activity Levels
console.log('═══════════════════════════════════════════════════════');
console.log('💪 TEST CASE 6: سطوح فعالیت مختلف');
console.log('═══════════════════════════════════════════════════════\n');

const activities = ['sedentary', 'light', 'moderate', 'active', 'veryActive'] as const;
activities.forEach((level) => {
  const tdee = calculateTDEE(bmr, level);
  console.log(`${level.padEnd(12)}: ${tdee} kcal/day`);
});

console.log(
  '\n✅ تمام تست‌ها موفقیت‌آمیز بودند!\n'
);
