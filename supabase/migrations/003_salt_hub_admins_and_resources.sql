-- SALT Hub admins: list of auth user ids who can access dashboard and admin APIs
create table if not exists public.salt_hub_admins (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(auth_user_id)
);

alter table public.salt_hub_admins enable row level security;

-- No RLS policies: only service role (and thus admin API routes) can read; admins are managed via Dashboard or service role.

-- Programme resources: metadata for files stored in Supabase Storage (bucket: resources)
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  storage_key text not null,
  file_label text,
  created_at timestamptz not null default now()
);

alter table public.resources enable row level security;

-- Allow authenticated users to read resources (for /api/resources used by students/teachers)
create policy "Resources readable by authenticated" on public.resources for select to authenticated using (true);

-- Insert/update/delete only via service role (admin APIs).
