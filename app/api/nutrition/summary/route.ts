import { NextResponse } from 'next/server';
import path from 'path';
import { generateNutritionPlan } from '@/app/nutrition/nutrition';
import { getHighProteinFoods, getLowFatFoods, loadFoodsDatabase } from '@/app/nutrition/foods';
import { dbToProfile } from '@/app/lib/db/mappers';
import { getActiveFitnessProfile } from '@/app/lib/db/fitness-profiles';
import { createClient } from '@/app/lib/supabase/server';
import {
  mapFitnessGoalToNutritionGoal,
  mapFitnessToNutritionProfile,
  NUTRITION_GOAL_LABELS,
} from '@/app/lib/nutrition/helpers';

const FOODS_PATH = path.join(process.cwd(), 'app/nutrition/iranian-foods.json');

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const fitnessRow = await getActiveFitnessProfile(user.id);

  if (!fitnessRow) {
    return NextResponse.json({ hasFitnessProfile: false });
  }

  const fitness = dbToProfile(fitnessRow);
  const nutritionGoal = mapFitnessGoalToNutritionGoal(fitness.goal);
  const nutritionProfile = mapFitnessToNutritionProfile(fitness);
  const plan = generateNutritionPlan(nutritionProfile, nutritionGoal);

  const foods = loadFoodsDatabase(FOODS_PATH);

  return NextResponse.json({
    hasFitnessProfile: true,
    goal: nutritionGoal,
    goalLabel: NUTRITION_GOAL_LABELS[nutritionGoal],
    plan: {
      bmr: plan.bmr,
      tdee: plan.tdee,
      dailyCalories: plan.dailyCalories,
      macros: {
        protein: plan.macros.protein.grams,
        carbs: plan.macros.carbs.grams,
        fat: plan.macros.fat.grams,
        proteinPct: plan.macros.protein.percentage,
        carbsPct: plan.macros.carbs.percentage,
        fatPct: plan.macros.fat.percentage,
      },
    },
    recommended: {
      highProtein: getHighProteinFoods(foods, 15).slice(0, 6),
      lowFat: getLowFatFoods(foods, 5).slice(0, 6),
    },
  });
}
