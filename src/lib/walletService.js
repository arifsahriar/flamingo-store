// =================================================================
// FLAMINGO E-COMMERCE PLATFORM
// Module 3 & 4: Customer Wallet Ledger & 72-Hour Referral Release Cycle
// =================================================================

import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { calculateMlmCommissions, getUplineChainForUser } from '@/lib/mlmEngine';

const WALLETS_STORAGE_KEY = 'flamingo_customer_wallets';
const TRANSACTIONS_STORAGE_KEY = 'flamingo_wallet_transactions';
const COMMISSIONS_STORAGE_KEY = 'flamingo_referral_commissions';

// -------------------------------------------------------------
// Helper: Local Storage Wallet Accessors
// -------------------------------------------------------------

export function getLocalWallets() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(WALLETS_STORAGE_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

export function saveLocalWallets(wallets) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WALLETS_STORAGE_KEY, JSON.stringify(wallets));
  } catch (e) {
    console.error('Error saving local wallets:', e);
  }
}

export function getLocalTransactions() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(TRANSACTIONS_STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

export function saveLocalTransactions(txs) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(txs));
  } catch (e) {
    console.error('Error saving local wallet transactions:', e);
  }
}

export function getLocalCommissions() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(COMMISSIONS_STORAGE_KEY) || '[]');
  } catch (e) {
    return [];
  }
}

export function saveLocalCommissions(commissions) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COMMISSIONS_STORAGE_KEY, JSON.stringify(commissions));
  } catch (e) {
    console.error('Error saving local commissions:', e);
  }
}

// -------------------------------------------------------------
// Fetch Customer Wallet (Hybrid: Supabase + LocalStorage)
// -------------------------------------------------------------

export async function getCustomerWallet(userId) {
  if (!userId) {
    return { available_balance: 0, pending_balance: 0, total_earned: 0 };
  }

  // 1. Run release check for any matured 72-hour commissions
  await processMaturedCommissions();

  // 2. Read local wallet state
  const localWallets = getLocalWallets();
  let wallet = localWallets[userId] || {
    user_id: userId,
    available_balance: 0,
    pending_balance: 0,
  };

  // 3. Read from Supabase if online
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('customer_wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        wallet = {
          user_id: userId,
          available_balance: Number(data.available_balance) || 0,
          pending_balance: Number(data.pending_balance) || 0,
        };
        localWallets[userId] = wallet;
        saveLocalWallets(localWallets);
      }
    } catch (err) {
      console.warn('Supabase customer_wallets fetch error:', err);
    }
  }

  return wallet;
}

// -------------------------------------------------------------
// Fetch User Wallet Transactions Ledger
// -------------------------------------------------------------

export async function getWalletTransactions(userId) {
  if (!userId) return [];

  let transactions = getLocalTransactions().filter((t) => t.user_id === userId);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        transactions = data;
      }
    } catch (err) {
      console.warn('Supabase wallet_transactions error:', err);
    }
  }

  return transactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// -------------------------------------------------------------
// Fetch User Referral Commissions
// -------------------------------------------------------------

export async function getUserReferralCommissions(userId) {
  if (!userId) return [];

  let commissions = getLocalCommissions().filter((c) => c.upline_user_id === userId);

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('referral_commissions')
        .select('*')
        .eq('upline_user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        commissions = data;
      }
    } catch (err) {
      console.warn('Supabase referral_commissions error:', err);
    }
  }

  return commissions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

// -------------------------------------------------------------
// Dynamic Referral Cooling Window Calculator:
// - If any item is 'RETURNABLE': Window = max(return_days) * 24 hours
// - If product is 'NO_RETURN': Window = 24 hours post-delivery (anti-fraud safety buffer)
// -------------------------------------------------------------

export function calculateOrderCoolingHours(orderItems = []) {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    return 24; // 24 hours anti-fraud safety buffer
  }

  let hasReturnable = false;
  let maxReturnDays = 0;

  for (const item of orderItems) {
    const policyType = item.return_policy_type || item.returnPolicyType || 'NO_RETURN';
    const days = Number(item.return_days ?? item.returnDays ?? 0);

    if (policyType === 'RETURNABLE' && days > 0) {
      hasReturnable = true;
      if (days > maxReturnDays) {
        maxReturnDays = days;
      }
    }
  }

  if (hasReturnable && maxReturnDays > 0) {
    return maxReturnDays * 24;
  }

  // 24-hour anti-fraud safety buffer for NO_RETURN products
  return 24;
}

// -------------------------------------------------------------
// MODULE 3: Order Delivery Confirmation & Dynamic Cooling Release Creation
// -------------------------------------------------------------

