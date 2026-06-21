export type AuthProvider = 'phone' | 'google' | 'password';

export interface DbProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  auth_provider: AuthProvider | null;
  onboarding_completed: boolean;
  default_plan_id: string | null;
  free_trial_expires_at: string | null;
  nutrition_paid: boolean;
  paid_plan_credits: number;
  created_at: string;
  updated_at: string;
}

export interface DbFitnessProfile {
  id: string;
  user_id: string;
  age: number;
  gender: 'male' | 'female';
  height: number;
  current_weight: number;
  target_weight: number;
  fitness_level: string;
  experience_months: number;
  injuries: string;
  goal: string;
  location: string;
  days_per_week: number;
  minutes_per_session: number;
  nutrition_enabled: boolean;
  meals_per_day: number;
  dietary_restrictions: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbWorkoutPlan {
  id: string;
  user_id: string;
  fitness_profile_id: string | null;
  analysis: Record<string, unknown>;
  program: Record<string, unknown>;
  nutrition: Record<string, unknown> | null;
  title: string | null;
  created_at: string;
}

export interface DbOtpVerification {
  id: string;
  phone: string;
  code_hash: string;
  expires_at: string;
  attempts: number;
  verified: boolean;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: DbProfile;
        Insert: Partial<DbProfile> & { id: string };
        Update: Partial<DbProfile>;
      };
      fitness_profiles: {
        Row: DbFitnessProfile;
        Insert: Omit<DbFitnessProfile, 'id' | 'created_at' | 'updated_at' | 'is_active'> & {
          id?: string;
          is_active?: boolean;
        };
        Update: Partial<DbFitnessProfile>;
      };
      workout_plans: {
        Row: DbWorkoutPlan;
        Insert: Omit<DbWorkoutPlan, 'id' | 'created_at'> & { id?: string };
        Update: Partial<DbWorkoutPlan>;
      };
      otp_verifications: {
        Row: DbOtpVerification;
        Insert: Omit<DbOtpVerification, 'id' | 'created_at' | 'attempts' | 'verified'> & {
          id?: string;
          attempts?: number;
          verified?: boolean;
        };
        Update: Partial<DbOtpVerification>;
      };
    };
  };
}
