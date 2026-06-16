-- Preferences for volunteers, mentors, panelists (and facilitators): notice period, availability, etc.
alter table public.profiles
  add column if not exists alma_mater text,
  add column if not exists how_heard text,
  add column if not exists availability_notes text,
  add column if not exists prior_notice_duration text,
  add column if not exists field_of_practice text;

-- Allow mentor and panelist as profile roles (for onboarding preferences).
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (
  role in ('student_leader', 'salt_coordinator', 'facilitator', 'volunteer', 'mentor', 'panelist', 'other')
);