export async function confirmOrderDelivery({
  orderId,
  orderItemTotal,
  buyerUserId,
  buyerPhone,
  buyerReferralCode,
  hasDiscountOrCoupon = false,
  items = [],
}) {
  const deliveredAt = new Date().toISOString();
  const coolingHours = calculateOrderCoolingHours(items);
  const releaseDueAt = new Date(Date.now() + coolingHours * 60 * 60 * 1000).toISOString();

  // 1. Fetch upline chain for buyer
  let uplineChain = await getUplineChainForUser(buyerUserId);

  // Fallback: If no chain found by ID, look up direct referrer by code/phone
  if ((!uplineChain || uplineChain.length === 0) && buyerReferralCode) {
    if (typeof window !== 'undefined') {
      try {
        const users = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
        const ref = users.find((u) => (u.referralCode || '').toUpperCase() === buyerReferralCode.toUpperCase());
        if (ref) {
          uplineChain = [{ userId: ref.id, name: ref.name, phone: ref.phone, tierLevel: 1 }];
        }
      } catch (e) {}
    }
  }

  // 2. Compute commissions with strict 7% budget cap and Overlap Rule check
  const mlmCalc = calculateMlmCommissions({
    orderItemTotal,
    uplineChain,
    hasDiscountOrCoupon,
  });

  const commissionsToSave = [];
  const localWallets = getLocalWallets();
  const localCommissions = getLocalCommissions();

  if (!mlmCalc.suppressed && mlmCalc.commissions.length > 0) {
    for (const comm of mlmCalc.commissions) {
      const commId = 'comm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const commissionRecord = {
        id: commId,
        order_id: orderId,
        order_item_total: orderItemTotal,
        buyer_user_id: buyerUserId || buyerPhone,
        upline_user_id: comm.userId,
        upline_name: comm.name,
        upline_phone: comm.phone,
        tier_level: comm.tierLevel,
        commission_percentage: comm.percentage,
        commission_amount: comm.amount,
        status: 'pending_release',
        delivered_at: deliveredAt,
        cooling_hours: coolingHours,
        release_due_at: releaseDueAt,
        created_at: deliveredAt,
        note: comm.note,
      };

      commissionsToSave.push(commissionRecord);
      localCommissions.push(commissionRecord);

      // Increment recipient's pending_balance
      const currentWallet = localWallets[comm.userId] || {
        user_id: comm.userId,
        available_balance: 0,
        pending_balance: 0,
      };
      currentWallet.pending_balance = (currentWallet.pending_balance || 0) + comm.amount;
      localWallets[comm.userId] = currentWallet;
    }

    saveLocalWallets(localWallets);
    saveLocalCommissions(localCommissions);

    // Save to Supabase
    if (isSupabaseConfigured() && commissionsToSave.length > 0) {
      try {
        await supabase.from('referral_commissions').insert(commissionsToSave);
        for (const comm of mlmCalc.commissions) {
          await supabase.rpc('increment_pending_wallet', {
            p_user_id: comm.userId,
            p_amount: comm.amount,
          }).catch(async () => {
            // Manual fallback if RPC not created
            const { data: wData } = await supabase.from('customer_wallets').select('*').eq('user_id', comm.userId).maybeSingle();
            const newPending = (Number(wData?.pending_balance) || 0) + comm.amount;
            await supabase.from('customer_wallets').upsert({
              user_id: comm.userId,
              pending_balance: newPending,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
          });
        }
      } catch (dbErr) {
        console.warn('Supabase confirmOrderDelivery error:', dbErr);
      }
    }
  }

  return {
    deliveredAt,
    releaseDueAt,
    coolingHours,
    mlmCalc,
    commissions: commissionsToSave,
  };
}

// -------------------------------------------------------------
// MODULE 3: Scheduled / Hourly 72-Hour Cooling Release Processor
// -------------------------------------------------------------

export async function processMaturedCommissions() {
  const now = Date.now();
  const localCommissions = getLocalCommissions();
  const localWallets = getLocalWallets();
  const localTxs = getLocalTransactions();
  let updatedAny = false;

  for (const comm of localCommissions) {
    if (comm.status === 'pending_release') {
      const dueTime = new Date(comm.release_due_at).getTime();
      if (now >= dueTime) {
        // Mature this commission!
        comm.status = 'credited';
        comm.credited_at = new Date().toISOString();
        updatedAny = true;

        const wallet = localWallets[comm.upline_user_id] || {
          user_id: comm.upline_user_id,
          available_balance: 0,
          pending_balance: 0,
        };

        // Move funds: pending -> available
        const amount = comm.commission_amount || 0;
        wallet.pending_balance = Math.max(0, (wallet.pending_balance || 0) - amount);
        wallet.available_balance = (wallet.available_balance || 0) + amount;
        localWallets[comm.upline_user_id] = wallet;

        // Log transaction
        const tx = {
          id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          user_id: comm.upline_user_id,
          amount,
          transaction_type: 'CREDIT_REFERRAL',
          reference_order_id: comm.order_id,
          description: `টিম রেফারেল কমিশন প্রাপ্তি (অর্ডার: ${comm.order_id}, লেভেল: ${comm.tier_level})`,
          created_at: new Date().toISOString(),
        };
        localTxs.unshift(tx);
      }
    }
  }

  if (updatedAny) {
    saveLocalCommissions(localCommissions);
    saveLocalWallets(localWallets);
    saveLocalTransactions(localTxs);
  }

  // Also call Supabase stored procedure if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.rpc('process_matured_commissions');
    } catch (e) {
      // Ignore if RPC not installed yet
    }
  }

  return { success: true };
}

