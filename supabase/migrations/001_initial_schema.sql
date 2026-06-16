-- RoG SLP: schools (normalized name for deduplication)
create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_normalized text not null unique,
  created_at timestamptz not null default now()
);

-- Students: linked to auth and school; creates sign-in account
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  school_id uuid not null references public.schools(id) on delete restrict,
  grade text not null,
  email text not null unique,
  phone text,
  principal_contact text,
  created_at timestamptz not null default now()
);

-- Teachers: linked to auth and school; creates sign-in account
create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  school_id uuid not null references public.schools(id) on delete restrict,
  phone text,
  email text not null unique,
  principal_contact text,
  created_at timestamptz not null default now()
);

-- Panelists: no auth account
create table if not exists public.panelists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  alma_mater text,
  phone text,
  email text not null,
  field_of_practice text,
  how_heard text,
  availability_speaking text,
  prior_notice_duration text,
  created_at timestamptz not null default now()
);

-- Mentors: no auth account; availability for mentorship
create table if not exists public.mentors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  alma_mater text,
  phone text,
  email text not null,
  field_of_practice text,
  how_heard text,
  availability_mentorship text,
  prior_notice_duration text,
  created_at timestamptz not null default now()
);

-- Volunteers: no auth account; no field_of_practice
create table if not exists public.volunteers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  alma_mater text,
  phone text,
  email text not null,
  how_heard text,
  availability_speaking text,
  prior_notice_duration text,
  created_at timestamptz not null default now()
);

-- RLS: enable and allow service role / authenticated reads as needed
alter table public.schools enable row level security;
alter table public.students enable row level security;
alter table public.teachers enable row level security;
alter table public.panelists enable row level security;
alter table public.mentors enable row level security;
alter table public.volunteers enable row level security;

-- Allow anon/authenticated to read schools (for dropdown)
create policy "Schools are readable by anon" on public.schools for select using (true);

-- Allow service role to do everything (API uses service role for registration)
-- Authenticated users can read their own student/teacher row
create policy "Students read own" on public.students for select using (auth.uid() = auth_user_id);
create policy "Teachers read own" on public.teachers for select using (auth.uid() = auth_user_id);

-- Insert/update from API only via service role (no policy = only service role)
-- So we don't add insert/select for anon on students/teachers/panelists/mentors/volunteers;
-- the API route uses createServiceClient() which bypasses RLS.
