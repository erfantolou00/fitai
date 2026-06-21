/**
 * اسکریپت matching حرکات اصلی (core) با دیتابیس
 * 
 * کاری که می‌کند:
 *   ۱. لیست ۱۰۱ حرکت اصلی (core-exercises.json) را می‌خواند
 *   ۲. با fuzzy match با ستون name_en جدول exercises مطابقت می‌دهد
 *   ۳. برای موارد match شده: is_core = true و priority و name_fa را ست می‌کند
 *   ۴. گزارش می‌دهد کدام حرکات در دیتابیس پیدا نشدند
 * 
 * پیش‌نیاز SQL (یک‌بار در Supabase اجرا کن):
 *
 *   alter table exercises add column if not exists is_core boolean default false;
 *   alter table exercises add column if not exists priority int default 999;
 *
 * اجرا:
 *   npx tsx mark-core-exercises.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface CoreExercise {
  name_en: string;
  name_fa: string;
}

interface CoreExercisesFile {
  [category: string]: CoreExercise[];
}

interface DbExercise {
  id: string;
  external_id: string;
  name_en: string;
}

// ── نرمال‌سازی برای مقایسه ─────────────────────────────────
function normalize(str: string): string {
  return str
    .toLowerCase()
    .replace(/[-_]/g, ' ')      // خط فاصله و آندرلاین -> space
    .replace(/[^a-z0-9\s]/g, '') // حذف علائم
    .replace(/\s+/g, ' ')        // چند space -> یک space
    .trim();
}

// ── شباهت ساده — Jaccard روی کلمات ─────────────────────────
function wordSimilarity(a: string, b: string): number {
  const wordsA = new Set(normalize(a).split(' ').filter(Boolean));
  const wordsB = new Set(normalize(b).split(' ').filter(Boolean));

  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }

  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
}

// ── پیدا کردن بهترین match برای یک حرکت core ───────────────
function findBestMatch(
  core: CoreExercise,
  dbExercises: DbExercise[]
): { match: DbExercise; score: number } | null {
  let best: { match: DbExercise; score: number } | null = null;

  for (const db of dbExercises) {
    // ۱. تطابق دقیق (بعد از نرمال‌سازی)
    if (normalize(db.name_en) === normalize(core.name_en)) {
      return { match: db, score: 1.0 };
    }

    // ۲. شباهت کلمه‌ای
    const score = wordSimilarity(core.name_en, db.name_en);
    if (score > 0.5 && (!best || score > best.score)) {
      best = { match: db, score };
    }
  }

  return best;
}

async function main() {
  console.log('🎯 شروع matching حرکات اصلی با دیتابیس\n');

  // ۱. خواندن لیست core
  const coreFilePath = path.join(process.cwd(), 'core-exercises.json');
  if (!fs.existsSync(coreFilePath)) {
    console.error(`❌ فایل core-exercises.json پیدا نشد در: ${coreFilePath}`);
    console.error('   آن را در ریشه پروژه (کنار این اسکریپت) قرار بده.');
    return;
  }
  const coreData: CoreExercisesFile = JSON.parse(fs.readFileSync(coreFilePath, 'utf-8'));

  // فلت کردن با حفظ priority بر اساس ترتیب و دسته‌بندی
  const coreList: (CoreExercise & { category: string; priority: number })[] = [];
  let priorityCounter = 1;
  for (const [category, exercises] of Object.entries(coreData)) {
    for (const ex of exercises) {
      coreList.push({ ...ex, category, priority: priorityCounter++ });
    }
  }
  console.log(`📋 ${coreList.length} حرکت اصلی در لیست core-exercises.json\n`);

  // ۲. خواندن همه حرکات دیتابیس
  console.log('📥 خواندن حرکات از دیتابیس...');
  const dbExercises: DbExercise[] = [];
  let offset = 0;
  const pageSize = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('exercises')
      .select('id, external_id, name_en')
      .range(offset, offset + pageSize - 1);

    if (error) throw new Error(`DB error: ${error.message}`);
    if (!data || data.length === 0) break;

    dbExercises.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }
  console.log(`   ${dbExercises.length} حرکت در دیتابیس\n`);

  // ۳. matching
  console.log('🔍 شروع matching...\n');
  const matched: { core: typeof coreList[0]; db: DbExercise; score: number }[] = [];
  const notFound: typeof coreList = [];
  const usedDbIds = new Set<string>();

  for (const core of coreList) {
    // فقط بین حرکاتی که هنوز استفاده نشدن جستجو کن (جلوگیری از تخصیص دوبل)
    const available = dbExercises.filter(db => !usedDbIds.has(db.id));
    const result = findBestMatch(core, available);

    if (result && result.score >= 0.5) {
      matched.push({ core, db: result.match, score: result.score });
      usedDbIds.add(result.match.id);
    } else {
      notFound.push(core);
    }
  }

  console.log(`✅ Match شد: ${matched.length}`);
  console.log(`❌ پیدا نشد: ${notFound.length}\n`);

  // ۴. آپدیت دیتابیس — batch update
  console.log('💾 آپدیت دیتابیس...\n');
  let updated = 0;

  for (const m of matched) {
    const { error } = await supabase
      .from('exercises')
      .update({
        is_core: true,
        priority: m.core.priority,
        name_fa: m.core.name_fa, // override با نام فارسی استاندارد
      })
      .eq('id', m.db.id);

    if (error) {
      console.log(`  ⚠️ خطا در آپدیت ${m.db.name_en}: ${error.message}`);
      continue;
    }
    updated++;

    const exactTag = m.score === 1 ? '✓' : `~${Math.round(m.score * 100)}%`;
    console.log(`  ${exactTag.padEnd(5)} ${m.core.name_en.padEnd(35)} → ${m.db.name_en} (${m.core.name_fa})`);
  }

  console.log(`\n✅ ${updated} حرکت به‌عنوان core علامت‌گذاری شد\n`);

  // ۵. گزارش موارد پیدا نشده
  if (notFound.length > 0) {
    console.log('─'.repeat(60));
    console.log(`⚠️  ${notFound.length} حرکت در دیتابیس پیدا نشد:\n`);
    console.log('   اینها را باید دستی اضافه کنی یا برایشان رسانه تهیه کنی:\n');

    const reportLines: string[] = [];
    for (const ex of notFound) {
      const line = `  [${ex.category}] ${ex.name_en} → ${ex.name_fa}`;
      console.log(line);
      reportLines.push(line);
    }

    // ذخیره گزارش در فایل
    fs.writeFileSync(
      'not-found-exercises.txt',
      `حرکاتی که در دیتابیس پیدا نشدند (${notFound.length} مورد):\n\n` +
      reportLines.join('\n') +
      '\n\nاین حرکات را می‌توانی:\n' +
      '  - با اسم دیگری در دیتابیس جستجو کنی (شاید اسم متفاوتی دارند)\n' +
      '  - به صورت دستی به جدول exercises اضافه کنی\n' +
      '  - برایشان GIF/ویدیو جدا تهیه کنی\n'
    );
    console.log('\n📝 گزارش کامل در فایل not-found-exercises.txt ذخیره شد');
  }

  // ۶. خلاصه نهایی
  console.log('\n' + '─'.repeat(60));
  console.log('📊 خلاصه:');
  console.log(`   کل حرکات core: ${coreList.length}`);
  console.log(`   match شده: ${matched.length}`);
  console.log(`   پیدا نشده: ${notFound.length}`);
  console.log('\n📝 قدم بعدی:');
  console.log('   select * from exercises where is_core = true order by priority;');
  console.log('   — برای دیدن لیست نهایی حرکات اصلی با اولویت');
}

main().catch(console.error);