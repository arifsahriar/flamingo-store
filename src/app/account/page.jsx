'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  LogOut, 
  ShoppingBag, 
  ShieldCheck, 
  Package, 
  ArrowRight, 
  Truck, 
  ExternalLink,
  Sparkles,
  Clock,
  Gift,
  Copy,
  Check,
  Share2,
  Tag,
  CheckCircle2,
  Users
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { currentUser, logoutCustomer, isAuthLoaded } = useAuth();
  const { config } = useSiteConfig();

  const [orders, setOrders] = useState([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedVoucher, setCopiedVoucher] = useState(null);
  const [referralStats, setReferralStats] = useState({
    successfulReferrals: 0,
    totalVouchers: 0,
  });
  const [userVouchers, setUserVouchers] = useState([]);

  // রুট গার্ড: কাস্টমার লগইন না থাকলে /login এ রিডাইরেক্ট
  useEffect(() => {
    if (isAuthLoaded && !currentUser) {
      router.push('/login');
    }
  }, [currentUser, isAuthLoaded, router]);

  // ব্যবহারকারীর ফোন বা ইমেইলের সাথে মিলে এমন অর্ডার ও রেফারেল মেট্রিক্স লোড করা
  useEffect(() => {
    if (currentUser) {
      try {
        const allOrders = JSON.parse(localStorage.getItem('flamingo_orders') || '[]');
        const allUsers = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
        const globalVouchers = JSON.parse(localStorage.getItem('flamingo_exclusive_vouchers') || '[]');

        const userPhone = (currentUser.phone || '').trim();
        const userEmail = (currentUser.email || '').trim().toLowerCase();
        const userRefCode = (currentUser.referralCode || '').toUpperCase().trim();

        // ইউজার এর নিজস্ব অর্ডারস
        const myOrders = allOrders.filter((ord) => {
          const custPhone = (ord.customer?.phone || '').trim();
          const custEmail = (ord.customer?.email || '').trim().toLowerCase();
          return (custPhone && custPhone === userPhone) || (userEmail && custEmail && custEmail === userEmail);
        });
        setOrders(myOrders);

        // সফল রেফারেল গণনা (কতজন এই ইউজারের রেফারেল কোড ব্যবহার করে রেজিস্টার বা অর্ডার করেছে)
        const referredOrders = allOrders.filter(
          (ord) => ord.referredByCode && ord.referredByCode.toUpperCase() === userRefCode
        );
        const referredUsers = allUsers.filter(
          (u) => u.referredByCode && u.referredByCode.toUpperCase() === userRefCode
        );
        
        // ইউনিক রেফারেল কাউন্ট (ইউজার বা অর্ডারের ম্যাক্সিমাম)
        const successfulReferrals = Math.max(referredUsers.length, referredOrders.length);

        // ইউজারের জন্য বরাদ্দকৃত ভাউচারসমূহ (currentUser.vouchers + global exclusive matching phone/id)
        const matchedGlobalVouchers = globalVouchers.filter(
          (v) => (v.customerId && v.customerId === currentUser.id) || (v.customerPhone && v.customerPhone === userPhone)
        );
        const directVouchers = Array.isArray(currentUser.vouchers) ? currentUser.vouchers : [];

        // ডুপ্লিকেট মুক্ত ভাউচার তালিকা
        const voucherMap = new Map();
        [...directVouchers, ...matchedGlobalVouchers].forEach((v) => {
          if (v && v.code) voucherMap.set(v.code, v);
        });
        const combinedVouchers = Array.from(voucherMap.values());

        setUserVouchers(combinedVouchers);
        setReferralStats({
          successfulReferrals,
          totalVouchers: combinedVouchers.length,
        });

      } catch (e) {
        console.error('Failed to load user account data:', e);
      }
    }
  }, [currentUser]);

  if (!isAuthLoaded || !currentUser) {
    return (
      <div className="min-h-screen bg-[#FFF5F6] flex items-center justify-center text-xs text-gray-500">
        অ্যাকাউন্ট ভেরিফাই হচ্ছে...
      </div>
    );
  }

  const handleLogout = () => {
    logoutCustomer();
    router.push('/login');
  };

  const referralCode = currentUser.referralCode || 'REF-FLAMINGO';
  const shareableUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/register?ref=${referralCode}` 
    : `https://flamingo-store.vercel.app/register?ref=${referralCode}`;

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyVoucherCode = (code) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopiedVoucher(code);
      setTimeout(() => setCopiedVoucher(null), 2000);
    }
  };

  const totalSpent = orders.reduce((sum, ord) => sum + (Number(ord.grandTotal) || 0), 0);

  return (
    <div 
      className="min-h-screen py-10 px-4 sm:px-8 transition-colors duration-300"
      style={{ backgroundColor: config.accentBgColor || '#FFF5F6' }}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* টপ হেডার ও ন্যাভবার */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-pink-100 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Link href="/collections" className="text-xs text-gray-500 hover:text-pink-600 flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5 rotate-180" /> শপে ফিরে যান
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 flex items-center gap-2">
              <User className="w-7 h-7 text-pink-600" /> আমার প্রোফাইল ও ড্যাশবোর্ড
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              স্বাগতম, <strong>{currentUser.name}</strong>! আপনার রেফারেল কোড, রিওয়ার্ড ভাউচার ও অর্ডার হিস্ট্রি নিচে দেখুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/collections"
              className="px-4 py-2 text-white rounded-xl text-xs font-bold shadow-md transition"
              style={{ backgroundColor: config.primaryColor || '#DB2777' }}
            >
              কালেকশন দেখুন
            </Link>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-white border border-pink-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
            >
              <LogOut className="w-3.5 h-3.5" /> লগআউট
            </button>
          </div>
        </div>

        {/* প্রোফাইল ওভারভিউ ও সামারি কার্ডস */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* ইউজার কার্ড */}
          <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-pink-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3.5 pb-4 border-b border-pink-50">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center font-serif font-black text-xl shadow-xs"
                style={{ backgroundColor: '#FDF2F8', color: config.primaryColor || '#DB2777' }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-serif font-bold text-gray-900 text-base">{currentUser.name}</h3>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  ভেরিফাইড সিলভার মেম্বার
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-gray-600">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-pink-500 flex-shrink-0" />
                <span className="font-mono font-semibold">{currentUser.phone}</span>
              </p>
              {currentUser.email && (
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-pink-500 flex-shrink-0" />
                  <span>{currentUser.email}</span>
                </p>
              )}
              {currentUser.createdAt && (
                <p className="flex items-center gap-2 text-gray-400 text-[11px]">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span>যোগদানের তারিখ: {currentUser.createdAt}</span>
                </p>
              )}
            </div>
          </div>

          {/* স্ট্যাটস কার্ডস (অর্ডার, খরচ, রেফারেল ও ভাউচার) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
                <span>মোট সম্পন্ন অর্ডার</span>
                <ShoppingBag className="w-4 h-4 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-gray-900">{orders.length}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">ক্যাশ অন ডেলিভারি পার্সেল</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
                <span>মোট কেনাকাটা</span>
                <Sparkles className="w-4 h-4 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-pink-600">৳ {totalSpent.toLocaleString('en-US')}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">৯২৫ সিলভার জুয়েলারি</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-sm flex flex-col justify-between bg-gradient-to-br from-white to-emerald-50/20">
              <div className="flex items-center justify-between text-emerald-700 text-xs mb-1">
                <span className="font-semibold">সফল রেফারেল সংখ্যা</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-emerald-600">{referralStats.successfulReferrals} জন</p>
                <p className="text-[10px] text-gray-400 mt-0.5">আপনার রেফারেল মেম্বার</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-pink-100 shadow-sm flex flex-col justify-between bg-gradient-to-br from-white to-pink-50/20">
              <div className="flex items-center justify-between text-pink-700 text-xs mb-1">
                <span className="font-semibold">অর্জিত রিওয়ার্ড ভাউচার</span>
                <Gift className="w-4 h-4 text-pink-600" />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono text-pink-600">{referralStats.totalVouchers} টি</p>
                <p className="text-[10px] text-gray-400 mt-0.5">ব্যক্তিগত ডিসকাউন্ট ভাউচার</p>
              </div>
            </div>
          </div>

        </div>

        {/* রেফারেল কোড ও শেয়ারিং বক্স (Customer Referral Box) */}
        <div className="bg-white p-6 rounded-3xl border-2 border-dashed border-pink-300 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-pink-700 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                <Gift className="w-3.5 h-3.5 text-pink-600" /> আমার রেফারেল কোড ও লিংক
              </span>
              <h3 className="font-serif font-bold text-gray-900 text-base">
                বন্ধুদের সাথে শেয়ার করুন এবং অর্ডার ডেলিভারি হলে জিতে নিন স্পেশাল ডিসকাউন্ট ভাউচার!
              </h3>
              <p className="text-xs text-gray-500">
                আপনার রেফারেল কোড ব্যবহার করে যে কেউ রেজিস্ট্রেশন করে কেনাকাটা সম্পন্ন করলে আপনার অ্যাকাউন্টে স্বয়ংক্রিয়ভাবে রিওয়ার্ড যোগ হবে।
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            {/* কোড ডিসপ্লে ও কপি */}
            <div className="sm:col-span-5 flex items-center justify-between bg-pink-50/60 p-3 rounded-2xl border border-pink-200">
              <div>
                <span className="text-[10px] font-bold text-gray-500 uppercase block">আপনার ইউনিক কোড:</span>
                <strong className="font-mono text-base font-black text-pink-600 tracking-wider">
                  {referralCode}
                </strong>
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95 shadow-xs"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'কপি হয়েছে!' : 'কোড কপি'}</span>
              </button>
            </div>

            {/* ইনভাইট লিংক ও কপি */}
            <div className="sm:col-span-7 flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-200">
              <div className="min-w-0 pr-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">ইনভাইটেশন লিংক:</span>
                <p className="font-mono text-xs text-gray-800 truncate font-medium">
                  {shareableUrl}
                </p>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95 shadow-xs flex-shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'লিংক কপি হয়েছে!' : 'লিংক কপি করুন'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* আমার এক্সক্লুসিভ ভাউচারসমূহ (My Exclusive Vouchers) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-pink-600" /> আমার এক্সক্লুসিভ ভাউচারসমূহ ({userVouchers.length})
            </h2>
            <span className="text-xs text-gray-400">শুধুমাত্র আপনার অ্যাকাউন্টে ব্যবহারযোগ্য</span>
          </div>

          {userVouchers.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-pink-100 text-center space-y-2 shadow-sm">
              <Gift className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-serif font-bold text-gray-800 text-sm">কোনো সক্রিয় এক্সক্লুসিভ ভাউচার নেই</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                বন্ধুদের সাথে রেফারেল লিংক শেয়ার করুন। তাদের অর্ডার ডেলিভারি সম্পন্ন হলে এডমিন কর্তৃক বিশেষ রিওয়ার্ড ভাউচার আপনার এই সেকশনে যুক্ত হবে।
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userVouchers.map((vouch) => {
                const isUsed = Boolean(vouch.isUsed);
                const isExpired = vouch.expiryTimestamp ? Date.now() > vouch.expiryTimestamp : false;
                const isCopied = copiedVoucher === vouch.code;

                return (
                  <div 
                    key={vouch.code}
                    className={`bg-white rounded-3xl p-5 border shadow-sm space-y-3 transition relative overflow-hidden ${
                      isUsed 
                        ? 'border-gray-200 opacity-60 bg-gray-50' 
                        : isExpired 
                        ? 'border-rose-200 bg-rose-50/20' 
                        : 'border-pink-200 hover:shadow-md bg-gradient-to-br from-white to-pink-50/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                          এক্সক্লুসিভ ভাউচার
                        </span>
                        <h4 className="font-mono font-black text-lg text-pink-600 tracking-wider">
                          {vouch.code}
                        </h4>
                      </div>

                      <div>
                        {isUsed ? (
                          <span className="text-[10px] font-semibold bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full">
                            ব্যবহৃত (Used)
                          </span>
                        ) : isExpired ? (
                          <span className="text-[10px] font-semibold bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full">
                            মেয়াদোত্তীর্ণ
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> সক্রিয়
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-gray-900 text-sm">
                        {vouch.type === 'percentage' ? `${vouch.discount}% ছাড়` : `৳ ${vouch.discount} ফ্ল্যাট ছাড়`}
                      </p>
                      <p className="text-[11px] text-gray-600">
                        {vouch.note || 'স্পেশাল রিওয়ার্ড ভাউচার'}
                      </p>
                      <p className="text-[10px] text-gray-400 pt-1">
                        মেয়াদ শেষ: {vouch.expiryDateFormatted || 'সীমিত সময়ের জন্য'}
                      </p>
                    </div>

                    {!isUsed && !isExpired && (
                      <div className="pt-2 border-t border-pink-100 flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">চেকআউট পেজে পেস্ট করুন</span>
                        <button
                          onClick={() => handleCopyVoucherCode(vouch.code)}
                          className="px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95 shadow-xs"
                        >
                          {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{isCopied ? 'কপি হয়েছে' : 'কোড কপি'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* অর্ডার হিস্ট্রি সেকশন */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-pink-600" /> আমার অর্ডার ও ওয়ারেন্টি হিস্ট্রি ({orders.length})
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-pink-100 text-center space-y-3 shadow-sm">
              <Package className="w-12 h-12 text-gray-300 mx-auto" />
              <h3 className="text-base font-serif font-bold text-gray-800">এখনো কোনো অর্ডার পাওয়া যায়নি</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                আপনি এখনো কোনো অর্ডার করেননি অথবা অন্য কোনো ফোন নম্বর দিয়ে অর্ডার করেছেন।
              </p>
              <div className="pt-2">
                <Link
                  href="/collections"
                  className="inline-block px-5 py-2.5 text-white rounded-xl text-xs font-bold shadow-md transition"
                  style={{ backgroundColor: config.primaryColor || '#DB2777' }}
                >
                  কালেকশন দেখুন ও শপিং করুন
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const orderId = order.orderId || order.id;
                const items = order.items || [];

                return (
                  <div
                    key={orderId}
                    className="bg-white rounded-3xl border border-pink-100 shadow-sm p-5 sm:p-6 space-y-4 transition hover:shadow-md"
                  >
                    <div className="flex flex-wrap justify-between items-center pb-3 border-b border-gray-100 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs bg-pink-50 text-pink-600 px-3 py-1 rounded-xl border border-pink-100">
                          {orderId}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> {order.date}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-xl border ${
                          order.status?.includes('Delivered')
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {order.status || 'নতুন অর্ডার (Pending)'}
                        </span>

                        <Link
                          href={`/track-order?orderId=${orderId}`}
                          className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1"
                        >
                          <span>ট্র্যাক ও ক্লেইম করুন</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>

                    {/* আইটেমস লিস্ট */}
                    <div className="space-y-2 text-xs">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-pink-50/20">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.images?.[0] || item.image}
                              alt={item.name}
                              className="w-10 h-10 object-cover rounded-lg border border-pink-100 bg-white"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                              <div className="flex items-center gap-2 text-[10px] text-gray-500 mt-0.5">
                                <span>পরিমাণ: {item.quantity} টি</span>
                                {item.hasWarranty && (
                                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                                    🛡️ {item.warrantyText}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className="font-mono font-bold text-gray-900">৳ {item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* মোট ও ডেলিভারি বিবরণ */}
                    <div className="pt-2 border-t border-gray-100 flex flex-wrap justify-between items-center text-xs text-gray-600">
                      <p className="text-[11px] text-gray-500">
                        ডেলিভারি ঠিকানা: {order.customer?.address} ({order.customer?.area})
                      </p>
                      <p className="font-bold text-sm text-gray-900">
                        মোট প্রদেয়: <strong className="text-pink-600 font-mono">৳ {order.grandTotal}</strong>
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
