import { NextRequest, NextResponse } from 'next/server';
import { getWorkoutPlan } from '@/app/lib/db/workout-plans';
import { setDefaultPlan } from '@/app/lib/db/profiles';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(
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

  await setDefaultPlan(user.id, id);

  return NextResponse.json({ success: true, defaultPlanId: id });
}
