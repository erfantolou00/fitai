import { UserProfile } from '@/app/types/user';

export const ANALYSIS_PROMPT = `تو یک متخصص علم ورزش و تغذیه هستی که به فارسی صحبت می‌کنی.

اطلاعات کاربر:
- سن: {{age}} سال | جنسیت: {{gender}} | قد: {{height}} سانتی‌متر
- وزن فعلی: {{currentWeight}} کیلوگرم | وزن هدف: {{targetWeight}} کیلوگرم
- هدف: {{goal}} | سطح: {{fitnessLevel}} | سابقه: {{experienceMonths}} ماه
- محدودیت جسمی: {{injuries}}

یک آنالیز کوتاه و صادقانه بده:
۱. BMI و تفسیر ساده آن
۲. دوره پیشنهادی (کات/حجم/ریکامپ) با دلیل
۳. زمان واقعی رسیدن به هدف
۴. یک نکته مهمی که این کاربر احتمالاً نمی‌داند

فقط JSON برگردان، بدون توضیح اضافه:
{"bmi":0,"bmiStatus":"","recommendedPhase":"","timeEstimate":"","importantNote":""}`;

export const PROGRAM_PROMPT = `تو یک مربی بدنسازی متخصص هستی.

مشخصات:
- هدف: {{goal}} | دوره: {{phase}} | سطح: {{level}}
- تجهیزات: {{location}} | {{daysPerWeek}} روز در هفته | {{minutes}} دقیقه هر جلسه
- محدودیت: {{injuries}}

یک برنامه کامل {{daysPerWeek}} روزه طراحی کن. روزهای استراحت هم بنویس با isRest: true.
هر روز تمرینی حداکثر ۵ حرکت داشته باشد تا JSON کامل بماند.

⚠️ فقط از حرکات موجود در بانک زیر استفاده کن (نام فارسی دقیق):
{{exerciseList}}

فقط و فقط یک JSON خالص برگردان، بدون هیچ توضیح قبل یا بعد، بدون markdown:
{"weeklyPlan":[{"day":"شنبه","muscleGroups":["سینه","سرشانه"],"isRest":false,"exercises":[{"name":"پرس سینه هالتر","sets":4,"reps":"8-10","rest":"90 ثانیه","homeAlternative":"شنا سوئدی","notes":"پشت صاف روی نیمکت"}]},{"day":"یکشنبه","muscleGroups":[],"isRest":true,"exercises":[]}]}`;

export const NUTRITION_PROMPT = `تو یک متخصص تغذیه ورزشی ایرانی هستی.

مشخصات:
- سن: {{age}} | جنسیت: {{gender}} | قد: {{height}}cm | وزن: {{currentWeight}}kg | هدف: {{targetWeight}}kg
- هدف ورزشی: {{goal}} | دوره: {{phase}}
- {{mealsPerDay}} وعده در روز | محدودیت غذایی: {{dietaryRestrictions}}

یک برنامه تغذیه روزانه ایرانی طراحی کن با غذاهای واقعی و در دسترس.
⚠️ فقط از غذاهای موجود در بانک زیر استفاده کن:
{{foodList}}

کالری و ماکروها را دقیق محاسبه کن.

فقط JSON خالص برگردان:
{"dailyCalories":0,"macros":{"protein":0,"carbs":0,"fat":0},"meals":[{"name":"صبحانه","time":"08:00","foods":["..."],"calories":0,"protein":0,"carbs":0,"fat":0}],"tips":["..."],"hydration":"..."}`;

export function buildPromptVars(profile: UserProfile, phase = 'بر اساس آنالیز') {
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

  return {
    age: String(profile.age),
    gender: profile.gender === 'male' ? 'مرد' : 'زن',
    height: String(profile.height),
    currentWeight: String(profile.currentWeight),
    targetWeight: String(profile.targetWeight),
    goal: goalMap[profile.goal] ?? profile.goal,
    fitnessLevel: levelMap[profile.fitnessLevel] ?? profile.fitnessLevel,
    level: levelMap[profile.fitnessLevel] ?? profile.fitnessLevel,
    experienceMonths: String(profile.experienceMonths),
    location: locationMap[profile.location] ?? profile.location,
    daysPerWeek: String(profile.daysPerWeek),
    minutes: String(profile.minutesPerSession),
    injuries: profile.injuries || 'ندارم',
    phase,
    mealsPerDay: String(profile.mealsPerDay),
    dietaryRestrictions: profile.dietaryRestrictions || 'ندارم',
  };
}

export function fillTemplate(
  template: string,
  vars: Record<string, string>
): string {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.replace(new RegExp(`{{${k}}}`, 'g'), v),
    template
  );
}
