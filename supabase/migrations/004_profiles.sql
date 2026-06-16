-- User profiles: identity + role/school/county after sign-up (before programme registration).
-- Used for selection process and role-based access (e.g. only students/coordinators/facilitators get resources).
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('student_leader', 'salt_coordinator', 'facilitator', 'volunteer', 'other')),
  school_id uuid references public.schools(id) on delete set null,
  county text,
  phone text,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(auth_user_id)
);

alter table public.profiles enable row level security;

-- Users can read and update their own profile (for onboarding)
create policy "Users read own profile" on public.profiles for select using (auth.uid() = auth_user_id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = auth_user_id);
-- Insert only via service role or on first onboarding (user inserts own row with auth_user_id = auth.uid())
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = auth_user_id);

-- Admins read all via service role (no policy = service role only for other ops).
