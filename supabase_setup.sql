-- RUN THIS IN YOUR SUPABASE SQL EDITOR --

-- 1. Create Projects Table
create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text not null,
  tags text[] default '{}',
  link text,
  image_url text
);

-- 2. Create Profile Table (Hero)
create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  role text not null,
  description text not null,
  image_url text
);

-- 3. Create About Info Table
create table if not exists about_info (
  id uuid default gen_random_uuid() primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  subtitle text,
  description text[],
  skills text[],
  resumes jsonb default '[]'::jsonb,
  -- Note: Using jsonb for complex resume array
  constraint resumes_is_array check (jsonb_typeof(resumes) = 'array')
);

-- 4. Create Contact Info Table
create table if not exists contact_info (
  id uuid default gen_random_uuid() primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text,
  subtitle text,
  description text,
  email text,
  phone text,
  linkedin text,
  github text
);

-- 5. Create Contact Messages Table
create table if not exists contact_messages (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text,
  email text,
  phone text,
  message text
);

-- 6. Enable RLS (Security) on all tables
alter table projects enable row level security;
alter table profiles enable row level security;
alter table about_info enable row level security;
alter table contact_info enable row level security;
alter table contact_messages enable row level security;

-- 7. Create "Allow All" Policies 
-- Dropping first avoids "policy already exists" errors
drop policy if exists "Public Access" on projects;
create policy "Public Access" on projects for all using (true) with check (true);

drop policy if exists "Public Access" on profiles;
create policy "Public Access" on profiles for all using (true) with check (true);

drop policy if exists "Public Access" on about_info;
create policy "Public Access" on about_info for all using (true) with check (true);

drop policy if exists "Public Access" on contact_info;
create policy "Public Access" on contact_info for all using (true) with check (true);

drop policy if exists "Public Access" on contact_messages;
create policy "Public Access" on contact_messages for all using (true) with check (true);
