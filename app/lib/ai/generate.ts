import Anthropic from '@anthropic-ai/sdk';
import { ANALYSIS_PROMPT, PROGRAM_PROMPT } from './prompts';
import { AIResult, UserProfile } from '@/app/types/user';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const goalMap: Record<string, string> = {
  fat_loss: 'کاهش چربی',
  muscle_gain: 'افزایش حجم عضلانی',
  strength: 'افزایش قدرت',
  general_fitness: 'تناسب اندام عمومی',
};

const levelMap: Record<string, string> = {
  beginner: 'مبتدی',
  intermediate: 'متوسط',
  advanced: 'پیشرفته',
};

const locationMap: Record<string, string> = {
  gym: 'باشگاه',
  home: 'خانه',
  both: 'باشگاه و خانه',
};

function fillTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replace(new RegExp(`{{${k}}}`, 'g'), v),
    template
  );
}

function safeParseJSON(text: string) {
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    // پیدا کردن اولین { و آخرین }
    const start = clean.indexOf('{');
    const end = clean.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON found');
    return JSON.parse(clean.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function callClaude(prompt: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001', // ارزان‌ترین مدل برای دمو
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });
  return response.content[0].type === 'text' ? response.content[0].text : '';
}

export async function generateFullPlan(profile: UserProfile): Promise<AIResult> {
  const vars = {
    age: String(profile.age),
    gender: profile.gender === 'male' ? 'مرد' : 'زن',
    height: String(profile.height),
    currentWeight: String(profile.currentWeight),
    targetWeight: String(profile.targetWeight),
    goal: goalMap[profile.goal] || profile.goal,
    fitnessLevel: levelMap[profile.fitnessLevel] || profile.fitnessLevel,
    experienceMonths: String(profile.experienceMonths),
    level: levelMap[profile.fitnessLevel] || profile.fitnessLevel,
    location: locationMap[profile.location] || profile.location,
    daysPerWeek: String(profile.daysPerWeek),
    minutes: String(profile.minutesPerSession),
    injuries: profile.injuries || 'ندارم',
    phase: 'بر اساس آنالیز تعیین کن',
  };

  // هر دو را موازی اجرا کن
  const [analysisText, programText] = await Promise.all([
    callClaude(fillTemplate(ANALYSIS_PROMPT, vars)),
    callClaude(fillTemplate(PROGRAM_PROMPT, vars)),
  ]);

  const analysis = safeParseJSON(analysisText) ?? {
    bmi: 0,
    bmiStatus: 'خطا در محاسبه',
    recommendedPhase: 'نامشخص',
    timeEstimate: 'نامشخص',
    importantNote: 'لطفاً دوباره تلاش کنید',
  };

  const programData = safeParseJSON(programText);
  const program = programData ?? { weeklyPlan: [] };

  return { analysis, program };
}