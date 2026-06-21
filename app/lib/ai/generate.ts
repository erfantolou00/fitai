import OpenAI from 'openai';
import { parseAIError } from './errors';
import {
  loadCoreExercisesForPrompt,
  loadFoodsForPrompt,
} from './catalog';
import {
  ANALYSIS_PROMPT,
  NUTRITION_PROMPT,
  PROGRAM_PROMPT,
  buildPromptVars,
  fillTemplate,
} from './prompts';
import {
  AIResult,
  BodyAnalysis,
  DEFAULT_ANALYSIS,
  NutritionPlan,
  UserProfile,
} from '@/app/types/user';

const client = new OpenAI({
  baseURL: 'https://api.gapgpt.app/v1',
  apiKey: process.env.GAPGPT_API_KEY,
});

function extractJsonSlice(text: string): string | null {
  const clean = text.replace(/```json|```/g, '').trim();
  const start = clean.indexOf('{');
  if (start === -1) return null;
  return clean.slice(start);
}

function repairTruncatedJson(json: string): string {
  let s = json.replace(/,\s*$/, '');
  s = s.replace(/,\s*"[^"]*"?\s*:?\s*("[^"]*)?$/, '');
  s = s.replace(/,\s*\{[^}]*$/, '');

  let braces = 0;
  let brackets = 0;
  let inString = false;
  let escape = false;

  for (const ch of s) {
    if (escape) {
      escape = false;
      continue;
    }
    if (ch === '\\') {
      escape = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (ch === '{') braces++;
    if (ch === '}') braces--;
    if (ch === '[') brackets++;
    if (ch === ']') brackets--;
  }

  if (inString) s += '"';
  while (brackets > 0) {
    s += ']';
    brackets--;
  }
  while (braces > 0) {
    s += '}';
    braces--;
  }
  return s;
}

function safeParseJSON<T>(text: string): T | null {
  const slice = extractJsonSlice(text);
  if (!slice) return null;

  for (const candidate of [slice, repairTruncatedJson(slice)]) {
    try {
      return JSON.parse(candidate) as T;
    } catch {
      // try next repair strategy
    }
  }
  return null;
}

async function callAI(prompt: string, maxTokens = 1500): Promise<string> {
  if (!process.env.GAPGPT_API_KEY) {
    throw parseAIError(new Error('GAPGPT_API_KEY is not configured'));
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gapgpt-qwen-3.6',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0].message.content ?? '';
  } catch (error) {
    throw parseAIError(error);
  }
}

function normalizeAnalysis(raw: Partial<BodyAnalysis> | null): BodyAnalysis {
  if (!raw) return { ...DEFAULT_ANALYSIS, importantNote: 'لطفاً دوباره تلاش کنید' };
  return {
    bmi: Number(raw.bmi) || 0,
    bmiStatus: raw.bmiStatus ?? 'نامشخص',
    recommendedPhase: raw.recommendedPhase ?? 'نامشخص',
    timeEstimate: raw.timeEstimate ?? 'نامشخص',
    importantNote: raw.importantNote ?? '',
  };
}

export async function generateFullPlan(profile: UserProfile): Promise<AIResult> {
  const baseVars = buildPromptVars(profile);

  const analysisText = await callAI(
    fillTemplate(ANALYSIS_PROMPT, baseVars),
    1500
  );
  const analysis = normalizeAnalysis(safeParseJSON<BodyAnalysis>(analysisText));
  const phase = analysis.recommendedPhase || 'ریکامپ';

  const programVars = {
    ...buildPromptVars(profile, phase),
    exerciseList: loadCoreExercisesForPrompt(),
  };
  const programText = await callAI(
    fillTemplate(PROGRAM_PROMPT, programVars),
    4096
  );

  const programData = safeParseJSON<{ weeklyPlan?: AIResult['program']['weeklyPlan'] }>(
    programText
  );
  const weeklyPlan = Array.isArray(programData?.weeklyPlan)
    ? programData.weeklyPlan
    : [];

  let nutrition: NutritionPlan | null = null;
  if (profile.nutritionEnabled) {
    const nutritionVars = {
      ...programVars,
      foodList: loadFoodsForPrompt(),
    };
    const nutritionText = await callAI(
      fillTemplate(NUTRITION_PROMPT, nutritionVars),
      3000
    );
    nutrition = safeParseJSON<NutritionPlan>(nutritionText);
  }

  return {
    analysis,
    program: { weeklyPlan },
    nutrition,
  };
}
