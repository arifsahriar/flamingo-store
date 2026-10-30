-- =================================================================
-- FLAMINGO E-COMMERCE PLATFORM
-- Migration: Product-Level Dynamic Return Policy, Warranty & Referral Release Synchronization
-- Date: 2026-10-30
-- =================================================================

-- 1. Add Return Policy & Warranty columns to Products table
alter table public.products 
  add column if not exists return_policy_type text not null default 'NO_RETURN' check (return_policy_type in ('NO_RETURN', 'RETURNABLE')),
  add column if not exists return_days integer not null default 0,
  add column if not exists warranty_text text;

-- 2. Add cooling_hours to referral_commissions
alter table public.referral_commissions
  add column if not exists cooling_hours integer not null default 24;

-- 3. Stored Procedure: Calculate Dynamic Cooling Interval for an Order
create or replace function public.calculate_order_cooling_interval(p_order_id text)
returns interval language plpgsql as $$
declare
  v_items jsonb;
  v_item jsonb;
  v_max_return_days integer := 0;
  v_has_returnable boolean := false;
  v_item_id text;
  v_prod_policy text;
  v_prod_days integer;
begin
  select items into v_items from public.orders where id = p_order_id;
  if v_items is not null and jsonb_typeof(v_items) = 'array' then
    for v_item in select * from jsonb_array_elements(v_items) loop
      v_item_id := v_item->>'id';
      select return_policy_type, return_days into v_prod_policy, v_prod_days 
      from public.products where id = v_item_id;
      
      if coalesce(v_item->>'return_policy_type', v_prod_policy, 'NO_RETURN') = 'RETURNABLE' then
        v_has_returnable := true;
        v_max_return_days := greatest(v_max_return_days, coalesce((v_item->>'return_days')::integer, v_prod_days, 7));
      end if;
    end loop;
  end if;

  if v_has_returnable and v_max_return_days > 0 then
    return (v_max_return_days || ' days')::interval;
  else
    return interval '24 hours';
  end if;
end;
$$;
