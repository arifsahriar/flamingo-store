-- =================================================================
-- FLAMINGO E-COMMERCE PLATFORM
-- Migration: Modular Payment Gateways & Cash on Delivery (COD) Defaults
-- Date: 2026-10-31
-- =================================================================

-- Add payment_method, payment_status, and order_status columns to orders table
alter table public.orders 
  add column if not exists payment_method text not null default 'COD',
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists order_status text not null default 'pending';
