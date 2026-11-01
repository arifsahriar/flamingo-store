-- Migration: Virtual Try-On (VTON) Profile Fields & Store Config
alter table public.profiles add column if not exists user_photo_url text;
alter table public.profiles add column if not exists height_cm numeric;
alter table public.profiles add column if not exists weight_kg numeric;
alter table public.profiles add column if not exists gender text check (gender in ('male', 'female', 'other'));
alter table public.profiles add column if not exists daily_tryon_used integer not null default 0;
alter table public.profiles add column if not exists last_tryon_date text;

alter table public.customers add column if not exists user_photo_url text;
alter table public.customers add column if not exists height_cm numeric;
alter table public.customers add column if not exists weight_kg numeric;
alter table public.customers add column if not exists gender text check (gender in ('male', 'female', 'other'));
alter table public.customers add column if not exists daily_tryon_used integer not null default 0;
alter table public.customers add column if not exists last_tryon_date text;
