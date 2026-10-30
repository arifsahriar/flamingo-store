-- =================================================================
-- FLAMINGO 925 Sterling Silver Jewelry — Supabase Database Schema
-- Serial 14: Supabase Database Integration
-- =================================================================

-- 1. PRODUCTS TABLE
create table if not exists public.products (
  id text primary key,
  name text not null,
  slug text,
  price numeric not null default 0,
  discount_price numeric,
  category text,
  images jsonb default '[]'::jsonb,
  stock integer default 20,
  warranty_days integer default 0,
  warranty_desc text,
  description text,
  short_description text,
  purity text default '৯২৫ স্টার্লিং সিলভার',
  coating text default 'অ্যান্টি-টার্নিশ রোডিয়াম ফিনিশ',
  specs jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. ORDERS TABLE
create table if not exists public.orders (
  id text primary key,
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  delivery_city text,
  delivery_fee numeric default 0,
  total_amount numeric default 0,
  discount_amount numeric default 0,
  coupon_code text,
  referred_by text,
  status text default 'নতুন অর্ডার (Pending)',
  items jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. CUSTOMERS TABLE
create table if not exists public.customers (
  id text primary key,
  name text not null,
  phone text not null unique,
  email text,
  password_hash text,
  referral_code text unique,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. COUPONS TABLE
create table if not exists public.coupons (
  id text primary key,
  code text not null unique,
  discount_amount numeric not null default 0,
  discount_type text default 'flat', -- 'flat' | 'percentage'
  min_spend numeric default 0,
  min_order_value numeric default 0,
  is_exclusive boolean default false,
  target_audience text default 'GLOBAL', -- 'GLOBAL' | 'INDIVIDUAL'
  assigned_user_id text,
  assigned_customer_phone text,
  assigned_customer_email text,
  assigned_customer_name text,
  usage_limit_per_user integer default 1,
  used_count integer default 0,
  expiry_date timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security (RLS) Configuration
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.customers enable row level security;
alter table public.coupons enable row level security;

-- Public Anon Read & Write Policies
create policy "Allow public read on products" on public.products for select using (true);
create policy "Allow public insert/update on products" on public.products for all using (true);

create policy "Allow public read on orders" on public.orders for select using (true);
create policy "Allow public insert/update on orders" on public.orders for all using (true);

create policy "Allow public read on customers" on public.customers for select using (true);
create policy "Allow public insert/update on customers" on public.customers for all using (true);

create policy "Allow public read on coupons" on public.coupons for select using (true);
create policy "Allow public insert/update on coupons" on public.coupons for all using (true);

-- =================================================================
-- SEED INITIAL DATA: Default PRODUCTS
-- =================================================================
insert into public.products (
  id, name, slug, price, discount_price, category, images, stock, warranty_days, warranty_desc, description, short_description, purity, coating, specs
) values 
(
  'solitaire-pendant',
  'Solitaire Pendant Necklace',
  'solitaire-pendant-necklace',
  1850,
  2200,
  'Necklace',
  '["https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop"]'::jsonb,
  25,
  180,
  '৬ মাসের ফ্রি পলিশিং ওয়ারেন্টি',
  'প্রতিটি গহনায় রয়েছে আন্তর্জাতিক ৯২৫ সিলভার হলমার্ক নিশ্চয়তা, অ্যান্টি-টার্নিশ ফিনিশিং এবং সংবেদনশীল ত্বকের জন্য শতভাগ অ্যালার্জি-মুক্ত সুরক্ষা। ক্লাসিক ও ক্যাজুয়াল উভয় সাজেই নিখুঁত মানিয়ে যায়।',
  'খাঁটি ৯২৫ স্টার্লিং সিলভারের স্নিগ্ধ আভিজাত্য — যা আপনার প্রতিদিনের সৌন্দর্যকে করে তোলে চিরস্থায়ী।',
  '৯২৫ স্টার্লিং সিলভার',
  'অ্যান্টি-টার্নিশ রোডিয়াম ফিনিশ',
  '{"material": "925 Sterling Silver", "plating": "Rhodium Plated", "stone": "AAA+ Cubic Zirconia", "chainLength": "40cm + 5cm adjustable"}'::jsonb
)
on conflict (id) do nothing;

insert into public.products (
  id, name, slug, price, discount_price, category, images, stock, warranty_days, warranty_desc, description, short_description, purity, coating, specs
) values 
(
  'emerald-silver-ring',
  'Emerald Cut Silver Ring',
  'emerald-cut-silver-ring',
  2100,
  2500,
  'Ring',
  '["https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop"]'::jsonb,
  15,
  365,
  '১ বছরের অ্যান্টি-টার্নিশ গ্যারান্টি',
  'হাতে পরার সাথে সাথেই দেবে একটি রাজকীয় লুক। প্রিমিয়াম কোটিংয়ের কারণে কালচে হওয়ার কোনো ভয় নেই।',
  'পান্না কাটিং লাক্সারি গ্রিন জির্কন বসানো খাঁটি সিলভার আংটি।',
  '৯২৫ স্টার্লিং সিলভার',
  'অ্যান্টি-টার্নিশ রোডিয়াম ফিনিশ',
  '{"material": "925 Sterling Silver", "plating": "Platinum Polish", "stone": "Synthetic Emerald & CZ", "size": "Adjustable / Free Size"}'::jsonb
)
on conflict (id) do nothing;

insert into public.products (
  id, name, slug, price, discount_price, category, images, stock, warranty_days, warranty_desc, description, short_description, purity, coating, specs
) values 
(
  'minimal-silver-cuff',
  'Classic Minimal Silver Cuff',
  'classic-minimal-silver-cuff',
  1950,
  2300,
  'Bracelet',
  '["https://images.unsplash.com/photo-1611591475155-4286fa7c2e7f?q=80&w=800&auto=format&fit=crop"]'::jsonb,
  20,
  0,
  'কোনো ওয়ারেন্টি নেই',
  'দৈনন্দিন অফিস বা ক্যাজুয়াল আউটফিটের সাথে পরার জন্য পারফেক্ট। যেকোনো হাতের সাইজের সাথে অ্যাডজাস্ট করা যায়।',
  'সিম্পল এবং এলিগ্যান্ট ডিজাইনের হ্যান্ডক্রাফটেড ব্রেসলেট।',
  '৯২৫ স্টার্লিং সিলভার',
  'অ্যান্টি-টার্নিশ রোডিয়াম ফিনিশ',
  '{"material": "925 Sterling Silver", "plating": "Rhodium Plated", "stone": "None", "diameter": "60mm (Flexible)"}'::jsonb
)
on conflict (id) do nothing;

insert into public.products (
  id, name, slug, price, discount_price, category, images, stock, warranty_days, warranty_desc, description, short_description, purity, coating, specs
) values 
(
  'crystal-drop-earrings',
  'Crystal Drop Silver Earrings',
  'crystal-drop-silver-earrings',
  1650,
  1950,
  'Earrings',
  '["https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop"]'::jsonb,
  30,
  180,
  '৬ মাসের ফ্রি পলিশিং ওয়ারেন্টি',
  'যেকোনো উৎসব বা পার্টিতে আপনার লুকে যোগ করবে অনন্য গ্ল্যামার। ১০০% অ্যালার্জি-মুক্ত এবং সংবেদনশীল কানের জন্য উপযুক্ত।',
  'উজ্জ্বল জিরকন ক্রিস্টাল ড্রপ সংবলিত এলিগ্যান্ট সিলভার কানের দুল।',
  '৯২৫ স্টার্লিং সিলভার',
  'অ্যান্টি-টার্নিশ রোডিয়াম ফিনিশ',
  '{"material": "925 Sterling Silver", "plating": "Rhodium Plated", "stone": "Sparkling CZ Crystal", "type": "Drop Earrings"}'::jsonb
)
on conflict (id) do nothing;

-- =================================================================
-- MODULES 1 TO 4: DYNAMIC PRICING, MLM DOWNLINE & WALLET LEDGER
-- =================================================================

-- 1. Pricing Settings Singleton Table
create table if not exists public.pricing_settings (
  id text primary key default 'default',
  opex_percentage numeric not null default 8.5,
  growth_pool_percentage numeric not null default 12.0,
  net_profit_percentage numeric not null default 10.0,
  advance_delivery_inside_city numeric not null default 80,
  advance_delivery_outside_city numeric not null default 150,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

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

-- Alter Products table for Base Cost Price, Dynamic Return Policy & Warranty
alter table public.products add column if not exists cost_price numeric default 0;
alter table public.products add column if not exists return_policy_type text not null default 'NO_RETURN' check (return_policy_type in ('NO_RETURN', 'RETURNABLE'));
alter table public.products add column if not exists return_days integer not null default 0;
alter table public.products add column if not exists warranty_text text;

-- 2. Profiles and N-Tier MLM Downline Chains
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

create table if not exists public.mlm_chains (
  id bigserial primary key,
  user_id text not null references public.profiles(id) on delete cascade,
  upline_id text not null references public.profiles(id) on delete cascade,
  tier_level integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, upline_id)
);

-- Alter Orders Table for 72h Cooling Cycle & Advance Security Tracking
alter table public.orders add column if not exists delivered_at timestamp with time zone;
alter table public.orders add column if not exists wallet_used_amount numeric default 0;
alter table public.orders add column if not exists advance_paid_amount numeric default 0;
alter table public.orders add column if not exists advance_trx_id text;
alter table public.orders add column if not exists advance_payment_method text default 'bKash';
alter table public.orders add column if not exists mlm_processed boolean default false;
alter table public.orders add column if not exists mlm_note text;
alter table public.orders add column if not exists payment_method text default 'COD';
alter table public.orders add column if not exists payment_status text default 'unpaid';
alter table public.orders add column if not exists order_status text default 'pending';

-- 3. Customer Wallets & Ledger
create table if not exists public.customer_wallets (
  id text primary key default ('wlt_' || substr(md5(random()::text), 1, 10)),
  user_id text not null unique references public.profiles(id) on delete cascade,
  available_balance numeric not null default 0 check (available_balance >= 0),
  pending_balance numeric not null default 0 check (pending_balance >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists public.wallet_transactions (
  id text primary key default ('tx_' || substr(md5(random()::text), 1, 12)),
  user_id text not null references public.profiles(id) on delete cascade,
  amount numeric not null,
  transaction_type text not null check (transaction_type in ('CREDIT_REFERRAL', 'DEBIT_PURCHASE', 'CASHBACK', 'VOID_RETURN')),
  reference_order_id text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

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
  cooling_hours integer not null default 24,
  release_due_at timestamp with time zone not null,
  credited_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS for new tables
alter table public.pricing_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.mlm_chains enable row level security;
alter table public.customer_wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.referral_commissions enable row level security;

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
