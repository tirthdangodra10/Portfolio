-- RUN THIS IN YOUR SUPABASE SQL EDITOR --

-- 1. Create Projects Table
create table projects (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text not null,
  tags text[] default '{}',
  link text,
  image_url text
);

-- 2. Create Profile Table (for Hero Section)
create table profiles (
  id uuid default gen_random_uuid() primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  role text not null,
  description text not null,
  image_url text
);

-- 3. Initial Hero Data (Optional - you can add it through the UI later)
-- insert into profiles (name, role, description, image_url) 
-- values ('Your Name', 'Your Role', 'Your Description', 'https://...');

-- 4. Enable Row Level Security (RLS)
alter table projects enable row level security;
alter table profiles enable row level security;

-- 5. Create Public Access Policies (Everyone can read)
create policy "Allow public read-only access" on projects for select using (true);
create policy "Allow public read-only access" on profiles for select using (true);

-- 6. Create Service Role Policies (Temporary: Allow all for setup)
-- NOTE: In a real app, you'd use Authentication to restrict this 
-- to only your user account. For now, this allows the frontend to write.
create policy "Allow all for anyone with anon key" on projects for all using (true) with check (true);
create policy "Allow all for anyone with anon key" on profiles for all using (true) with check (true);
