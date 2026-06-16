-- Admin-only file storage (bucket: admin-resources). Not visible to programme users.
create table if not exists public.admin_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  storage_key text not null,
  file_label text,
  created_at timestamptz not null default now()
);

alter table public.admin_resources enable row level security;

-- Only service role (admin API) can access; no policies for anon/authenticated.
-- Admins use dashboard which calls API with service role.
