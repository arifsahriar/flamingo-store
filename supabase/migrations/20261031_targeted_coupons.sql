-- =================================================================
-- FLAMINGO E-COMMERCE PLATFORM
-- Migration: Targeted Individual Coupons, Usage Limits & Min Order Values
-- Date: 2026-10-31
-- =================================================================

-- Upgrade Coupons table to support targeted users, min spend, and user limits
alter table public.coupons 
  add column if not exists target_audience text not null default 'GLOBAL',
  add column if not exists assigned_customer_phone text,
  add column if not exists assigned_customer_email text,
  add column if not exists assigned_customer_name text,
  add column if not exists usage_limit_per_user integer not null default 1,
  add column if not exists min_order_value numeric not null default 0,
  add column if not exists used_count integer not null default 0;
