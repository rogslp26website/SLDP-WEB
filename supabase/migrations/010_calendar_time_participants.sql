-- Calendar: optional time and participants (participants visible to admins only in UI)
alter table public.calendar_events
  add column if not exists event_time time,
  add column if not exists event_end_time time,
  add column if not exists participants text;

-- Merge mentor into facilitator (one role: SALT Facilitator/Mentor)
update public.profiles set role = 'facilitator' where role = 'mentor';