// -------------------------------------------------------------
// MODULE 3: Void Pending Commissions (Order Canceled or Returned)
// -------------------------------------------------------------

export async function voidOrderCommissions(orderId) {
  const localCommissions = getLocalCommissions();
  const localWallets = getLocalWallets();
  const localTxs = getLocalTransactions();
  let voidedCount = 0;

  for (const comm of localCommissions) {
    if (comm.order_id === orderId && comm.status === 'pending_release') {
      comm.status = 'voided';
      comm.voided_at = new Date().toISOString();
      voidedCount++;

      const wallet = localWallets[comm.upline_user_id];
      if (wallet) {
        wallet.pending_balance = Math.max(0, (wallet.pending_balance || 0) - (comm.commission_amount || 0));
      }

      // Log transaction
      localTxs.unshift({
        id: 'tx_void_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        user_id: comm.upline_user_id,
        amount: -(comm.commission_amount || 0),
        transaction_type: 'VOID_RETURN',
        reference_order_id: orderId,
        description: `অর্ডার বাতিল/ফেরত হওয়ায় পেন্ডিং কমিশন বাতিল করা হয়েছে (অর্ডার: ${orderId})`,
        created_at: new Date().toISOString(),
      });
    }
  }

  if (voidedCount > 0) {
    saveLocalCommissions(localCommissions);
    saveLocalWallets(localWallets);
    saveLocalTransactions(localTxs);
  }

  if (isSupabaseConfigured()) {
    try {
      await supabase.rpc('void_order_commissions', { p_order_id: orderId });
    } catch (e) {}
  }

  return { success: true, voidedCount };
}

// -------------------------------------------------------------
// MODULE 4: Debit Customer Wallet for Checkout Product Payment
// -------------------------------------------------------------

export async function debitWalletForPurchase({
  userId,
  orderId,
  amount,
}) {
  const debitAmount = Math.max(0, Number(amount) || 0);
  if (debitAmount <= 0) return { success: true, debited: 0 };

  const localWallets = getLocalWallets();
  const wallet = localWallets[userId] || {
    user_id: userId,
    available_balance: 0,
    pending_balance: 0,
  };

  if (wallet.available_balance < debitAmount) {
    return {
      success: false,
      error: `অপর্যাপ্ত ওয়ালেট ব্যালেন্স। আপনার উপলব্ধ ব্যালেন্স ৳${wallet.available_balance}`,
    };
  }

  // Deduct
  wallet.available_balance -= debitAmount;
  localWallets[userId] = wallet;
  saveLocalWallets(localWallets);

  // Log transaction
  const localTxs = getLocalTransactions();
  const tx = {
    id: 'tx_deb_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    user_id: userId,
    amount: -debitAmount,
    transaction_type: 'DEBIT_PURCHASE',
    reference_order_id: orderId,
    description: `চেকআউট প্রোডাক্ট বিল পরিশোধ (অর্ডার: ${orderId})`,
    created_at: new Date().toISOString(),
  };
  localTxs.unshift(tx);
  saveLocalTransactions(localTxs);

  // Sync with Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('wallet_transactions').insert([
        {
          id: tx.id,
          user_id: userId,
          amount: -debitAmount,
          transaction_type: 'DEBIT_PURCHASE',
          reference_order_id: orderId,
          description: tx.description,
          created_at: tx.created_at,
        },
      ]);

      const { data: dbWallet } = await supabase
        .from('customer_wallets')
        .select('available_balance')
        .eq('user_id', userId)
        .maybeSingle();

      const newBal = Math.max(0, (Number(dbWallet?.available_balance) || 0) - debitAmount);
      await supabase.from('customer_wallets').upsert({
        user_id: userId,
        available_balance: newBal,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    } catch (dbErr) {
      console.warn('Supabase debit wallet error:', dbErr);
    }
  }

  return { success: true, debited: debitAmount, remainingBalance: wallet.available_balance };
}
