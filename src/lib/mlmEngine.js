// =================================================================
// FLAMINGO E-COMMERCE PLATFORM
// Module 2: N-Tier MLM Engine & Downline Tree
// =================================================================

import { supabase, isSupabaseConfigured } from '@/lib/supabase';

/**
 * Calculate MLM commission percentages and amounts with strict 7% budget cap
 *
 * Direct Referrer (Tier 1): 5.0%
 * Remaining Uplines (Tier 2 to Tier N): Share remaining 2.0% pool
 *
 * 2% Pool Logic:
 * - 1 upline above Tier 1: gets full 2.0%
 * - 2 uplines: Tier 2 gets 1.25%, Tier 3 gets 0.75%
 * - 3+ uplines: Tier 2 gets 1.0%, Tier 3 gets 0.6%, Tier 4+ splits 0.4% equally
 *
 * Overlap Rule:
 * If an order claims a coupon or discount (hasDiscountOrCoupon === true),
 * MLM distribution is suppressed entirely for that transaction.
 */
export function calculateMlmCommissions({
  orderItemTotal,
  uplineChain = [],
  hasDiscountOrCoupon = false,
}) {
  const itemTotal = Math.max(0, Number(orderItemTotal) || 0);

  // Overlap Rule check
  if (hasDiscountOrCoupon || itemTotal <= 0 || !Array.isArray(uplineChain) || uplineChain.length === 0) {
    return {
      commissions: [],
      totalCommissionAmount: 0,
      suppressed: Boolean(hasDiscountOrCoupon),
      reason: hasDiscountOrCoupon 
        ? 'ডিসকাউন্ট কুপন বা ভাউচার প্রযোজ্য থাকায় ওভারল্যাপ নীতি অনুযায়ী এমএলএম কমিশন স্থগিত রাখা হয়েছে।'
        : 'কোনো যোগ্য আপলাইন পাওয়া যায়নি বা অর্ডারের মূল্য শূন্য।',
    };
  }

  // Sort chain by tier level ascending (Tier 1, Tier 2, etc.)
  const sortedChain = [...uplineChain].sort((a, b) => a.tierLevel - b.tierLevel);
  const tier1 = sortedChain.find((u) => u.tierLevel === 1);
  const higherUplines = sortedChain.filter((u) => u.tierLevel > 1);

  const results = [];
  let totalDistributedPct = 0;

  // 1. Tier 1 (Direct Referrer): Exactly 5.0%
  if (tier1) {
    const pct = 5.0;
    const amount = Math.round((itemTotal * pct) / 100);
    results.push({
      userId: tier1.userId || tier1.id,
      name: tier1.name || 'Direct Referrer',
      phone: tier1.phone || '',
      tierLevel: 1,
      percentage: pct,
      amount,
      note: 'টিয়ার ১: সরাসরি রেফারেল কমিশন (৫.০%)',
    });
    totalDistributedPct += pct;
  }

  // 2. Higher Uplines: Share 2.0% pool
  const count = higherUplines.length;
  if (count === 1) {
    // 1 Upline above Tier 1: receives full 2.0%
    const u = higherUplines[0];
    const pct = 2.0;
    const amount = Math.round((itemTotal * pct) / 100);
    results.push({
      userId: u.userId || u.id,
      name: u.name || `Upline Tier ${u.tierLevel}`,
      phone: u.phone || '',
      tierLevel: u.tierLevel,
      percentage: pct,
      amount,
      note: `টিয়ার ${u.tierLevel}: অবশিষ্ট ২.০% পুল সম্পূর্ণ বরাদ্দ`,
    });
    totalDistributedPct += pct;
  } else if (count === 2) {
    // 2 Uplines: Tier 2 gets 1.25%, Tier 3 gets 0.75%
    const [u2, u3] = higherUplines;
    const pct2 = 1.25;
    const pct3 = 0.75;
    results.push({
      userId: u2.userId || u2.id,
      name: u2.name || 'Upline Tier 2',
      phone: u2.phone || '',
      tierLevel: u2.tierLevel,
      percentage: pct2,
      amount: Math.round((itemTotal * pct2) / 100),
      note: `টিয়ার ${u2.tierLevel}: ২% পুল থেকে ১.২৫% বরাদ্দ`,
    });
    results.push({
      userId: u3.userId || u3.id,
      name: u3.name || 'Upline Tier 3',
      phone: u3.phone || '',
      tierLevel: u3.tierLevel,
      percentage: pct3,
      amount: Math.round((itemTotal * pct3) / 100),
      note: `টিয়ার ${u3.tierLevel}: ২% পুল থেকে ০.৭৫% বরাদ্দ`,
    });
    totalDistributedPct += pct2 + pct3;
  } else if (count >= 3) {
    // 3+ Uplines: Tier 2 gets 1.0%, Tier 3 gets 0.6%, Tier 4+ splits 0.4%
    const u2 = higherUplines[0];
    const u3 = higherUplines[1];
    const remainingUplines = higherUplines.slice(2);

    results.push({
      userId: u2.userId || u2.id,
      name: u2.name || 'Upline Tier 2',
      phone: u2.phone || '',
      tierLevel: u2.tierLevel,
      percentage: 1.0,
      amount: Math.round((itemTotal * 1.0) / 100),
      note: `টিয়ার ${u2.tierLevel}: ২% পুল থেকে ১.০% বরাদ্দ`,
    });
    results.push({
      userId: u3.userId || u3.id,
      name: u3.name || 'Upline Tier 3',
      phone: u3.phone || '',
      tierLevel: u3.tierLevel,
      percentage: 0.6,
      amount: Math.round((itemTotal * 0.6) / 100),
      note: `টিয়ার ${u3.tierLevel}: ২% পুল থেকে ০.৬% বরাদ্দ`,
    });
    totalDistributedPct += 1.6;

    const splitCount = remainingUplines.length;
    const splitPct = Number((0.4 / splitCount).toFixed(4));
    remainingUplines.forEach((u) => {
      const amount = Math.round((itemTotal * splitPct) / 100);
      results.push({
        userId: u.userId || u.id,
        name: u.name || `Upline Tier ${u.tierLevel}`,
        phone: u.phone || '',
        tierLevel: u.tierLevel,
        percentage: splitPct,
        amount,
        note: `টিয়ার ${u.tierLevel}: ০.৪% সমবণ্টন (${splitPct}%)`,
      });
      totalDistributedPct += splitPct;
    });
  }

  const totalCommissionAmount = results.reduce((sum, r) => sum + r.amount, 0);

  return {
    commissions: results,
    totalDistributedPercentage: totalDistributedPct,
    totalCommissionAmount,
    suppressed: false,
    reason: null,
  };
}

