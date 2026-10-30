-- =================================================================
-- FLAMINGO E-COMMERCE PLATFORM
-- Migration: Core Engines 1 to 4
-- Serial 15: Dynamic Pricing, MLM Downline, 72h Release Cycle, Wallet Ledger
-- =================================================================

-- -------------------------------------------------------------
-- MODULE 1: DYNAMIC PRICING & MARGIN SETTINGS (Singleton Table)
-- -------------------------------------------------------------
create table if not exists public.pricing_settings (
  id text primary key default 'default',
  opex_percentage numeric not null default 8.5,
  growth_pool_percentage numeric not null default 12.0,
  net_profit_percentage numeric not null default 10.0,
  advance_delivery_inside_city numeric not null default 80,
  advance_delivery_outside_city numeric not null default 150,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Seed default pricing settings
insert into public.pricing_settings (
  id, opex_percentage, growth_pool_percentage, net_profit_percentage,
  advance_delivery_inside_city, advance_delivery_outside_city
) values ('default', 8.5, 12.0, 10.0, 80, 150)
on conflict (id) do update set
  opex_percentage = excluded.opex_percentage,
  growth_pool_percentage = excluded.growth_pool_percentage,
  net_profit_percentage = excluded.net_profit_percentage,
  advance_delivery_inside_city = excluded.advance_delivery_inside_city,
  advance_delivery_outside_city = excluded.advance_delivery_outside_city;

-- Alter Products table to store warehouse cost price
alter table public.products add column if not exists cost_price numeric default 0;

-- -------------------------------------------------------------
-- MODULE 2: PROFILES & MLM ANCESTOR CHAINS
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id text primary key,
  name text not null,
  phone text not null unique,
  email text,
  password_hash text,
  referrer_id text references public.profiles(id) on delete set null,
  referral_code text unique,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_profiles_referrer on public.profiles(referrer_id);
create index if not exists idx_profiles_ref_code on public.profiles(referral_code);

create table if not exists public.mlm_chains (
  id bigserial primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  upline_id text not null references public.profiles(id) on delete cascade,
  tier_level integer not null, -- 1 = Direct, 2 = Upline 2, 3 = Upline 3, etc.
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, upline_id)
);

create index if not exists idx_mlm_chains_user on public.mlm_chains(user_id);
create index if not exists idx_mlm_chains_upline on public.mlm_chains(upline_id);

-- Alter Orders table for 72h cycle, wallet & advance payment tracking
alter table public.orders add column if not exists delivered_at timestamp with time zone;
alter table public.orders add column if not exists wallet_used_amount numeric default 0;
alter table public.orders add column if not exists advance_paid_amount numeric default 0;
alter table public.orders add column if not exists advance_trx_id text;
alter table public.orders add column if not exists advance_payment_method text default 'bKash';
alter table public.orders add column if not exists mlm_processed boolean default false;
alter table public.orders add column if not exists mlm_note text;

