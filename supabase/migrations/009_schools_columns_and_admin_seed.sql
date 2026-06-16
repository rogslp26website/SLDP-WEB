-- Re-apply schools optional columns (idempotent; fixes schema cache if 007 was missed)
alter table public.schools
  add column if not exists principal text,
  add column if not exists salt_coordinator_name text,
  add column if not exists salt_coordinator_contacts text,
  add column if not exists county text,
  add column if not exists address text;

-- Convert specified user to SALT Hub admin (Emily Wawira - auth_user_id from profiles)
insert into public.salt_hub_admins (auth_user_id)
values ('d035eb82-912a-4445-9748-f5238878e273')
on conflict (auth_user_id) do nothing;
