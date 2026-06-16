-- Notice attachments: file metadata; files stored in Supabase Storage bucket "notice-attachments"
-- Create the bucket in Dashboard: Storage > New bucket > name "notice-attachments" (private or public per your needs)
create table if not exists public.notice_attachments (
  id uuid primary key default gen_random_uuid(),
  notice_id uuid not null references public.notices(id) on delete cascade,
  storage_key text not null,
  file_name text not null,
  content_type text,
  created_at timestamptz not null default now()
);

create index if not exists notice_attachments_notice_id_idx on public.notice_attachments(notice_id);
alter table public.notice_attachments enable row level security;