-- -------------------------------------------------------------
-- MODULE 3 & 4: CUSTOMER WALLETS, LEDGER & COMMISSIONS
-- -------------------------------------------------------------
create table if not exists public.customer_wallets (
  id text primary key default ('wlt_' || substr(md5(random()::text), 1, 10)),
  user_id text not null unique references public.profiles(id) on delete cascade,
  available_balance numeric not null default 0 check (available_balance >= 0),
  pending_balance numeric not null default 0 check (pending_balance >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_customer_wallets_user on public.customer_wallets(user_id);

create table if not exists public.wallet_transactions (
  id text primary key default ('tx_' || substr(md5(random()::text), 1, 12)),
  user_id text not null references public.profiles(id) on delete cascade,
  amount numeric not null,
  transaction_type text not null check (transaction_type in ('CREDIT_REFERRAL', 'DEBIT_PURCHASE', 'CASHBACK', 'VOID_RETURN')),
  reference_order_id text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_wallet_tx_user on public.wallet_transactions(user_id);
create index if not exists idx_wallet_tx_order on public.wallet_transactions(reference_order_id);

create table if not exists public.referral_commissions (
  id text primary key default ('comm_' || substr(md5(random()::text), 1, 12)),
  order_id text not null references public.orders(id) on delete cascade,
  order_item_total numeric not null default 0,
  buyer_user_id text not null,
  upline_user_id text not null references public.profiles(id) on delete cascade,
  tier_level integer not null,
  commission_percentage numeric not null,
  commission_amount numeric not null,
  status text not null default 'pending_release' check (status in ('pending_release', 'credited', 'voided')),
  delivered_at timestamp with time zone not null,
  release_due_at timestamp with time zone not null,
  credited_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_ref_comm_order on public.referral_commissions(order_id);
create index if not exists idx_ref_comm_upline on public.referral_commissions(upline_user_id);
create index if not exists idx_ref_comm_status_due on public.referral_commissions(status, release_due_at);

-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- -------------------------------------------------------------
alter table public.pricing_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.mlm_chains enable row level security;
alter table public.customer_wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.referral_commissions enable row level security;

-- Public Anon Read & Write Policies for Frontend React App
create policy "Allow public read on pricing_settings" on public.pricing_settings for select using (true);
create policy "Allow public write on pricing_settings" on public.pricing_settings for all using (true);

create policy "Allow public read on profiles" on public.profiles for select using (true);
create policy "Allow public write on profiles" on public.profiles for all using (true);

create policy "Allow public read on mlm_chains" on public.mlm_chains for select using (true);
create policy "Allow public write on mlm_chains" on public.mlm_chains for all using (true);

create policy "Allow public read on customer_wallets" on public.customer_wallets for select using (true);
create policy "Allow public write on customer_wallets" on public.customer_wallets for all using (true);

create policy "Allow public read on wallet_transactions" on public.wallet_transactions for select using (true);
create policy "Allow public write on wallet_transactions" on public.wallet_transactions for all using (true);

create policy "Allow public read on referral_commissions" on public.referral_commissions for select using (true);
create policy "Allow public write on referral_commissions" on public.referral_commissions for all using (true);

-- -------------------------------------------------------------
-- STORED PROCEDURES & PL/PGSQL FUNCTIONS
-- -------------------------------------------------------------

-- 1. Calculate Selling Price (MRP) from Base Cost Price
create or replace function public.calculate_selling_price(p_cost_price numeric)
returns jsonb
language plpgsql
as $$
declare
  v_opex numeric;
  v_growth numeric;
  v_profit numeric;
  v_total_margin numeric;
  v_selling_price numeric;
begin
  select opex_percentage, growth_pool_percentage, net_profit_percentage
  into v_opex, v_growth, v_profit
  from public.pricing_settings
  where id = 'default'
  limit 1;
  
  if not found then
    v_opex := 8.5;
    v_growth := 12.0;
    v_profit := 10.0;
  end if;
  
  v_total_margin := v_opex + v_growth + v_profit; -- e.g. 30.5%
  v_selling_price := round(p_cost_price / (1.0 - (v_total_margin / 100.0)));
  
  return jsonb_build_object(
    'cost_price', p_cost_price,
    'opex_percentage', v_opex,
    'growth_pool_percentage', v_growth,
    'net_profit_percentage', v_profit,
    'total_margin_percentage', v_total_margin,
    'allocated_opex', round((v_selling_price * v_opex) / 100.0),
    'allocated_growth', round((v_selling_price * v_growth) / 100.0),
    'allocated_net_profit', round((v_selling_price * v_profit) / 100.0),
    'selling_price', v_selling_price
  );
end;
$$;

-- 2. Increment Pending Wallet Balance Helper
create or replace function public.increment_pending_wallet(p_user_id text, p_amount numeric)
returns void
language plpgsql
as $$
begin
  insert into public.customer_wallets (user_id, available_balance, pending_balance, updated_at)
  values (p_user_id, 0, p_amount, now())
  on conflict (user_id) do update set
    pending_balance = public.customer_wallets.pending_balance + p_amount,
    updated_at = now();
end;
$$;

-- 3. Hourly Scheduled Cron Release: Move Matured 72-Hour Commissions to Available Balance
create or replace function public.process_matured_commissions()
returns integer
language plpgsql
as $$
declare
  r record;
  v_count integer := 0;
begin
  for r in
    select id, upline_user_id, commission_amount, order_id, tier_level
    from public.referral_commissions
    where status = 'pending_release'
      and release_due_at <= now()
    for update
  loop
    -- 1. Update commission record
    update public.referral_commissions
    set status = 'credited', credited_at = now()
    where id = r.id;

    -- 2. Update recipient wallet: pending -> available
    insert into public.customer_wallets (user_id, available_balance, pending_balance, updated_at)
    values (r.upline_user_id, r.commission_amount, 0, now())
    on conflict (user_id) do update set
      pending_balance = greatest(0, public.customer_wallets.pending_balance - r.commission_amount),
      available_balance = public.customer_wallets.available_balance + r.commission_amount,
      updated_at = now();

    -- 3. Log credit transaction
    insert into public.wallet_transactions (
      id, user_id, amount, transaction_type, reference_order_id, description, created_at
    ) values (
      'tx_' || substr(md5(random()::text), 1, 12),
      r.upline_user_id,
      r.commission_amount,
      'CREDIT_REFERRAL',
      r.order_id,
      'রেফারেল কমিশন প্রাপ্তি (অর্ডার: ' || r.order_id || ', টিয়ার: ' || r.tier_level || ')',
      now()
    );

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- 4. Void Pending Commissions when an Order is Canceled or Returned
create or replace function public.void_order_commissions(p_order_id text)
returns integer
language plpgsql
as $$
declare
  r record;
  v_count integer := 0;
begin
  for r in
    select id, upline_user_id, commission_amount
    from public.referral_commissions
    where order_id = p_order_id
      and status = 'pending_release'
    for update
  loop
    -- 1. Set status to voided
    update public.referral_commissions
    set status = 'voided'
    where id = r.id;

    -- 2. Decrement pending balance
    update public.customer_wallets
    set pending_balance = greatest(0, pending_balance - r.commission_amount),
        updated_at = now()
    where user_id = r.upline_user_id;

    -- 3. Log void transaction
    insert into public.wallet_transactions (
      id, user_id, amount, transaction_type, reference_order_id, description, created_at
    ) values (
      'tx_void_' || substr(md5(random()::text), 1, 12),
      r.upline_user_id,
      -r.commission_amount,
      'VOID_RETURN',
      p_order_id,
      'অর্ডার বাতিল/ফেরত হওয়ায় পেন্ডিং কমিশন বাতিল করা হয়েছে (অর্ডার: ' || p_order_id || ')',
      now()
    );

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

-- 5. Debit Customer Spendable Wallet Balance on Checkout
create or replace function public.debit_customer_wallet(p_user_id text, p_order_id text, p_amount numeric)
returns boolean
language plpgsql
as $$
declare
  v_current_balance numeric := 0;
begin
  select available_balance into v_current_balance
  from public.customer_wallets
  where user_id = p_user_id
  for update;

  if not found or v_current_balance < p_amount then
    return false;
  end if;

  update public.customer_wallets
  set available_balance = available_balance - p_amount,
      updated_at = now()
  where user_id = p_user_id;

  insert into public.wallet_transactions (
    id, user_id, amount, transaction_type, reference_order_id, description, created_at
  ) values (
    'tx_deb_' || substr(md5(random()::text), 1, 12),
    p_user_id,
    -p_amount,
    'DEBIT_PURCHASE',
    p_order_id,
    'চেকআউট প্রোডাক্ট বিল পরিশোধ (অর্ডার: ' || p_order_id || ')',
    now()
  );

  return true;
end;
$$;

-- -------------------------------------------------------------
-- HOURLY CRON JOB SETUP (Supabase pg_cron Extension)
-- -------------------------------------------------------------
-- Run this in Supabase SQL editor if pg_cron extension is enabled:
-- select cron.schedule(
--   'release-matured-commissions-hourly',
--   '0 * * * *',
--   'select public.process_matured_commissions();'
-- );
