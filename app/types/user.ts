export type Goal = 'fat_loss' | 'muscle_gain' | 'strength' | 'general_fitness';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Location = 'gym' | 'home' | 'both';

export interface UserProfile {
  age: number;
  gender: 'male' | 'female';
  height: number;
  currentWeight: number;
  targetWeight: number;
  fitnessLevel: Level;
  experienceMonths: number;
  injuries: string;
  goal: Goal;
  location: Location;
  daysPerWeek: number;
  minutesPerSession: number;
  nutritionEnabled: boolean;
  mealsPerDay: number;
  dietaryRestrictions: string;
}

export interface BodyAnalysis {
  bmi: number;
  bmiStatus: string;
  recommendedPhase: string;
  timeEstimate: string;
  importantNote: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  homeAlternative: string;
  notes: string;
}

export interface DayPlan {
  day: string;
  muscleGroups: string[];
  isRest: boolean;
  exercises: Exercise[];
}

export interface Meal {
  name: string;
  time: string;
  foods: string[];
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionPlan {
  dailyCalories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
  meals: Meal[];
  tips: string[];
  hydration: string;
}

export interface AIResult {
  analysis: BodyAnalysis;
  program: {
    weeklyPlan: DayPlan[];
  };
  nutrition?: NutritionPlan | null;
}

export const DEFAULT_PROFILE: UserProfile = {
  age: 25,
  gender: 'male',
  height: 175,
  currentWeight: 80,
  targetWeight: 70,
  fitnessLevel: 'beginner',
  experienceMonths: 0,
  injuries: '',
  goal: 'fat_loss',
  location: 'gym',
  daysPerWeek: 4,
  minutesPerSession: 60,
  nutritionEnabled: false,
  mealsPerDay: 3,
  dietaryRestrictions: '',
};

export const DEFAULT_ANALYSIS: BodyAnalysis = {
  bmi: 0,
  bmiStatus: 'محاسبه نشد',
  recommendedPhase: 'نامشخص',
  timeEstimate: 'نامشخص',
  importantNote: '',
};
