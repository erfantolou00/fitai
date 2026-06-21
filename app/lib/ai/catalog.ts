import fs from 'fs';
import path from 'path';

interface CoreExercise {
  name_en: string;
  name_fa: string;
}

type CoreExerciseDb = Record<string, CoreExercise[]>;

interface FoodItem {
  name: string;
  name_en: string;
  category: string;
  nutrition: { calories: number; protein: number };
}

let cachedExercises: string | null = null;
let cachedFoods: string | null = null;

export function loadCoreExercisesForPrompt(): string {
  if (cachedExercises) return cachedExercises;

  const filePath = path.join(process.cwd(), 'core-exercises.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw) as CoreExerciseDb;

  const categoryLabels: Record<string, string> = {
    chest: 'سینه',
    back: 'پشت',
    shoulders: 'سرشانه',
    arms: 'بازو',
    legs: 'پا',
    core: 'میان‌تنه',
    cardio: 'کاردیو',
  };

  const lines = Object.entries(data).map(([key, exercises]) => {
    const label = categoryLabels[key] ?? key;
    const names = exercises.map((e) => e.name_fa).join('، ');
    return `[${label}] ${names}`;
  });

  cachedExercises = lines.join('\n');
  return cachedExercises;
}

export function loadFoodsForPrompt(maxItems = 40): string {
  if (cachedFoods) return cachedFoods;

  const filePath = path.join(process.cwd(), 'app/nutrition/iranian-foods.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const foods = JSON.parse(raw) as FoodItem[];

  cachedFoods = foods
    .slice(0, maxItems)
    .map(
      (f) =>
        `${f.name} (${f.nutrition.calories}kcal, ${f.nutrition.protein}g پروتئین)`
    )
    .join(' | ');

  return cachedFoods;
}

export function getExerciseCount(): number {
  const filePath = path.join(process.cwd(), 'core-exercises.json');
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as CoreExerciseDb;
  return Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
}
