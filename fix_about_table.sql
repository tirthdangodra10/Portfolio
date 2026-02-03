-- RUN THIS IN SUPABASE SQL EDITOR TO RESET ABOUT TABLE --

DROP TABLE IF EXISTS about_info;

create table about_info (
  id uuid default gen_random_uuid() primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  subtitle text,
  description text[],
  skills text[],
  resumes jsonb default '[]'::jsonb
);

alter table about_info enable row level security;
create policy "Public Access" on about_info for all using (true) with check (true);
