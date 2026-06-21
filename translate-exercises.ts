/**
 * اسکریپت ترجمه اسم حرکات به فارسی با AI
 * بعد از import-exercises.ts اجرا کن
 * 
 * اجرا:
 *   npx tsx translate-exercises.ts
 */

import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ai = new OpenAI({
  baseURL: 'https://api.gapgpt.app/v1',
  apiKey: process.env.GAPGPT_API_KEY!,
});

const BATCH_SIZE = 30; // ترجمه ۳۰ تا همزمان در یه prompt

async function translateBatch(exercises: { id: string; name_en: string }[]): Promise<Record<string, string>> {
  const list = exercises.map((e, i) => `${i + 1}. ${e.name_en}`).join('\n');

  const response = await ai.chat.completions.create({
    model: 'claude-opus-4-8',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `این لیست نام حرکات ورزشی بدنسازی را به فارسی ترجمه کن.
فقط JSON برگردان. کلید = شماره ردیف، مقدار = ترجمه فارسی.
اگه اسم فارسی رایج داره همون رو بنویس (مثلاً: Bench Press = پرس سینه)

${list}

فقط JSON:
{"1":"...","2":"..."}`,
    }],
  });

  const text = response.choices[0].message.content ?? '';
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    const parsed = JSON.parse(clean.slice(start, end + 1));

    // map شماره به id
    const result: Record<string, string> = {};
    exercises.forEach((ex, i) => {
      result[ex.id] = parsed[String(i + 1)] || ex.name_en;
    });
    return result;
  } catch {
    // fallback — همون اسم انگلیسی
    const result: Record<string, string> = {};
    exercises.forEach(ex => { result[ex.id] = ex.name_en; });
    return result;
  }
}

async function main() {
  console.log('🌐 شروع ترجمه حرکات به فارسی...\n');

  // بگیر حرکاتی که هنوز ترجمه نشدن
  const { data: exercises, error } = await supabase
    .from('exercises')
    .select('id, name_en')
    .eq('name_fa', '')
    .order('created_at');

  if (error || !exercises) {
    console.error('خطا در خواندن دیتابیس:', error);
    return;
  }

  console.log(`📊 ${exercises.length} حرکت نیاز به ترجمه دارد\n`);

  let translated = 0;

  for (let i = 0; i < exercises.length; i += BATCH_SIZE) {
    const batch = exercises.slice(i, i + BATCH_SIZE);

    try {
      const translations = await translateBatch(batch);

      // آپدیت دیتابیس
      for (const [id, name_fa] of Object.entries(translations)) {
        await supabase
          .from('exercises')
          .update({ name_fa })
          .eq('id', id);
      }

      translated += batch.length;
      const progress = Math.round((translated / exercises.length) * 100);
      console.log(`  [${progress}%] ${translated}/${exercises.length} ترجمه شد`);

      // delay بین درخواست‌ها
      await new Promise(r => setTimeout(r, 500));

    } catch (e) {
      console.log(`  ⚠️ batch خطا داشت، ادامه...`, e);
    }
  }

  console.log('\n✅ ترجمه کامل شد!');
  
  // نمونه نتیجه
  const { data: samples } = await supabase
    .from('exercises')
    .select('name_en, name_fa, body_part_fa, equipment_fa')
    .limit(5);
  
  console.log('\n📋 نمونه نتایج:');
  samples?.forEach(s => {
    console.log(`  ${s.name_en} → ${s.name_fa} | ${s.body_part_fa} | ${s.equipment_fa}`);
  });
}

main().catch(console.error);