/**
 * Build and save upline ancestry chain when a new customer registers
 */
export async function registerUplineChain({ newUserId, referrerCode }) {
  if (!referrerCode) return [];

  const cleanCode = referrerCode.trim().toUpperCase();
  let referrerUser = null;

  // 1. Check local users
  if (typeof window !== 'undefined') {
    try {
      const users = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
      referrerUser = users.find((u) => (u.referralCode || '').toUpperCase() === cleanCode);
    } catch (e) {
      console.error(e);
    }
  }

  // 2. Check Supabase profiles/customers if not found locally
  if (!referrerUser && isSupabaseConfigured()) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('referral_code', cleanCode)
        .maybeSingle();

      if (data) {
        referrerUser = {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email,
          referralCode: data.referral_code,
          referrerId: data.referrer_id,
        };
      } else {
        const { data: custData } = await supabase
          .from('customers')
          .select('*')
          .eq('referral_code', cleanCode)
          .maybeSingle();

        if (custData) {
          referrerUser = {
            id: custData.id,
            name: custData.name,
            phone: custData.phone,
            email: custData.email,
            referralCode: custData.referral_code,
          };
        }
      }
    } catch (dbErr) {
      console.warn('Supabase referrer lookup failed:', dbErr);
    }
  }

  if (!referrerUser) return [];

  // Build ancestor hierarchy
  const chain = [];
  chain.push({
    userId: referrerUser.id,
    name: referrerUser.name,
    phone: referrerUser.phone,
    tierLevel: 1,
  });

  // Traverse upline
  let currentReferrerId = referrerUser.referrerId || referrerUser.referredById;
  let currentTier = 2;
  const visited = new Set([newUserId, referrerUser.id]);

  while (currentReferrerId && currentTier <= 10 && !visited.has(currentReferrerId)) {
    visited.add(currentReferrerId);
    let nextUpline = null;

    if (typeof window !== 'undefined') {
      try {
        const users = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
        nextUpline = users.find((u) => u.id === currentReferrerId);
      } catch (e) {}
    }

    if (!nextUpline && isSupabaseConfigured()) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentReferrerId)
          .maybeSingle();
        if (data) {
          nextUpline = {
            id: data.id,
            name: data.name,
            phone: data.phone,
            referrerId: data.referrer_id,
          };
        }
      } catch (e) {}
    }

    if (nextUpline) {
      chain.push({
        userId: nextUpline.id,
        name: nextUpline.name,
        phone: nextUpline.phone,
        tierLevel: currentTier,
      });
      currentReferrerId = nextUpline.referrerId;
      currentTier++;
    } else {
      break;
    }
  }

  // Persist chain locally
  if (typeof window !== 'undefined') {
    try {
      const allChains = JSON.parse(localStorage.getItem('flamingo_mlm_chains') || '{}');
      allChains[newUserId] = chain;
      localStorage.setItem('flamingo_mlm_chains', JSON.stringify(allChains));
    } catch (e) {
      console.error(e);
    }
  }

  // Persist chain to Supabase mlm_chains
  if (isSupabaseConfigured()) {
    try {
      const rows = chain.map((item) => ({
        user_id: newUserId,
        upline_id: item.userId,
        tier_level: item.tierLevel,
      }));
      await supabase.from('mlm_chains').upsert(rows, { onConflict: 'user_id, upline_id' });
    } catch (dbErr) {
      console.warn('Supabase mlm_chains insert error:', dbErr);
    }
  }

  return chain;
}

/**
 * Get upline chain for a specific user ID or order
 */
export async function getUplineChainForUser(userId) {
  if (!userId) return [];

  // Check local storage
  if (typeof window !== 'undefined') {
    try {
      const allChains = JSON.parse(localStorage.getItem('flamingo_mlm_chains') || '{}');
      if (Array.isArray(allChains[userId]) && allChains[userId].length > 0) {
        return allChains[userId];
      }
    } catch (e) {}
  }

  // Check Supabase mlm_chains
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('mlm_chains')
        .select('tier_level, upline_id, profiles!mlm_chains_upline_id_fkey(name, phone)')
        .eq('user_id', userId)
        .order('tier_level', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((d) => ({
          userId: d.upline_id,
          tierLevel: d.tier_level,
          name: d.profiles?.name || `Upline Tier ${d.tier_level}`,
          phone: d.profiles?.phone || '',
        }));
      }
    } catch (dbErr) {
      console.warn('Supabase getUplineChain error:', dbErr);
    }
  }

  return [];
}
