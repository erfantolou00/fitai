/**
 * Iranian Foods Utility Module
 * Helper functions for food database management and meal planning
 */

import fs from 'fs';
import path from 'path';

export interface Food {
  id: string;
  name: string; // Persian name
  name_en: string; // English name
  category:
    | 'grains'
    | 'legumes'
    | 'proteins'
    | 'dairy'
    | 'vegetables'
    | 'fruits'
    | 'nuts'
    | 'oils'
    | 'condiments';
  portion_size: number;
  portion_unit: string; // 'g', 'ml', etc.
  nutrition: {
    calories: number;
    protein: number; // grams
    carbs: number; // grams
    fat: number; // grams
    fiber: number; // grams
    water: number; // grams
  };
  notes?: string;
}

export interface MealEntry {
  foodId: string;
  quantity: number; // portion count
  date: string; // ISO date
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface FoodDatabase {
  foods: Food[];
  lastUpdated: string;
  version: string;
}

/**
 * Load foods from JSON file
 */
export function loadFoodsDatabase(filePath: string): Food[] {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const foods = JSON.parse(data);
    return Array.isArray(foods) ? foods : [foods];
  } catch (error) {
    throw new Error(`Failed to load foods database: ${(error as Error).message}`);
  }
}

/**
 * Save foods to JSON file
 */
export function saveFoodsDatabase(filePath: string, foods: Food[]): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(foods, null, 2), 'utf-8');
  } catch (error) {
    throw new Error(`Failed to save foods database: ${(error as Error).message}`);
  }
}

/**
 * Find food by ID
 */
export function findFoodById(foods: Food[], foodId: string): Food | null {
  return foods.find((f) => f.id === foodId) || null;
}

/**
 * Search foods by name (Persian or English)
 */
export function searchFoodsByName(foods: Food[], query: string): Food[] {
  const lowerQuery = query.toLowerCase();
  return foods.filter(
    (f) =>
      f.name.toLowerCase().includes(lowerQuery) ||
      f.name_en.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get foods by category
 */
export function getFoodsByCategory(
  foods: Food[],
  category: Food['category']
): Food[] {
  return foods.filter((f) => f.category === category);
}

/**
 * Calculate nutrition for a food with custom quantity
 */
export function calculateFoodNutrition(food: Food, quantity: number) {
  return {
    foodId: food.id,
    name: food.name,
    quantity,
    portion_size: food.portion_size,
    total_weight: food.portion_size * quantity,
    nutrition: {
      calories: Math.round(food.nutrition.calories * quantity * 10) / 10,
      protein: Math.round(food.nutrition.protein * quantity * 10) / 10,
      carbs: Math.round(food.nutrition.carbs * quantity * 10) / 10,
      fat: Math.round(food.nutrition.fat * quantity * 10) / 10,
      fiber: Math.round(food.nutrition.fiber * quantity * 10) / 10,
      water: Math.round(food.nutrition.water * quantity * 10) / 10,
    },
  };
}

/**
 * Calculate total nutrition from multiple foods
 */
export function calculateMealNutrition(
  foods: Food[],
  mealItems: Array<{ foodId: string; quantity: number }>
) {
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    water: 0,
  };

  const items = mealItems.map((item) => {
    const food = findFoodById(foods, item.foodId);
    if (!food) throw new Error(`Food not found: ${item.foodId}`);
    return calculateFoodNutrition(food, item.quantity);
  });

  items.forEach((item) => {
    totals.calories += item.nutrition.calories;
    totals.protein += item.nutrition.protein;
    totals.carbs += item.nutrition.carbs;
    totals.fat += item.nutrition.fat;
    totals.fiber += item.nutrition.fiber;
    totals.water += item.nutrition.water;
  });

  return {
    items,
    totals: {
      calories: Math.round(totals.calories * 10) / 10,
      protein: Math.round(totals.protein * 10) / 10,
      carbs: Math.round(totals.carbs * 10) / 10,
      fat: Math.round(totals.fat * 10) / 10,
      fiber: Math.round(totals.fiber * 10) / 10,
      water: Math.round(totals.water * 10) / 10,
    },
  };
}

/**
 * Get high-protein foods (>= minProtein per 100g)
 */
export function getHighProteinFoods(foods: Food[], minProtein: number = 10): Food[] {
  return foods.filter((f) => (f.nutrition.protein / f.portion_size) * 100 >= minProtein);
}

/**
 * Get low-fat foods (< maxFat per 100g)
 */
export function getLowFatFoods(foods: Food[], maxFat: number = 5): Food[] {
  return foods.filter((f) => (f.nutrition.fat / f.portion_size) * 100 < maxFat);
}

/**
 * Format food nutrition display (Persian-friendly)
 */
export function formatFoodNutrition(
  food: Food,
  quantity: number = 1
): string {
  const nutrition = calculateFoodNutrition(food, quantity);
  const { calories, protein, carbs, fat, fiber } = nutrition.nutrition;

  return `
${food.name} (${food.name_en})
${food.notes || ''}
${quantity > 1 ? `  × ${quantity} portions` : ''}
━━━━━━━━━━━━━━━━━━━━
  🔥 ${calories} kcal
  💪 پروتئین: ${protein}g
  🌾 کربوهیدرات: ${carbs}g
  🧈 چربی: ${fat}g
  🌿 فیبر: ${fiber}g
  `.trim();
}

/**
 * Get foods by calorie range
 */
export function getFoodsByCalories(
  foods: Food[],
  minCal: number,
  maxCal: number
): Food[] {
  return foods.filter(
    (f) =>
      f.nutrition.calories >= minCal &&
      f.nutrition.calories <= maxCal
  );
}

/**
 * Create a food object (validation helper)
 */
export function createFood(
  id: string,
  name: string,
  name_en: string,
  category: Food['category'],
  portion_size: number,
  portion_unit: string,
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    water: number;
  },
  notes?: string
): Food {
  if (!id || !name || !name_en) {
    throw new Error('Food must have id, name, and name_en');
  }

  const totalMacros = nutrition.protein * 4 + nutrition.carbs * 4 + nutrition.fat * 9;
  if (Math.abs(totalMacros - nutrition.calories) > 5) {
    console.warn(
      `⚠️  Nutrition mismatch for ${name}: calculated ${Math.round(totalMacros)} kcal, but got ${nutrition.calories} kcal`
    );
  }

  return {
    id,
    name,
    name_en,
    category,
    portion_size,
    portion_unit,
    nutrition,
    notes,
  };
}
