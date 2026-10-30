'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { registerUplineChain } from '@/lib/mlmEngine';
import { getCustomerWallet } from '@/lib/walletService';

const DEFAULT_STAFF_USERS = [
  {
    username: 'admin',
    password: 'password123',
    role: 'superadmin',
    name: 'FLAMINGO Admin',
  },
  {
    username: 'moderator',
    password: 'mod123',
    role: 'moderator',
    name: 'Order Moderator',
  },
];

// ইউনিক রেফারেল কোড জেনারেটর (e.g. REF-A7X9K)
export const generateReferralCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'REF-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // ব্রাউজার লোড হলে লোকাল স্টোরেজ ও সুপাবেজ থেকে ডাটা সিঙ্ক করা
  useEffect(() => {
    try {
      // ১. স্টাফ ইউজার ইনিশিয়ালাইজেশন
      const savedStaff = localStorage.getItem('flamingo_staff_users');
      if (!savedStaff) {
        localStorage.setItem('flamingo_staff_users', JSON.stringify(DEFAULT_STAFF_USERS));
      }

      // ২. বর্তমান লগইন থাকা কাস্টমার
      const savedUser = localStorage.getItem('flamingo_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (!parsed.referralCode) {
          parsed.referralCode = generateReferralCode();
          localStorage.setItem('flamingo_current_user', JSON.stringify(parsed));
        }
        setCurrentUser(parsed);
      }

      // ৩. বর্তমান লগইন থাকা অ্যাডমিন
      const savedAdmin = localStorage.getItem('flamingo_current_admin');
      if (savedAdmin) {
        setCurrentAdmin(JSON.parse(savedAdmin));
      }
    } catch (e) {
      console.error('Error initializing auth from localStorage:', e);
    } finally {
      setIsAuthLoaded(true);
    }

    // সুপাবেজ থেকে কাস্টমার তালিকা সিঙ্ক (ব্যাকগ্রাউন্ড)
    const syncCustomersFromSupabase = async () => {
      if (!isSupabaseConfigured()) return;
      try {
        const { data, error } = await supabase.from('customers').select('*');
        if (!error && Array.isArray(data) && data.length > 0) {
          const localUsers = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
          const userMap = new Map();
          localUsers.forEach((u) => userMap.set(u.id, u));

          data.forEach((cust) => {
            const existing = userMap.get(cust.id);
            userMap.set(cust.id, {
              id: cust.id,
              name: cust.name,
              phone: cust.phone,
              email: cust.email || '',
              password: cust.password_hash || existing?.password || '123456',
              referralCode: cust.referral_code || existing?.referralCode || generateReferralCode(),
              referredByCode: existing?.referredByCode || null,
              vouchers: existing?.vouchers || [],
              createdAt: cust.created_at ? new Date(cust.created_at).toLocaleDateString('bn-BD') : (existing?.createdAt || new Date().toLocaleDateString('bn-BD')),
            });
          });

          const merged = Array.from(userMap.values());
          localStorage.setItem('flamingo_users', JSON.stringify(merged));
        }
      } catch (err) {
        console.warn('Supabase customer sync fallback:', err);
      }
    };

    syncCustomersFromSupabase();

    // মাল্টি-ট্যাব অথেনটিকেশন সিঙ্ক
    const handleStorage = (e) => {
      if (e.key === 'flamingo_current_user') {
        setCurrentUser(e.newValue ? JSON.parse(e.newValue) : null);
      }
      if (e.key === 'flamingo_current_admin') {
        setCurrentAdmin(e.newValue ? JSON.parse(e.newValue) : null);
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // --- কাস্টমার রেজিস্ট্রেশন (অটো রেফারেল কোড ও রেফারার ট্র্যাকিংসহ) ---
  const registerCustomer = async ({ name, phone, email, password, referredByCode }) => {
    try {
      const users = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
      
      const cleanPhone = phone.trim();
      const cleanEmail = email ? email.trim().toLowerCase() : '';
      
      // রেফারেল কোড প্যারামিটার অথবা পূর্বে সেভ করা গেটওয়ে রেফারেল
      let cleanReferredBy = referredByCode ? referredByCode.trim().toUpperCase() : null;
      if (!cleanReferredBy && typeof window !== 'undefined') {
        const storedActiveRef = localStorage.getItem('flamingo_active_referral');
        if (storedActiveRef) cleanReferredBy = storedActiveRef.trim().toUpperCase();
      }

      // ফোন বা ইমেইল দিয়ে ডুপ্লিকেট চেক
      const exists = users.some(
        (u) => u.phone === cleanPhone || (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail)
      );

      if (exists) {
        return { success: false, error: 'এই মোবাইল নম্বর বা ইমেইল দিয়ে ইতোমধ্যে একটি অ্যাকাউন্ট রয়েছে!' };
      }

      // নতুন কাস্টমারের জন্য ইউনিক রেফারেল কোড
      const referralCode = generateReferralCode();
      const newId = 'usr_' + Date.now();

      // আপলাইন চেইন তৈরি ও রেফারার আইডি নির্ধারণ
      let directReferrerId = null;
      if (cleanReferredBy) {
        try {
          const chain = await registerUplineChain({ newUserId: newId, referrerCode: cleanReferredBy });
          if (chain && chain.length > 0) {
            directReferrerId = chain[0].userId;
          }
        } catch (chainErr) {
          console.warn('Upline chain registration warning:', chainErr);
        }
      }

      // ইনিশিয়াল ওয়ালেট রেকর্ড তৈরি
      try {
        const localWallets = JSON.parse(localStorage.getItem('flamingo_customer_wallets') || '{}');
        if (!localWallets[newId]) {
          localWallets[newId] = { user_id: newId, available_balance: 0, pending_balance: 0 };
          localStorage.setItem('flamingo_customer_wallets', JSON.stringify(localWallets));
        }
      } catch (wErr) {
        console.warn('Local wallet init warning:', wErr);
      }

      const newUser = {
        id: newId,
        name: name.trim(),
        phone: cleanPhone,
        email: cleanEmail,
        password: password,
        referralCode,
        referredByCode: cleanReferredBy,
        referrerId: directReferrerId,
        vouchers: [],
        createdAt: new Date().toLocaleDateString('bn-BD', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };

      const updatedUsers = [...users, newUser];
      localStorage.setItem('flamingo_users', JSON.stringify(updatedUsers));

      // রেজিস্ট্রেশন সম্পন্ন হলে স্বয়ংক্রিয় লগইন
      const safeUser = {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        referralCode: newUser.referralCode,
        referredByCode: newUser.referredByCode,
        referrerId: directReferrerId,
        vouchers: [],
        createdAt: newUser.createdAt,
      };

      localStorage.setItem('flamingo_current_user', JSON.stringify(safeUser));
      setCurrentUser(safeUser);

      // সুপাবেজ ডাটাবেজে ব্যাকগ্রাউন্ডে সেভ (customers + profiles + customer_wallets)
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('customers').insert([
            {
              id: newId,
              name: newUser.name,
              phone: cleanPhone,
              email: cleanEmail || null,
              password_hash: password,
              referral_code: referralCode,
              created_at: new Date().toISOString(),
            },
          ]);

          // profiles টেবিল
          await supabase.from('profiles').insert([
            {
              id: newId,
              name: newUser.name,
              phone: cleanPhone,
              email: cleanEmail || null,
              password_hash: password,
              referrer_id: directReferrerId,
              referral_code: referralCode,
              created_at: new Date().toISOString(),
            },
          ]).catch(() => {});

          // customer_wallets
          await supabase.from('customer_wallets').insert([
            {
              user_id: newId,
              available_balance: 0,
              pending_balance: 0,
              created_at: new Date().toISOString(),
            },
          ]).catch(() => {});
        } catch (dbErr) {
          console.warn('Supabase customer insert offline fallback:', dbErr);
        }
      }

      return { success: true, user: safeUser };
    } catch (err) {
      console.error('Registration failed:', err);
      return { success: false, error: 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি। আবার চেষ্টা করুন।' };
    }
  };

  // --- কাস্টমার লগইন ---
  const loginCustomer = async ({ identifier, password }) => {
    try {
      const users = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
      const iden = identifier.trim().toLowerCase();

      let matched = users.find(
        (u) =>
          (u.phone.toLowerCase() === iden || (u.email && u.email.toLowerCase() === iden)) &&
          u.password === password
      );

      // লোকাল স্টোরেজে না পেলে সুপাবেজে চেক
      if (!matched && isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('customers')
            .select('*')
            .or(`phone.eq.${identifier.trim()},email.eq.${iden}`)
            .limit(1);

          if (!error && data && data.length > 0) {
            const dbCust = data[0];
            if (dbCust.password_hash === password) {
              matched = {
                id: dbCust.id,
                name: dbCust.name,
                phone: dbCust.phone,
                email: dbCust.email || '',
                password: dbCust.password_hash,
                referralCode: dbCust.referral_code || generateReferralCode(),
                referredByCode: null,
                vouchers: [],
                createdAt: dbCust.created_at ? new Date(dbCust.created_at).toLocaleDateString('bn-BD') : new Date().toLocaleDateString('bn-BD'),
              };
              users.push(matched);
              localStorage.setItem('flamingo_users', JSON.stringify(users));
            }
          }
        } catch (dbErr) {
          console.warn('Supabase customer login query fallback:', dbErr);
        }
      }

      if (!matched) {
        return { success: false, error: 'মোবাইল/ইমেইল অথবা পাসওয়ার্ড সঠিক নয়!' };
      }

      if (!matched.referralCode) {
        matched.referralCode = generateReferralCode();
        localStorage.setItem('flamingo_users', JSON.stringify(users));
      }

      const safeUser = {
        id: matched.id,
        name: matched.name,
        phone: matched.phone,
        email: matched.email,
        referralCode: matched.referralCode,
        referredByCode: matched.referredByCode || null,
        vouchers: matched.vouchers || [],
        createdAt: matched.createdAt,
      };

      localStorage.setItem('flamingo_current_user', JSON.stringify(safeUser));
      setCurrentUser(safeUser);

      return { success: true, user: safeUser };
    } catch (err) {
      console.error('Customer login error:', err);
      return { success: false, error: 'লগইন করার সময় সমস্যা হয়েছে।' };
    }
  };

  // --- কাস্টমার লগআউট ---
  const logoutCustomer = () => {
    try {
      localStorage.removeItem('flamingo_current_user');
      setCurrentUser(null);
    } catch (e) {
      console.error(e);
    }
  };

  // --- অ্যাডমিন লগইন ---
  const loginAdmin = ({ username, password }) => {
    try {
      const staffList = JSON.parse(
        localStorage.getItem('flamingo_staff_users') || JSON.stringify(DEFAULT_STAFF_USERS)
      );

      const matchedStaff = staffList.find(
        (staff) =>
          staff.username.toLowerCase() === username.trim().toLowerCase() &&
          staff.password === password
      );

      if (!matchedStaff) {
        return { success: false, error: 'ভুল অ্যাডমিন ইউজারনেম অথবা পাসওয়ার্ড!' };
      }

      const safeAdmin = {
        username: matchedStaff.username,
        role: matchedStaff.role, // 'superadmin' | 'moderator'
        name: matchedStaff.name,
      };

      localStorage.setItem('flamingo_current_admin', JSON.stringify(safeAdmin));
      setCurrentAdmin(safeAdmin);

      return { success: true, admin: safeAdmin };
    } catch (err) {
      console.error('Admin login error:', err);
      return { success: false, error: 'লগইন প্রসেস ব্যর্থ হয়েছে।' };
    }
  };

  // --- অ্যাডমিন লগআউট ---
  const logoutAdmin = () => {
    try {
      localStorage.removeItem('flamingo_current_admin');
      setCurrentAdmin(null);
    } catch (e) {
      console.error(e);
    }
  };

  // --- ইউনিফায়েড স্মার্ট লগইন গেটওয়ে (স্টাফ ও কাস্টমার উভয়ের জন্য) ---
  const unifiedLogin = async ({ identifier, password }) => {
    try {
      const cleanIden = identifier.trim().toLowerCase();

      // ১. স্টাফ অ্যাকাউন্ট যাচাই (admin / moderator)
      const staffList = JSON.parse(
        localStorage.getItem('flamingo_staff_users') || JSON.stringify(DEFAULT_STAFF_USERS)
      );

      const matchedStaff = staffList.find(
        (staff) =>
          staff.username.toLowerCase() === cleanIden &&
          staff.password === password
      );

      if (matchedStaff) {
        const safeAdmin = {
          username: matchedStaff.username,
          role: matchedStaff.role, // 'superadmin' | 'moderator'
          name: matchedStaff.name,
        };
        localStorage.setItem('flamingo_current_admin', JSON.stringify(safeAdmin));
        setCurrentAdmin(safeAdmin);
        return { 
          success: true, 
          userType: 'admin', 
          role: matchedStaff.role, 
          admin: safeAdmin 
        };
      }

      // ২. কাস্টমার অ্যাকাউন্ট যাচাই
      const customerRes = await loginCustomer({ identifier, password });
      if (customerRes.success) {
        return {
          success: true,
          userType: 'customer',
          user: customerRes.user,
        };
      }

      return { 
        success: false, 
        error: 'ইউজারনেম/মোবাইল নম্বর অথবা পাসওয়ার্ড সঠিক নয়!' 
      };
    } catch (err) {
      console.error('Unified login error:', err);
      return { 
        success: false, 
        error: 'লগইন করার সময় একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' 
      };
    }
  };

  // --- কাস্টমারকে এক্সক্লুসিভ ভাউচার ইস্যু করার হেল্পার মেথড ---
  const issueVoucherToCustomer = async ({ customerId, customerPhone, voucher }) => {
    try {
      const users = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
      const globalVouchers = JSON.parse(localStorage.getItem('flamingo_exclusive_vouchers') || '[]');

      const voucherId = 'vouch_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
      const code = (voucher.code || ('VOUCH-' + Math.random().toString(36).substring(2, 7))).toUpperCase().trim();
      const discount = Number(voucher.discount) || 50;
      const type = voucher.type || 'flat'; // 'flat' | 'percentage'
      const days = Number(voucher.days) || 30;
      const expiryTimestamp = Date.now() + days * 86400000;
      const expiryDateFormatted = new Date(expiryTimestamp).toLocaleDateString('bn-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      const newVoucher = {
        id: voucherId,
        code,
        discount,
        type,
        isExclusive: true,
        customerId: customerId || null,
        customerPhone: customerPhone || null,
        referralCode: voucher.referralCode || null,
        expiryTimestamp,
        expiryDateFormatted,
        note: voucher.note || (type === 'percentage' ? `${discount}% স্পেশাল ছাড়` : `৳${discount} স্পেশাল রিওয়ার্ড ভাউচার`),
        isUsed: false,
        createdAt: new Date().toLocaleDateString('bn-BD'),
      };

      // ১. গ্লোবাল এক্সক্লুসিভ ভাউচার স্টোরে সেভ
      const updatedGlobal = [...globalVouchers.filter((v) => v.code !== code), newVoucher];
      localStorage.setItem('flamingo_exclusive_vouchers', JSON.stringify(updatedGlobal));

      // ২. টার্গেট ইউজারের একাউন্টে সেভ
      let userUpdated = false;
      const updatedUsers = users.map((u) => {
        if ((customerId && u.id === customerId) || (customerPhone && u.phone === customerPhone) || (voucher.referralCode && u.referralCode === voucher.referralCode)) {
          userUpdated = true;
          const userVouchers = Array.isArray(u.vouchers) ? u.vouchers : [];
          return {
            ...u,
            vouchers: [...userVouchers.filter((v) => v.code !== code), newVoucher],
          };
        }
        return u;
      });

      if (userUpdated) {
        localStorage.setItem('flamingo_users', JSON.stringify(updatedUsers));
      }

      // ৩. বর্তমান লগইন থাকা কাস্টমার যদি এটি রিসিভ করে, রিয়েলটাইমে রিফ্রেশ
      if (currentUser && ((customerId && currentUser.id === customerId) || (customerPhone && currentUser.phone === customerPhone))) {
        const updatedCurrentUser = {
          ...currentUser,
          vouchers: [...(currentUser.vouchers || []).filter((v) => v.code !== code), newVoucher],
        };
        localStorage.setItem('flamingo_current_user', JSON.stringify(updatedCurrentUser));
        setCurrentUser(updatedCurrentUser);
      }

      // ৪. সুপাবেজ ডাটাবেজে সেভ (public.coupons)
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('coupons').insert([
            {
              id: voucherId,
              code,
              discount_amount: discount,
              discount_type: type,
              min_spend: 0,
              is_exclusive: true,
              assigned_user_id: customerId || null,
              expiry_date: new Date(expiryTimestamp).toISOString(),
              is_active: true,
            },
          ]);
        } catch (dbErr) {
          console.warn('Supabase coupon insert fallback:', dbErr);
        }
      }

      return { success: true, voucher: newVoucher };
    } catch (err) {
      console.error('Error issuing voucher:', err);
      return { success: false, error: 'ভাউচার ইস্যু করা সম্ভব হয়নি।' };
    }
  };

  // --- ভাউচার ব্যবহার সম্পন্ন হলে মার্ক করার মেথড ---
  const markVoucherUsed = async ({ voucherCode, customerPhone }) => {
    try {
      const code = voucherCode.trim().toUpperCase();
      
      // ১. গ্লোবাল স্টোর আপডেট
      const globalVouchers = JSON.parse(localStorage.getItem('flamingo_exclusive_vouchers') || '[]');
      const updatedGlobal = globalVouchers.map((v) => 
        v.code === code ? { ...v, isUsed: true, usedAt: Date.now() } : v
      );
      localStorage.setItem('flamingo_exclusive_vouchers', JSON.stringify(updatedGlobal));

      // ২. ইউজার স্টোর আপডেট
      const users = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
      const updatedUsers = users.map((u) => {
        if (Array.isArray(u.vouchers)) {
          return {
            ...u,
            vouchers: u.vouchers.map((v) => 
              v.code === code ? { ...v, isUsed: true, usedAt: Date.now() } : v
            ),
          };
        }
        return u;
      });
      localStorage.setItem('flamingo_users', JSON.stringify(updatedUsers));

      // ৩. বর্তমান লগইন ইউজারের স্টেট আপডেট
      if (currentUser && Array.isArray(currentUser.vouchers)) {
        const updatedCurrentUser = {
          ...currentUser,
          vouchers: currentUser.vouchers.map((v) => 
            v.code === code ? { ...v, isUsed: true, usedAt: Date.now() } : v
          ),
        };
        localStorage.setItem('flamingo_current_user', JSON.stringify(updatedCurrentUser));
        setCurrentUser(updatedCurrentUser);
      }

      // ৪. সুপাবেজে কুপন ডিঅ্যাক্টিভেট
      if (isSupabaseConfigured()) {
        try {
          await supabase.from('coupons').update({ is_active: false }).eq('code', code);
        } catch (dbErr) {
          console.warn('Supabase mark voucher used fallback:', dbErr);
        }
      }
    } catch (err) {
      console.error('Error marking voucher as used:', err);
    }
  };

  // --- ব্যবহারকারীর লেটেস্ট তথ্য রিফ্রেশ ---
  const refreshCurrentUser = () => {
    try {
      const savedUser = localStorage.getItem('flamingo_current_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const users = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
        const latest = users.find((u) => u.id === parsed.id || u.phone === parsed.phone);
        if (latest) {
          const safe = {
            id: latest.id,
            name: latest.name,
            phone: latest.phone,
            email: latest.email,
            referralCode: latest.referralCode || generateReferralCode(),
            referredByCode: latest.referredByCode || null,
            vouchers: latest.vouchers || [],
            createdAt: latest.createdAt,
          };
          localStorage.setItem('flamingo_current_user', JSON.stringify(safe));
          setCurrentUser(safe);
        }
      }
    } catch (e) {
      console.error('Error refreshing current user:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentAdmin,
        isAuthLoaded,
        registerCustomer,
        loginCustomer,
        logoutCustomer,
        loginAdmin,
        logoutAdmin,
        unifiedLogin,
        issueVoucherToCustomer,
        markVoucherUsed,
        refreshCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
