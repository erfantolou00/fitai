import { NextRequest, NextResponse } from 'next/server';
import { CHECKOUT_PRODUCTS, CheckoutProduct } from '@/app/lib/billing/products';
import { grantMockPurchase } from '@/app/lib/db/profiles';
import { createClient } from '@/app/lib/supabase/server';

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'ابتدا وارد حساب شو' }, { status: 401 });
  }

  const body = await req.json();
  const product = body.product as CheckoutProduct;

  if (!product || !CHECKOUT_PRODUCTS[product]) {
    return NextResponse.json({ error: 'محصول نامعتبر' }, { status: 400 });
  }

  const profile = await grantMockPurchase(user.id, product);

  return NextResponse.json({
    success: true,
    product,
    profile: {
      nutrition_paid: profile.nutrition_paid,
      paid_plan_credits: profile.paid_plan_credits,
    },
  });
}
