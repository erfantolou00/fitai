import { Goal, Level, Location } from '@/app/types/user';

export const GOAL_LABELS: Record<Goal, { label: string; desc: string }> = {
  fat_loss: {
    label: 'کاهش چربی و لاغری',
    desc: 'می‌خوام وزنم پایین بیاد و چربی از دست بدم',
  },
  muscle_gain: {
    label: 'افزایش حجم عضلانی',
    desc: 'می‌خوام عضله بسازم و بدنم پرتر بشه',
  },
  strength: {
    label: 'افزایش قدرت',
    desc: 'می‌خوام قوی‌تر بشم، وزنه بیشتری بزنم',
  },
  general_fitness: {
    label: 'تناسب اندام عمومی',
    desc: 'می‌خوام فیت‌تر باشم، انرژی بیشتری داشته باشم',
  },
};

export const LEVEL_LABELS: Record<Level, { label: string; desc: string }> = {
  beginner: {
    label: 'مبتدی',
    desc: 'کمتر از ۶ ماه سابقه یا تازه شروع کردم',
  },
  intermediate: {
    label: 'متوسط',
    desc: '۶ ماه تا ۲ سال تمرین منظم',
  },
  advanced: {
    label: 'پیشرفته',
    desc: 'بیش از ۲ سال تمرین اصولی',
  },
};

export const LOCATION_LABELS: Record<Location, string> = {
  gym: 'باشگاه',
  home: 'خانه',
  both: 'هر دو',
};

export const ONBOARDING_STEPS = [
  'اطلاعات پایه',
  'سطح و سابقه',
  'هدف',
  'تجهیزات',
  'تغذیه',
] as const;
