-- FitAI Database Schema
-- Run this in Supabase SQL Editor

-- ─── Profiles (extends auth.users) ───
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text unique,
  avatar_url text,
  auth_provider text check (auth_provider in ('phone', 'google')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Fitness profiles (onboarding data) ───
create table if not exists public.fitness_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  age int not null,
  gender text not null check (gender in ('male', 'female')),
  height int not null,
  current_weight numeric not null,
  target_weight numeric not null,
  fitness_level text not null,
  experience_months int not null default 0,
  injuries text not null default '',
  goal text not null,
  location text not null,
  days_per_week int not null,
  minutes_per_session int not null,
  nutrition_enabled boolean not null default false,
  meals_per_day int not null default 3,
  dietary_restrictions text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_fitness_profiles_user_id on public.fitness_profiles(user_id);
create index if not exists idx_fitness_profiles_active on public.fitness_profiles(user_id, is_active);

-- ─── Workout plans (AI results) ───
create table if not exists public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  fitness_profile_id uuid references public.fitness_profiles(id) on delete set null,
  analysis jsonb not null default '{}',
  program jsonb not null default '{}',
  nutrition jsonb,
  title text,
  created_at timestamptz not null default now()
);

create index if not exists idx_workout_plans_user_id on public.workout_plans(user_id);
create index if not exists idx_workout_plans_created on public.workout_plans(user_id, created_at desc);

-- ─── OTP verifications (Kavenegar) ───
create table if not exists public.otp_verifications (
  id uuid primary key default gen_random_uuid(),
  phone text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_otp_phone on public.otp_verifications(phone, verified, created_at desc);

-- ─── Auto-create profile on signup ───
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, auth_provider, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    coalesce(new.raw_user_meta_data->>'auth_provider', 'google'),
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Updated_at trigger ───
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists fitness_profiles_updated_at on public.fitness_profiles;
create trigger fitness_profiles_updated_at
  before update on public.fitness_profiles
  for each row execute procedure public.set_updated_at();

-- ─── Row Level Security ───
alter table public.profiles enable row level security;
alter table public.fitness_profiles enable row level security;
alter table public.workout_plans enable row level security;
alter table public.otp_verifications enable row level security;

-- Profiles
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- Fitness profiles
create policy "fitness_profiles_all_own" on public.fitness_profiles
  for all using (auth.uid() = user_id);

-- Workout plans
create policy "workout_plans_all_own" on public.workout_plans
  for all using (auth.uid() = user_id);

-- OTP: no public access (server uses service role)
create policy "otp_deny_all" on public.otp_verifications
  for all using (false);
