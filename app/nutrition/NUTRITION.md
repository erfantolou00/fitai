# 🥗 Nutrition Module (ماژول تغذیه)

A comprehensive TypeScript nutrition system for calculating BMR, TDEE, macro nutrients, and meal planning with Persian food database support.

یک سیستم تغذیه‌ای جامع برای محاسبه BMR، TDEE، ماکروها و برنامه‌ریزی وعده‌های غذایی با پایگاه‌داده غذاهای ایرانی.

---

## 📦 Core Files

### 1. **nutrition.ts** - BMR & TDEE Calculation
محاسبه متابولیسم پایه و مصرف انرژی روزانه

**Key Features:**
- ✅ **Mifflin-St Jeor Formula** for BMR calculation (دقیق‌ترین فرمول)
- ✅ Activity level multipliers (sedentary → very active)
- ✅ Goal-based calorie adjustment (bulk +300-500, cut -300-500)
- ✅ Macro nutrient breakdown (protein 30%, carbs 45%, fat 25%)
- ✅ Customizable macro ratios

**Usage Example:**
```typescript
import { generateNutritionPlan } from './nutrition';

const userProfile = {
  gender: 'male',
  age: 30,
  weight: 80, // kg
  height: 180, // cm
  activityLevel: 'moderate',
};

const plan = generateNutritionPlan(userProfile, 'bulk', 400);
console.log(plan);
// {
//   bmr: 1780,
//   tdee: 2759,
//   dailyCalories: 3159,
//   macros: { protein: {...}, carbs: {...}, fat: {...} },
//   goal: 'bulk'
// }
```

**Types:**
```typescript
type Gender = 'male' | 'female';
type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive';
type Goal = 'bulk' | 'cut' | 'maintain';
```

**Functions:**
- `calculateBMR(profile)` → number
- `calculateTDEE(bmr, activityLevel)` → number
- `calculateAdjustedCalories(tdee, goal, adjustment)` → number
- `calculateMacros(dailyCalories, weight, proteinRatio, carbRatio, fatRatio)` → MacroBreakdown
- `generateNutritionPlan(profile, goal, calorieAdjustment, macroRatios?)` → NutritionPlan
- `formatNutritionPlan(plan)` → string

---

### 2. **iranian-foods.json** - Persian Foods Database
پایگاه‌داده غذاهای ایرانی و جهانی

**Structure:**
```json
[
  {
    "id": "chicken_breast_cooked",
    "name": "سینه مرغ پخته شده",
    "name_en": "Chicken Breast (Cooked)",
    "category": "proteins",
    "portion_size": 100,
    "portion_unit": "g",
    "nutrition": {
      "calories": 165,
      "protein": 31,
      "carbs": 0,
      "fat": 3.6,
      "fiber": 0,
      "water": 65.4
    },
    "notes": "مرغ بدون پوست پخت‌شده"
  }
]
```

**Features:**
- ✅ 21+ Persian/international foods
- ✅ Nutrition per standard portion (100g or 1 serving)
- ✅ Categories: grains, legumes, proteins, dairy, vegetables, fruits, nuts, oils, condiments
- ✅ Bilingual names (Persian + English)
- ✅ Complete macro breakdown

**Categories:**
```
grains (غلات), legumes (حبوبات), proteins (پروتئین‌ها)
dairy (لبنیات), vegetables (سبزیجات), fruits (میوه‌ها)
nuts (آجیل), oils (روغن‌ها), condiments (ادویه و چاشنی)
```

---

### 3. **foods.ts** - Food Database Utilities
ابزارهای مدیریت و جستجوی پایگاه‌داده غذایی

**Key Functions:**
```typescript
// Load and save
loadFoodsDatabase(filePath) → Food[]
saveFoodsDatabase(filePath, foods) → void

// Search and filter
findFoodById(foods, foodId) → Food | null
searchFoodsByName(foods, query) → Food[]
getFoodsByCategory(foods, category) → Food[]
getFoodsByCalories(foods, minCal, maxCal) → Food[]

// Nutrition calculation
calculateFoodNutrition(food, quantity) → {...}
calculateMealNutrition(foods, mealItems) → {items, totals}

// Filtering
getHighProteinFoods(foods, minProtein = 10) → Food[]
getLowFatFoods(foods, maxFat = 5) → Food[]

// Display
formatFoodNutrition(food, quantity = 1) → string
```

**Usage Example:**
```typescript
import { loadFoodsDatabase, calculateMealNutrition } from './foods';

const foods = loadFoodsDatabase('./iranian-foods.json');

const breakfast = [
  { foodId: 'egg_whole_cooked', quantity: 2 },
  { foodId: 'bread_whole_wheat', quantity: 1 },
  { foodId: 'tomato_fresh', quantity: 1 },
];

const nutrition = calculateMealNutrition(foods, breakfast);
console.log(nutrition.totals);
// { calories: 254, protein: 17.1, carbs: 19.1, fat: 11.8, fiber: 3.3, water: ... }
```

---

### 4. **nutrition-system.ts** - Complete Integration
ترکیب کامل سیستم تغذیه‌ای

**Key Features:**
- ✅ Initialize complete nutrition system
- ✅ Food recommendations based on goals
- ✅ Meal analysis and alignment with targets
- ✅ Daily meal plan generation and summary
- ✅ Goal-based macro alignment scoring

