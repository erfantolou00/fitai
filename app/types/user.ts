export type Goal = 'fat_loss' | 'muscle_gain' | 'strength' | 'general_fitness';
export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Location = 'gym' | 'home' | 'both';

export interface UserProfile {
  // مرحله ۱
  age: number;
  gender: 'male' | 'female';
  height: number;
  currentWeight: number;
  targetWeight: number;
  // مرحله ۲
  fitnessLevel: Level;
  experienceMonths: number;
  injuries: string;
  // مرحله ۳
  goal: Goal;
  // مرحله ۴
  location: Location;
  daysPerWeek: number;
  minutesPerSession: number;
  // مرحله ۵
  nutritionEnabled: boolean;
  mealsPerDay: number;
  dietaryRestrictions: string;
}

export interface AIResult {
  analysis: {
    bmi: number;
    bmiStatus: string;
    recommendedPhase: string;
    timeEstimate: string;
    importantNote: string;
  };
  program: {
    weeklyPlan: DayPlan[];
  };
}

export interface DayPlan {
  day: string;
  muscleGroups: string[];
  isRest: boolean;
  exercises: Exercise[];
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  homeAlternative: string;
  notes: string;
}