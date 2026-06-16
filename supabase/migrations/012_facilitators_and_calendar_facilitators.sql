-- Facilitators: list for calendar event assignment (dropdown)
create table if not exists public.facilitators (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

alter table public.facilitators enable row level security;

-- Calendar event facilitators: up to 4 per event (enforced in app)
create table if not exists public.calendar_event_facilitators (
  event_id uuid not null references public.calendar_events(id) on delete cascade,
  facilitator_id uuid not null references public.facilitators(id) on delete cascade,
  primary key (event_id, facilitator_id)
);

alter table public.calendar_event_facilitators enable row level security;
