-- The Breathing Bell — Supabase Schema
-- Run this in your Supabase SQL editor

-- Users table (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  age_range text not null,
  subscription_tier text not null default 'free',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Sessions table
create table public.sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  age_range text not null,
  technique text not null,
  domain text not null,
  walking_in_state text not null,
  duration_minutes int not null,
  echo_text text not null,
  completed_at timestamptz default now()
);

alter table public.sessions enable row level security;

create policy "Users can view own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Profile is created manually on first save with name + age
  return new;
end;
$$ language plpgsql security definer;

-- Helper: get session count for a user (used for time unlock)
create or replace function public.get_session_count(user_uuid uuid)
returns int as $$
  select count(*)::int from public.sessions where user_id = user_uuid;
$$ language sql security definer;
