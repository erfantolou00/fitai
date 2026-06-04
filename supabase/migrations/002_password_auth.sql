-- Migration 002: Classic password auth fields
-- Run in Supabase SQL Editor after 001_initial_schema.sql

alter table public.profiles
  add column if not exists username text unique,
  add column if not exists email text;

alter table public.profiles drop constraint if exists profiles_auth_provider_check;
alter table public.profiles add constraint profiles_auth_provider_check
  check (auth_provider in ('phone', 'google', 'password'));

create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_profiles_email on public.profiles(email);

-- Update trigger for new users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id, full_name, username, phone, email, avatar_url, auth_provider
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'username', new.email),
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'email', new.email),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    coalesce(new.raw_user_meta_data->>'auth_provider', 'password')
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    username = coalesce(excluded.username, profiles.username),
    phone = coalesce(excluded.phone, profiles.phone),
    email = coalesce(excluded.email, profiles.email),
    avatar_url = coalesce(excluded.avatar_url, profiles.avatar_url),
    updated_at = now();
  return new;
end;
$$;
