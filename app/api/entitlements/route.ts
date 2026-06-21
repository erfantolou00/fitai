import { NextResponse } from 'next/server';
import { getEntitlements } from '@/app/lib/billing/entitlements';
import { createClient } from '@/app/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const entitlements = await getEntitlements(user?.id ?? null);
  return NextResponse.json(entitlements);
}
