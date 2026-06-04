import { NextRequest, NextResponse } from 'next/server';
import { dbToResult, getWorkoutPlan } from '@/app/lib/db/workout-plans';
import { createClient } from '@/app/lib/supabase/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const plan = await getWorkoutPlan(id, user.id);
  if (!plan) {
    return NextResponse.json({ error: 'برنامه یافت نشد' }, { status: 404 });
  }

  return NextResponse.json({
    result: dbToResult(plan),
    meta: { id: plan.id, title: plan.title, createdAt: plan.created_at },
  });
}
