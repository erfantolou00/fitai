import { NextResponse } from 'next/server';
import path from 'path';
import {
  getFoodsByCategory,
  loadFoodsDatabase,
  searchFoodsByName,
  type Food,
} from '@/app/nutrition/foods';

const FOODS_PATH = path.join(process.cwd(), 'app/nutrition/iranian-foods.json');

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() ?? '';
  const category = searchParams.get('category')?.trim() ?? '';

  try {
    const foods = loadFoodsDatabase(FOODS_PATH);
    let results = q ? searchFoodsByName(foods, q) : foods;

    if (category) {
      results = getFoodsByCategory(results, category as Food['category']);
    }

    return NextResponse.json({ foods: results, total: results.length });
  } catch (error) {
    console.error('Foods API error:', error);
    return NextResponse.json({ error: 'خطا در بارگذاری غذاها' }, { status: 500 });
  }
}