**Usage Example:**
```typescript
import { initializeNutritionSystem, generateDailyPlanSummary, formatDailyPlan } from './nutrition-system';

const system = initializeNutritionSystem(userProfile, 'bulk', './iranian-foods.json');

const mealPlan = {
  date: '2024-06-14',
  meals: {
    breakfast: [{ foodId: 'egg_whole_cooked', quantity: 2 }],
    lunch: [{ foodId: 'chicken_breast_cooked', quantity: 1.5 }],
    dinner: [{ foodId: 'fish_salmon_cooked', quantity: 1 }],
    snacks: [{ foodId: 'almond', quantity: 1 }],
  },
};

const summary = generateDailyPlanSummary(system, mealPlan);
console.log(formatDailyPlan(summary));
```

---

## 🧮 Formulas

### BMR (Basal Metabolic Rate) - Mifflin-St Jeor
**For Men:**
```
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
```

**For Women:**
```
BMR = (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
```

### TDEE (Total Daily Energy Expenditure)
```
TDEE = BMR × Activity Multiplier

Activity Levels:
- Sedentary (little exercise): 1.2
- Light (1-3 days/week): 1.375
- Moderate (3-5 days/week): 1.55
- Active (6-7 days/week): 1.725
- Very Active (intense, 2x/day): 1.9
```

### Caloric Adjustment by Goal
```
Bulk:    TDEE + 300-500 kcal
Cut:     TDEE - 300-500 kcal
Maintain: TDEE (no change)
```

### Macro Breakdown (Default Ratios)
```
Protein: 30% → 1.6-2.2g per kg body weight
Carbs:   45%
Fat:     25% → 0.8-1.2g per kg body weight

Caloric Values:
- 1g Protein = 4 kcal
- 1g Carbs = 4 kcal
- 1g Fat = 9 kcal
```

---

## 📊 Example Output

### Nutrition Plan
```
📊 برنامه تغذیهای

🔥 کالری روزانه: 3159 kcal
   BMR: 1780 | TDEE: 2759 | هدف: bulk

💪 پروتئین: 236.9g (30%)
🌾 کربوهیدرات: 355.4g (45%)
🧈 چربی: 87.8g (25%)
```

### Daily Plan Summary
```
📋 برنامه غذایی روزانه - 2024-06-14

🍳 صبحانه: 254 kcal | 💪 17.1g
🍽️  ناهار:  458.5 kcal | 💪 42.5g
🍽️  شام:   309 kcal | 💪 34g
🥤 میان‌وعده: 93 kcal | 💪 5g

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 خلاصه روزانه

🔥 کالری: 1114/3159 kcal (35%)
💪 پروتئین: 98.6/236.9g (42%)
```

---

## 🧪 Testing

Run tests to validate all calculations:

```bash
# Test nutrition calculations
npx tsx nutrition.test.ts

# Test foods database
npx tsx foods.test.ts

# Test complete system
# (Add test file when integration is needed)
```

---

## 📈 Database Integration (Supabase Ready)

The `iranian-foods.json` is ready for Supabase Foods table:

```sql
CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_id TEXT UNIQUE NOT NULL, -- "chicken_breast_cooked"
  name TEXT NOT NULL, -- Persian name
  name_en TEXT NOT NULL, -- English name
  category TEXT NOT NULL,
  portion_size NUMERIC NOT NULL,
  portion_unit TEXT NOT NULL,
  calories NUMERIC NOT NULL,
  protein NUMERIC NOT NULL,
  carbs NUMERIC NOT NULL,
  fat NUMERIC NOT NULL,
  fiber NUMERIC NOT NULL,
  water NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Insert from JSON:**
```typescript
const foods = loadFoodsDatabase('./iranian-foods.json');
// Prepare for Supabase insert
const rows = foods.map(f => ({
  system_id: f.id,
  name: f.name,
  name_en: f.name_en,
  category: f.category,
  portion_size: f.portion_size,
  portion_unit: f.portion_unit,
  calories: f.nutrition.calories,
  protein: f.nutrition.protein,
  carbs: f.nutrition.carbs,
  fat: f.nutrition.fat,
  fiber: f.nutrition.fiber,
  water: f.nutrition.water,
  notes: f.notes,
}));

// Insert into Supabase
await supabase.from('foods').insert(rows);
```

---

## 🎯 Key Features Summary

✅ **Accurate Calculations** - Mifflin-St Jeor formula  
✅ **Flexible Macros** - Customizable ratios  
✅ **Persian Support** - Full bilingual interface  
✅ **Meal Planning** - Track and analyze daily meals  
✅ **Food Database** - 21+ common foods with nutrition info  
✅ **Goal Alignment** - Recommendations based on objectives  
✅ **Supabase Ready** - JSON structure matches SQL schema  

---

## 🚀 Next Steps

1. **Database Integration** - Connect to Supabase foods table
2. **User Profile Storage** - Save user profiles in database
3. **Meal History** - Track and analyze meals over time
4. **Macro Tracking** - Visual progress against daily targets
5. **Recommendations** - AI-based meal suggestions
6. **Export/Import** - Support for meal plans and nutrition data

---

## 📝 Notes

- All calorie calculations use 0.1g precision for macros
- Portion sizes are standardized to 100g or 1 serving (eggs, bread, etc.)
- Nutrition values are averages from USDA and local Iranian sources
- Water content is calculated to validate macro totals
- All timestamps are ISO 8601 format

---

**Version:** 1.0  
**Last Updated:** 2024-06-14  
**Status:** ✅ Production Ready
