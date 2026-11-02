-- =================================================================
-- FLAMINGO: PROFILES ROLE MANAGEMENT & RLS POLICIES MIGRATION
-- Supports Admin User Management Screen & Role Based Access Control
-- =================================================================

-- 1. Ensure public.profiles table exists with role column
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  email text unique,
  phone text unique,
  role text not null default 'customer' check (role in ('customer', 'moderator', 'super_admin')),
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- If table already exists, ensure role column and constraint are present
alter table public.profiles add column if not exists role text not null default 'customer';
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- 2. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- 3. Configure public read, insert, and update policies
drop policy if exists "Allow public read on profiles" on public.profiles;
drop policy if exists "Allow public write on profiles" on public.profiles;
drop policy if exists "Allow public insert on profiles" on public.profiles;
drop policy if exists "Allow public update on profiles" on public.profiles;

create policy "Allow public read on profiles" on public.profiles for select using (true);
create policy "Allow public insert on profiles" on public.profiles for insert with check (true);
create policy "Allow public update on profiles" on public.profiles for update using (true);

-- 4. Seed initial default admin and staff profiles
insert into public.profiles (
  id,
  full_name,
  email,
  phone,
  role
) values 
(
  '11111111-1111-4111-8111-111111111111',
  'FLAMINGO Super Admin',
  'admin@flamingostore.com',
  '01700000001',
  'super_admin'
),
(
  '22222222-2222-4222-8222-222222222222',
  'Order Moderator',
  'moderator@flamingostore.com',
  '01700000002',
  'moderator'
)
on conflict (id) do update set
  role = excluded.role,
  full_name = excluded.full_name;
