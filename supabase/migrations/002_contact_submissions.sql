-- Contact RoG SLDP form submissions (from Contact Us page)
create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  school_organization text not null,
  role text not null,
  role_other text,
  phone text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

-- Only service role can insert/read (no anon insert for spam control; API uses service role)
-- Optionally add a policy later for authenticated admins to SELECT if you build an admin view.
