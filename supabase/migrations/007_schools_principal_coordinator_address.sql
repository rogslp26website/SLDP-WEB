-- Register School: principal, SALT coordinator (to link to registered SALT Coordinator later), county, address
alter table public.schools
  add column if not exists principal text,
  add column if not exists salt_coordinator_name text,
  add column if not exists salt_coordinator_contacts text,
  add column if not exists county text,
  add column if not exists address text;
