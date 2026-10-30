// =================================================================
// FLAMINGO E-COMMERCE PLATFORM
// Module 1: Dynamic Pricing & Margin Engine (Admin Configurable)
// =================================================================

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const DEFAULT_PRICING_SETTINGS = {
  opex_percentage: 8.5,
  growth_pool_percentage: 12.0,
  net_profit_percentage: 10.0,
  advance_delivery_inside_city: 80,
  advance_delivery_outside_city: 150,
};

const STORAGE_KEY = 'flamingo_pricing_settings';

/**
 * Pure accounting margin calculation
 * Formula: selling_price = cost_price / (1 - (total_margin / 100))
 */
export function calculateSellingPriceBreakdown(costPriceInput, customSettings = null) {
  const costPrice = Math.max(0, Number(costPriceInput) || 0);
  const settings = customSettings || getCachedPricingSettings();

  const opexPct = Number(settings.opex_percentage) || DEFAULT_PRICING_SETTINGS.opex_percentage;
  const growthPct = Number(settings.growth_pool_percentage) || DEFAULT_PRICING_SETTINGS.growth_pool_percentage;
  const netProfitPct = Number(settings.net_profit_percentage) || DEFAULT_PRICING_SETTINGS.net_profit_percentage;

  const totalMarginPct = opexPct + growthPct + netProfitPct; // e.g. 30.5%
  const divisor = Math.max(0.01, 1 - totalMarginPct / 100);

  const sellingPrice = costPrice > 0 ? Math.round(costPrice / divisor) : 0;

  // Breakdown based on MRP
  const allocatedOpex = Math.round((sellingPrice * opexPct) / 100);
  const allocatedGrowth = Math.round((sellingPrice * growthPct) / 100);
  const allocatedNetProfit = Math.round((sellingPrice * netProfitPct) / 100);

  return {
    costPrice,
    opexPercentage: opexPct,
    growthPoolPercentage: growthPct,
    netProfitPercentage: netProfitPct,
    totalMarginPercentage: totalMarginPct,
    allocatedOpex,
    allocatedGrowth,
    allocatedNetProfit,
    sellingPrice,
  };
}

/**
 * Synchronous local cache reader
 */
export function getCachedPricingSettings() {
  if (typeof window === 'undefined') return DEFAULT_PRICING_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_PRICING_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Error reading cached pricing settings:', e);
  }
  return DEFAULT_PRICING_SETTINGS;
}

/**
 * Fetch settings from Supabase singleton table with fallback to localStorage
 */
export async function fetchPricingSettings() {
  let settings = getCachedPricingSettings();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('pricing_settings')
        .select('*')
        .eq('id', 'default')
        .maybeSingle();

      if (!error && data) {
        settings = {
          opex_percentage: Number(data.opex_percentage) || DEFAULT_PRICING_SETTINGS.opex_percentage,
          growth_pool_percentage: Number(data.growth_pool_percentage) || DEFAULT_PRICING_SETTINGS.growth_pool_percentage,
          net_profit_percentage: Number(data.net_profit_percentage) || DEFAULT_PRICING_SETTINGS.net_profit_percentage,
          advance_delivery_inside_city: Number(data.advance_delivery_inside_city) || DEFAULT_PRICING_SETTINGS.advance_delivery_inside_city,
          advance_delivery_outside_city: Number(data.advance_delivery_outside_city) || DEFAULT_PRICING_SETTINGS.advance_delivery_outside_city,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        }
      }
    } catch (err) {
      console.warn('Failed to fetch pricing_settings from Supabase, using local cache:', err);
    }
  }

  return settings;
}

/**
 * Update pricing settings (Super Admin Only)
 */
export async function savePricingSettings(newSettings, adminRole) {
  if (adminRole !== 'superadmin') {
    return { success: false, error: 'অনুমতি নেই: শুধুমাত্র সুপার অ্যাডমিন প্রাইসিং সেটিংস পরিবর্তন করতে পারেন।' };
  }

  const payload = {
    id: 'default',
    opex_percentage: Number(newSettings.opex_percentage) ?? DEFAULT_PRICING_SETTINGS.opex_percentage,
    growth_pool_percentage: Number(newSettings.growth_pool_percentage) ?? DEFAULT_PRICING_SETTINGS.growth_pool_percentage,
    net_profit_percentage: Number(newSettings.net_profit_percentage) ?? DEFAULT_PRICING_SETTINGS.net_profit_percentage,
    advance_delivery_inside_city: Number(newSettings.advance_delivery_inside_city) ?? DEFAULT_PRICING_SETTINGS.advance_delivery_inside_city,
    advance_delivery_outside_city: Number(newSettings.advance_delivery_outside_city) ?? DEFAULT_PRICING_SETTINGS.advance_delivery_outside_city,
    updated_at: new Date().toISOString(),
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('pricing_settings')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase pricing_settings upsert error:', error.message);
      }
    } catch (dbErr) {
      console.warn('Supabase pricing_settings offline fallback:', dbErr);
    }
  }

  return { success: true, settings: payload };
}
