-- Default plan, free trial, and mock billing flags
alter table public.profiles
  add column if not exists default_plan_id uuid references public.workout_plans(id) on delete set null,
  add column if not exists free_trial_expires_at timestamptz,
  add column if not exists nutrition_paid boolean not null default false,
  add column if not exists paid_plan_credits integer not null default 0;

create index if not exists idx_profiles_default_plan on public.profiles(default_plan_id);
