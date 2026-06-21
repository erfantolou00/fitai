import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const query = url.searchParams.get('query')?.trim() ?? '';
  const bodyPart = url.searchParams.get('bodyPart')?.trim() ?? '';
  const targetMuscle = url.searchParams.get('target')?.trim() ?? '';
  const equipment = url.searchParams.get('equipment')?.trim() ?? '';
  const limit = Math.min(Number(url.searchParams.get('limit') ?? '60') || 60, 200);
  const offset = Number(url.searchParams.get('offset') ?? '0') || 0;
  const meta = url.searchParams.get('meta') === 'true';

  try {
    let q = supabase
      .from('exercises')
      .select('id, external_id, name_en, name_fa, body_part, body_part_fa, target_muscle, target_muscle_fa, secondary_muscles, equipment, equipment_fa, instructions_en, gif_url, gif_storage_path', { count: 'exact' })
      .eq('is_core', true);

    if (query) {
      // جستجو در نام فارسی و انگلیسی
      q = q.or(`name_fa.ilike.%${query}%,name_en.ilike.%${query}%`);
    }
    if (bodyPart) q = q.eq('body_part', bodyPart);
    if (targetMuscle) q = q.eq('target_muscle', targetMuscle);
    if (equipment) q = q.eq('equipment', equipment);

    q = q.order('name_fa', { ascending: true }).range(offset, offset + limit - 1);

    const { data, error, count } = await q;
    if (error) throw error;

    // ساخت URL کامل برای GIF ها (از Supabase Storage)
    const results = (data ?? []).map(ex => ({
      ...ex,
      gif_public_url: ex.gif_storage_path
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/exercises/${ex.gif_storage_path}`
        : ex.gif_url,
    }));

    let metaData: Record<string, unknown> | undefined;
    if (meta) {
      // فیلترهای موجود — برای dropdown ها
      const [bodyParts, muscles, equipmentList] = await Promise.all([
        supabase.from('exercises').select('body_part, body_part_fa').not('body_part', 'is', null),
        supabase.from('exercises').select('target_muscle, target_muscle_fa').not('target_muscle', 'is', null),
        supabase.from('exercises').select('equipment, equipment_fa').not('equipment', 'is', null),
      ]);

      const uniq = (arr: any[], key: string, keyFa: string) => {
        const map = new Map<string, string>();
        arr?.forEach(item => {
          if (item[key]) map.set(item[key], item[keyFa] || item[key]);
        });
        return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
      };

      metaData = {
        bodyParts: uniq(bodyParts.data ?? [], 'body_part', 'body_part_fa'),
        muscles: uniq(muscles.data ?? [], 'target_muscle', 'target_muscle_fa'),
        equipment: uniq(equipmentList.data ?? [], 'equipment', 'equipment_fa'),
      };
    }

    return NextResponse.json({
      results,
      count: count ?? results.length,
      meta: metaData,
    });
  } catch (err) {
    console.error('Exercises API error:', err);
    return NextResponse.json(
      { error: 'خطا در دریافت حرکات', details: String(err) },
      { status: 500 }
    );
  }
}