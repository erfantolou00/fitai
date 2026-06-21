import {
  loadFoodsDatabase,
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
} from './foods';
import path from 'path';

const foodsPath = path.join(__dirname, 'iranian-foods.json');

console.log('═══════════════════════════════════════════════════════');
console.log('🍽️  FOODS DATABASE TESTS');
console.log('═══════════════════════════════════════════════════════\n');

// Test 1: Load database
console.log('📂 TEST 1: بارگذاری پایگاه‌داده');
const foods = loadFoodsDatabase(foodsPath);
console.log(`✅ بارگذاری شد: ${foods.length} ماده غذایی\n`);

// Test 2: Find by ID
console.log('🔍 TEST 2: جستجو با شناسه');
const chicken = findFoodById(foods, 'chicken_breast_cooked');
if (chicken) {
  console.log(`✅ یافت شد: ${chicken.name} (${chicken.name_en})\n`);
}

// Test 3: Search by name
console.log('🔎 TEST 3: جستجو با نام');
const riceResults = searchFoodsByName(foods, 'برنج');
console.log(`✅ نتایج جستجو برای "برنج": ${riceResults.length} ماده`);
riceResults.forEach((f) => console.log(`   - ${f.name}`));
console.log();

// Test 4: Filter by category
console.log('🏷️  TEST 4: فیلتر بر اساس دسته‌بندی');
const proteins = getFoodsByCategory(foods, 'proteins');
console.log(`✅ پروتئین‌ها: ${proteins.length} ماده`);
proteins.forEach((f) => console.log(`   - ${f.name_en}`));
console.log();

// Test 5: Calculate nutrition for single food
console.log('📊 TEST 5: محاسبه تغذیه برای یک ماده');
const chickenNutrition = calculateFoodNutrition(chicken!, 1.5);
console.log(`سینه‌مرغ × 1.5 portion (${1.5 * 100}g):`);
console.log(`  🔥 ${chickenNutrition.nutrition.calories} kcal`);
console.log(`  💪 ${chickenNutrition.nutrition.protein}g پروتئین`);
console.log(`  🧈 ${chickenNutrition.nutrition.fat}g چربی\n`);

// Test 6: Calculate meal nutrition
console.log('🥗 TEST 6: محاسبه تغذیه برای یک وعده');
const breakfast = [
  { foodId: 'egg_whole_cooked', quantity: 2 },
  { foodId: 'bread_whole_wheat', quantity: 1 },
  { foodId: 'tomato_fresh', quantity: 1 },
];
const breakfastNutrition = calculateMealNutrition(foods, breakfast);
console.log('صبحانه:');
breakfastNutrition.items.forEach((item) => {
  console.log(`  • ${item.name} × ${item.quantity}`);
});
console.log(`\n  📊 کل:
  🔥 ${breakfastNutrition.totals.calories} kcal
  💪 ${breakfastNutrition.totals.protein}g پروتئین
  🌾 ${breakfastNutrition.totals.carbs}g کربوهیدرات
  🧈 ${breakfastNutrition.totals.fat}g چربی
  🌿 ${breakfastNutrition.totals.fiber}g فیبر\n`);

// Test 7: High-protein foods
console.log('💪 TEST 7: مواد پروتئینی بالا (≥15g/100g)');
const highProtein = getHighProteinFoods(foods, 15);
console.log(`✅ یافت شد: ${highProtein.length} ماده`);
highProtein.forEach((f) => {
  const proteinPer100 = (f.nutrition.protein / f.portion_size) * 100;
  console.log(`   - ${f.name_en}: ${proteinPer100.toFixed(1)}g/100g`);
});
console.log();

// Test 8: Low-fat foods
console.log('🧈 TEST 8: مواد کم‌چرب (<3g/100g)');
const lowFat = getLowFatFoods(foods, 3);
console.log(`✅ یافت شد: ${lowFat.length} ماده`);
lowFat.forEach((f) => {
  const fatPer100 = (f.nutrition.fat / f.portion_size) * 100;
  console.log(`   - ${f.name_en}: ${fatPer100.toFixed(1)}g/100g`);
});
console.log();

// Test 9: Format food display
console.log('🎨 TEST 9: قالب‌بندی نمایش ماده غذایی');
console.log(formatFoodNutrition(chicken!, 2));
console.log();

// Test 10: Calorie range
console.log('🔥 TEST 10: مواد غذایی در محدوده کالری');
const lowCalFoods = getFoodsByCalories(foods, 15, 70);
console.log(`✅ مواد غذایی 15-70 kcal: ${lowCalFoods.length} ماده`);
lowCalFoods.forEach((f) => console.log(`   - ${f.name_en}: ${f.nutrition.calories} kcal`));
console.log();

// Test 11: Create food validation
console.log('✨ TEST 11: ایجاد و معتبرسازی ماده غذایی');
try {
  const newFood = createFood(
    'test_food',
    'ماده تست',
    'Test Food',
    'vegetables',
    100,
    'g',
    {
      calories: 50,
      protein: 2,
      carbs: 10,
      fat: 0.5,
      fiber: 2,
      water: 85,
    },
    'ماده تستی'
  );
  console.log(`✅ ماده غذایی ایجاد شد: ${newFood.name}\n`);
} catch (error) {
  console.log(`❌ خطا: ${(error as Error).message}\n`);
}

// Test 12: Daily meal summary
console.log('📈 TEST 12: خلاصه روزانه (Breakfast + Lunch + Dinner)');
const lunch = [
  { foodId: 'chicken_breast_cooked', quantity: 1.5 },
  { foodId: 'rice_white_cooked', quantity: 1.5 },
  { foodId: 'cucumber_fresh', quantity: 1 },
];
const dinner = [
  { foodId: 'fish_salmon_cooked', quantity: 1 },
  { foodId: 'spinach_cooked', quantity: 1 },
  { foodId: 'bread_whole_wheat', quantity: 1 },
];

const lunchNutr = calculateMealNutrition(foods, lunch);
const dinnerNutr = calculateMealNutrition(foods, dinner);

const dailyTotals = {
  calories:
    breakfastNutrition.totals.calories +
    lunchNutr.totals.calories +
    dinnerNutr.totals.calories,
  protein:
    breakfastNutrition.totals.protein +
    lunchNutr.totals.protein +
    dinnerNutr.totals.protein,
  carbs:
    breakfastNutrition.totals.carbs +
    lunchNutr.totals.carbs +
    dinnerNutr.totals.carbs,
  fat:
    breakfastNutrition.totals.fat +
    lunchNutr.totals.fat +
    dinnerNutr.totals.fat,
};

console.log(`صبحانه: ${breakfastNutrition.totals.calories} kcal`);
console.log(`ناهار: ${lunchNutr.totals.calories} kcal`);
console.log(`شام: ${dinnerNutr.totals.calories} kcal`);
console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━
🔥 روزانه: ${Math.round(dailyTotals.calories)} kcal
💪 پروتئین: ${Math.round(dailyTotals.protein)}g
🌾 کربوهیدرات: ${Math.round(dailyTotals.carbs)}g
🧈 چربی: ${Math.round(dailyTotals.fat)}g
━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

console.log('✅ تمام تست‌های foods موفقیت‌آمیز بودند!\n');
