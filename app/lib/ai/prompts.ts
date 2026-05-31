export const ANALYSIS_PROMPT = `تو یک متخصص علم ورزش و تغذیه هستی که به فارسی صحبت می‌کنی.

اطلاعات کاربر:
- سن: {{age}} سال | جنسیت: {{gender}} | قد: {{height}} سانتی‌متر
- وزن فعلی: {{currentWeight}} کیلوگرم | وزن هدف: {{targetWeight}} کیلوگرم
- هدف: {{goal}} | سطح: {{fitnessLevel}} | سابقه: {{experienceMonths}} ماه

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

یک برنامه {{daysPerWeek}} روزه طراحی کن. برای روزهای استراحت فیلد isRest را true بگذار.

فقط JSON برگردان:
{"weeklyPlan":[{"day":"شنبه","muscleGroups":["سینه"],"isRest":false,"exercises":[{"name":"پرس سینه","sets":4,"reps":"8-10","rest":"90 ثانیه","homeAlternative":"شنا سوئدی","notes":"پشت صاف"}]}]}`;
