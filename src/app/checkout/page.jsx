'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  CheckCircle, 
  Package, 
  Phone, 
  MapPin, 
  FileText, 
  Sparkles, 
  ShoppingBag, 
  BadgeAlert, 
  Tag, 
  X, 
  Check,
  Gift
} from 'lucide-react';

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();
  const { config } = useSiteConfig();
  const { currentUser, markVoucherUsed } = useAuth();

  // ডায়নামিক ডেলিভারি চার্জ (SiteConfig থেকে নেওয়া)
  const deliveryChargeInside = config.deliveryChargeInsideDhaka ?? 80;
  const deliveryChargeOutside = config.deliveryChargeOutsideDhaka ?? 130;

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    area: 'inside', // 'inside' অথবা 'outside'
    address: '',
    note: '',
  });

  // লগইন ইউজারের ক্ষেত্রে তথ্য স্বয়ংক্রিয় প্রিপপুলেট
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || currentUser.name || '',
        phone: prev.phone || currentUser.phone || '',
      }));
    }
  }, [currentUser]);

  // কুপন স্টেট
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // ডেলিভারি চার্জ নির্ধারণ
  const isOutsideDhaka = formData.area === 'outside';
  const deliveryCharge = isOutsideDhaka ? deliveryChargeOutside : deliveryChargeInside;

  // ডিসকাউন্ট ক্যালকুলেশন
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const discountedSubtotal = Math.max(0, subtotal - discountAmount);
  const grandTotal = discountedSubtotal + (cart.length > 0 ? deliveryCharge : 0);

  // সাবটোটাল পরিবর্তন হলে কুপন ডিসকাউন্ট রি-ক্যালকুলেট
  useEffect(() => {
    if (appliedCoupon) {
      let newDiscount = 0;
      if (appliedCoupon.type === 'percentage') {
        newDiscount = Math.round((subtotal * appliedCoupon.discount) / 100);
      } else {
        newDiscount = Math.min(appliedCoupon.discount, subtotal);
      }
      setAppliedCoupon((prev) => prev ? { ...prev, discountAmount: newDiscount } : null);
    }
  }, [subtotal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // কুপন প্রয়োগ হ্যান্ডলার (গ্লোবাল ও এক্সক্লুসিভ ভাউচার ভ্যালিডেশন লজিক)
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    const trimmedCode = couponInput.trim().toUpperCase();
    if (!trimmedCode) return;

    if (cart.length === 0) {
      setCouponError('কুপন প্রয়োগ করতে আপনার ব্যাগে প্রোডাক্ট যুক্ত করুন।');
      return;
    }

    // ১. গ্লোবাল কুপন খোঁজা (SiteConfigContext)
    const availableCoupons = config.coupons || [];
    const matchedGlobalCoupon = availableCoupons.find((c) => c.code.toUpperCase() === trimmedCode);

    // ২. এক্সক্লুসিভ ভাউচার খোঁজা (localStorage: flamingo_exclusive_vouchers এবং flamingo_users)
    let matchedExclusiveVoucher = null;
    try {
      const globalExclusive = JSON.parse(localStorage.getItem('flamingo_exclusive_vouchers') || '[]');
      matchedExclusiveVoucher = globalExclusive.find((v) => v.code.toUpperCase() === trimmedCode);
      
      if (!matchedExclusiveVoucher) {
        const allUsers = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
        for (const u of allUsers) {
          if (Array.isArray(u.vouchers)) {
            const found = u.vouchers.find((v) => v.code.toUpperCase() === trimmedCode);
            if (found) {
              matchedExclusiveVoucher = found;
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error('Error finding exclusive voucher:', err);
    }

    if (!matchedGlobalCoupon && !matchedExclusiveVoucher) {
      setCouponError('কুপন কোডটি সঠিক নয় অথবা মেয়াদোত্তীর্ণ!');
      return;
    }

    // এক্সক্লুসিভ ভাউচার হলে বিশেষ নিরাপত্তা ও কাস্টমার বাউন্ডিং চেক
    if (matchedExclusiveVoucher) {
      if (matchedExclusiveVoucher.isUsed) {
        setCouponError('দুঃখিত, এই ভাউচারটি ইতোমধ্যে ব্যবহার করা হয়েছে!');
        return;
      }

      if (matchedExclusiveVoucher.expiryTimestamp && Date.now() > matchedExclusiveVoucher.expiryTimestamp) {
        setCouponError('দুঃখিত, এই ভাউচারটির ব্যবহারের মেয়াদ শেষ হয়ে গেছে!');
        return;
      }

      // কাস্টমার ম্যাচিং যাচাই
      const userPhone = currentUser ? (currentUser.phone || '').trim() : formData.phone.trim();
      const userId = currentUser ? currentUser.id : null;

      const matchesUser = 
        (matchedExclusiveVoucher.customerId && matchedExclusiveVoucher.customerId === userId) ||
        (matchedExclusiveVoucher.customerPhone && matchedExclusiveVoucher.customerPhone === userPhone);

      if (!matchesUser) {
        setCouponError('দুঃখিত, এই ভাউচারটি শুধুমাত্র নির্দিষ্ট কাস্টমারের জন্য বরাদ্দ।');
        return;
      }

      let calculatedDiscount = 0;
      if (matchedExclusiveVoucher.type === 'percentage') {
        calculatedDiscount = Math.round((subtotal * matchedExclusiveVoucher.discount) / 100);
      } else {
        calculatedDiscount = Math.min(matchedExclusiveVoucher.discount, subtotal);
      }

      setAppliedCoupon({
        ...matchedExclusiveVoucher,
        isExclusive: true,
        discountAmount: calculatedDiscount,
      });
      setCouponSuccess(`এক্সক্লুসিভ ভাউচার "${matchedExclusiveVoucher.code}" সফলভাবে প্রয়োগ করা হয়েছে! ৳ ${calculatedDiscount} ছাড় পাওয়া গেছে।`);
      setCouponInput('');
      return;
    }

    // গ্লোবাল কুপন প্রয়োগ
    if (matchedGlobalCoupon) {
      let calculatedDiscount = 0;
      if (matchedGlobalCoupon.type === 'percentage') {
        calculatedDiscount = Math.round((subtotal * matchedGlobalCoupon.discount) / 100);
      } else {
        calculatedDiscount = Math.min(matchedGlobalCoupon.discount, subtotal);
      }

      setAppliedCoupon({
        ...matchedGlobalCoupon,
        isExclusive: false,
        discountAmount: calculatedDiscount,
      });
      setCouponSuccess(`কুপন "${matchedGlobalCoupon.code}" সফলভাবে প্রয়োগ করা হয়েছে! ৳ ${calculatedDiscount} ছাড় পাওয়া গেছে।`);
      setCouponInput('');
    }
  };

  // কুপন রিমুভ হ্যান্ডলার
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    setCouponSuccess('');
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);

    const orderTimestamp = Date.now();
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const orderId = `FLM-${randomCode}`;

    // আইটেম-লেভেল ওয়ারেন্টি এক্সপায়ারি টাইমস্ট্যাম্প ক্যালকুলেশন
    const itemsWithWarranty = cart.map((item) => {
      const days = typeof item.warrantyDays === 'number' ? item.warrantyDays : (item.hasWarranty ? 180 : 0);
      const expiryTimestamp = days > 0 ? orderTimestamp + days * 86400000 : null;

      return {
        ...item,
        hasWarranty: Boolean(item.hasWarranty && days > 0),
        warrantyDays: days,
        warrantyText: item.warrantyText || (days > 0 ? `${days} দিনের ফ্রি পলিশিং ওয়ারেন্টি` : 'কোনো ওয়ারেন্টি নেই'),
        orderTimestamp,
        expiryTimestamp,
        expiryDateFormatted: expiryTimestamp
          ? new Date(expiryTimestamp).toLocaleDateString('bn-BD', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          : null,
      };
    });

    const formattedDate = new Date(orderTimestamp).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const areaLabel = isOutsideDhaka 
      ? `ঢাকা সিটির বাইরে / সমগ্র বাংলাদেশ (৳${deliveryChargeOutside})` 
      : `ঢাকা সিটির ভেতরে (৳${deliveryChargeInside})`;

    // রেফারেল ট্র্যাকিং কোড
    const referredByCode = currentUser?.referredByCode || null;

    const newOrder = {
      id: orderId,
      orderId,
      orderTimestamp,
      date: formattedDate,
      customer: {
        name: formData.name,
        customerName: formData.name,
        phone: formData.phone,
        area: areaLabel,
        district: areaLabel,
        address: formData.address,
        note: formData.note || '',
      },
      items: itemsWithWarranty,
      subtotal,
      cartTotal: subtotal,
      discountAmount,
      appliedCouponCode: appliedCoupon ? appliedCoupon.code : null,
      coupon: appliedCoupon ? {
        code: appliedCoupon.code,
        type: appliedCoupon.type,
        discount: appliedCoupon.discount,
        discountAmount: appliedCoupon.discountAmount,
        note: appliedCoupon.note || '',
        isExclusive: Boolean(appliedCoupon.isExclusive),
      } : null,
      referredByCode: referredByCode,
      referralRewardIssued: false,
      deliveryCharge,
      shippingCost: deliveryCharge,
      grandTotal,
      status: 'নতুন অর্ডার (Pending)',
    };

    // যদি এক্সক্লুসিভ ভাউচার ব্যবহার করা হয়ে থাকে, তা ব্যবহৃত মার্ক করা
    if (appliedCoupon && appliedCoupon.isExclusive) {
      markVoucherUsed({
        voucherCode: appliedCoupon.code,
        customerPhone: formData.phone,
      });
    }

    // লোকাল স্টোরেজে অর্ডার জমা রাখা
    try {
      const existingOrders = JSON.parse(localStorage.getItem('flamingo_orders') || '[]');
      localStorage.setItem('flamingo_orders', JSON.stringify([newOrder, ...existingOrders]));
    } catch (err) {
      console.error('Failed to save order to localStorage:', err);
    }

    setPlacedOrder(newOrder);
    setOrderPlaced(true);
    clearCart();
    setIsSubmitting(false);
  };

  // অর্ডার কনফার্মেশন স্ক্রিন
  if (orderPlaced && placedOrder) {
    return (
      <div 
        className="min-h-screen py-12 px-4 sm:px-6 flex items-center justify-center transition-colors"
        style={{ backgroundColor: config.accentBgColor || '#FFF5F6' }}
      >
        <div className="bg-white max-w-xl w-full p-6 sm:p-10 rounded-3xl shadow-xl border border-pink-100 space-y-6 text-center animate-in fade-in">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-semibold tracking-wider uppercase text-pink-600 bg-pink-50 px-3 py-1 rounded-full">
              অর্ডার গ্রহণ সম্পন্ন হয়েছে
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-2">
              ধন্যবাদ, {placedOrder.customer.name}!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              আপনার ক্যাশ অন ডেলিভারি অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।
            </p>
          </div>

          {/* অর্ডার রসিদ সামারি */}
          <div className="bg-pink-50/50 p-5 rounded-2xl border border-pink-100 text-left text-xs space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-pink-100">
              <span className="text-gray-600">অর্ডার আইডি:</span>
              <span className="font-mono font-bold text-pink-600 text-sm">{placedOrder.id}</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>অর্ডারের সময়:</span>
              <span>{placedOrder.date}</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>যোগাযোগ:</span>
              <span className="font-mono font-semibold">{placedOrder.customer.phone}</span>
            </div>
            <div className="flex justify-between items-start text-gray-700">
              <span>ডেলিভারি ঠিকানা:</span>
              <span className="text-right max-w-[65%] font-medium">
                {placedOrder.customer.address} ({placedOrder.customer.area})
              </span>
            </div>

            {placedOrder.customer.note && (
              <div className="flex justify-between items-start text-gray-500 pt-1">
                <span>নোট:</span>
                <span className="text-right max-w-[65%] italic">{placedOrder.customer.note}</span>
              </div>
            )}

            <div className="pt-2 border-t border-pink-100 space-y-2">
              <span className="font-semibold text-gray-800 block mb-1">অর্ডারকৃত আইটেম ও ওয়ারেন্টি:</span>
              {placedOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-pink-100">
                  <div className="flex items-center gap-2">
                    <img
                      src={item.images?.[0] || item.image}
                      alt={item.name}
                      className="w-9 h-9 object-cover rounded-lg border border-pink-100"
                    />
                    <div>
                      <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-gray-500">পরিমাণ: {item.quantity} টি</p>
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-md mt-0.5 font-medium ${
                        item.hasWarranty 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {item.hasWarranty 
                          ? `🛡️ ${item.warrantyText} (${item.expiryDateFormatted} পর্যন্ত)` 
                          : 'নো ওয়ারেন্টি'}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 font-mono">৳ {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-pink-100 space-y-1.5">
              <div className="flex justify-between text-gray-600">
                <span>সাবটোটাল:</span>
                <span>৳ {placedOrder.subtotal}</span>
              </div>
              {placedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>কুপন ছাড় ({placedOrder.appliedCouponCode}):</span>
                  <span>-৳ {placedOrder.discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>ডেলিভারি চার্জ:</span>
                <span>৳ {placedOrder.deliveryCharge}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t border-pink-200">
                <span>সর্বমোট প্রদেয়:</span>
                <span className="text-pink-600 font-mono text-base">৳ {placedOrder.grandTotal}</span>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 flex items-center gap-2.5 text-left text-xs text-emerald-800">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>পার্সেল পাওয়ার পর খুলে দেখে নিশ্চিত হয়ে ক্যাশ অন ডেলিভারিতে টাকা পরিশোধ করুন।</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href={`/track-order?orderId=${placedOrder.id}`}
              className="w-full py-3.5 text-white rounded-xl text-xs font-semibold shadow-md transition text-center flex items-center justify-center gap-1.5"
              style={{ backgroundColor: config.primaryColor || '#DB2777' }}
            >
              <Truck className="w-4 h-4" />
              <span>অর্ডার ও লাইভ ওয়ারেন্টি ট্র্যাক করুন</span>
            </Link>
            <Link
              href="/collections"
              className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition text-center"
            >
              আরও কেনাকাটা করুন
            </Link>
          </div>
          <div className="text-center pt-1">
            <Link
              href="/admin/orders"
              className="text-[11px] text-gray-400 hover:text-pink-600 underline"
            >
              (অ্যাডমিন ভিউ: সকল অর্ডার তালিকা)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen py-8 px-4 sm:px-8 transition-colors"
      style={{ backgroundColor: config.accentBgColor || '#FFF5F6' }}
    >
      <div className="max-w-5xl mx-auto">
        {/* টপ হেডার */}
        <div className="flex items-center justify-between pb-6 border-b border-pink-100 mb-6">
          <Link href="/collections" className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-pink-600">
            <ArrowLeft className="w-4 h-4" /> ব্যাগে ফিরে যান
          </Link>
          <span className="text-sm font-serif font-bold tracking-wider uppercase" style={{ color: config.primaryColor || '#DB2777' }}>
            {config.brandName || 'FLAMINGO'} চেকআউট
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-pink-100 max-w-md mx-auto shadow-sm">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-lg text-gray-800">আপনার শপিং ব্যাগ খালি</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">অর্ডার করার জন্য অনুগ্রহ করে কালেকশন থেকে গহনা যুক্ত করুন।</p>
            <Link
              href="/collections"
              className="inline-block px-6 py-3 text-white rounded-xl text-xs font-semibold shadow-md"
              style={{ backgroundColor: config.primaryColor || '#DB2777' }}
            >
              কালেকশন দেখুন
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* কাস্টমার ও ডেলিভারি তথ্য ফর্ম */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-pink-100 shadow-sm space-y-5">
              <div>
                <h2 className="text-base font-serif font-bold text-gray-900 border-b border-pink-50 pb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-pink-600" /> ডেলিভারি ও কাস্টমার তথ্য
                </h2>
                <p className="text-[11px] text-gray-500 mt-1">
                  সঠিক নাম, ফোন নম্বর ও পূর্ণাঙ্গ ঠিকানা দিন যাতে দ্রুত ডেলিভারি সম্পন্ন হতে পারে।
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">আপনার পূর্ণ নাম *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="যেমন: তানজিলা আহমেদ"
                  className="w-full px-3.5 py-2.5 border border-pink-200 rounded-xl text-xs focus:outline-pink-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">মোবাইল নম্বর (১১ ডিজিট) *</label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    required
                    pattern="[0-9]{11}"
                    title="১১ ডিজিটের সঠিক মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="যেমন: 017XXXXXXXX"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-pink-200 rounded-xl text-xs focus:outline-pink-500 bg-white"
                  />
                  <Phone className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* ডায়নামিক ডেলিভারি এরিয়া সিলেকশন */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">ডেলিভারি এরিয়া সিলেক্ট করুন *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, area: 'inside' }))}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                      !isOutsideDhaka
                        ? 'border-pink-600 bg-pink-50/70 text-gray-900 ring-2 ring-pink-500/20'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                      !isOutsideDhaka ? 'border-pink-600 bg-pink-600' : 'border-gray-300'
                    }`}>
                      {!isOutsideDhaka && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="font-bold text-xs">ঢাকা সিটির ভেতরে</p>
                      <p className="text-[11px] text-pink-600 font-semibold mt-0.5">চার্জ: ৳ {deliveryChargeInside}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">২-৩ কার্যদিবসের মধ্যে ডেলিভারি</p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, area: 'outside' }))}
                    className={`p-3.5 rounded-2xl border text-left transition flex items-start gap-3 ${
                      isOutsideDhaka
                        ? 'border-pink-600 bg-pink-50/70 text-gray-900 ring-2 ring-pink-500/20'
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center ${
                      isOutsideDhaka ? 'border-pink-600 bg-pink-600' : 'border-gray-300'
                    }`}>
                      {isOutsideDhaka && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <p className="font-bold text-xs">ঢাকার বাইরে / সারা দেশ</p>
                      <p className="text-[11px] text-pink-600 font-semibold mt-0.5">চার্জ: ৳ {deliveryChargeOutside}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">৩-৫ কার্যদিবসের মধ্যে ডেলিভারি</p>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">পূর্ণাঙ্গ ঠিকানা (বাসা/রোড/এলাকা/জেলা) *</label>
                <div className="relative">
                  <textarea
                    rows={2}
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="যেমন: বাসা নং ১২, রোড নং ৫, ব্লক-বি, ধানমন্ডি, ঢাকা"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-pink-200 rounded-xl text-xs focus:outline-pink-500 bg-white"
                  />
                  <MapPin className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">বিশেষ কোনো নোট বা নির্দেশিকা (ঐচ্ছিক)</label>
                <div className="relative">
                  <input
                    type="text"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="যেমন: ছুটির দিনে বা বিকেল ৫টার পর ডেলিভারি দিলে ভালো হয়"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-pink-200 rounded-xl text-xs focus:outline-pink-500 bg-white"
                  />
                  <FileText className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-2.5 text-[11px] text-emerald-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>ক্যাশ অন ডেলিভারি নিশ্চয়তা:</strong> কোনো অগ্রিম পেমেন্ট ছাড়াই পার্সেল হাতে পেয়ে সম্পূর্ণ মূল্য পরিশোধ করবেন।
                </span>
              </div>
            </div>

            {/* ডাইনামিক অর্ডার সামারি ও কুপন সেকশন */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-pink-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-pink-50 pb-3">
                  <h3 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-pink-600" /> অর্ডার সামারি
                  </h3>
                  <span className="text-xs bg-pink-50 text-pink-600 font-bold px-2 py-0.5 rounded-lg">
                    {cart.length} টি আইটেম
                  </span>
                </div>

                {/* আইটেম লিস্ট ও ওয়ারেন্টি ব্যাজ */}
                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="p-2.5 bg-pink-50/30 rounded-2xl border border-pink-100/70 flex items-start gap-3 text-xs">
                      <img
                        src={item.images?.[0] || item.image}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-xl border border-pink-100 bg-white flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                        <div className="flex items-center justify-between text-gray-500 text-[11px] mt-0.5">
                          <span>পরিমাণ: {item.quantity} টি</span>
                          <span className="font-bold text-gray-900 font-mono">৳ {item.price * item.quantity}</span>
                        </div>
                        {/* ওয়ারেন্টি স্ট্যাটাস ব্যাজ */}
                        <div className="mt-1">
                          {item.hasWarranty ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200/80">
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              {item.warrantyText || `${item.warrantyDays} দিনের ওয়ারেন্টি`}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                              <BadgeAlert className="w-3 h-3 text-gray-400" />
                              নো ওয়ারেন্টি
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* প্রোমো / রেফারেল কুপন ইনপুট বক্স (নতুন Serial 10) */}
                <div className="pt-3 border-t border-pink-50">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5 mb-2">
                    <Tag className="w-3.5 h-3.5 text-pink-600" /> প্রোমো বা রেফারেল কোড
                  </span>

                  {!appliedCoupon ? (
                    <div className="space-y-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="যেমন: FLAMINGO10"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError('');
                          }}
                          className="flex-1 px-3.5 py-2 border border-pink-200 rounded-xl text-xs font-mono uppercase bg-white focus:outline-pink-500"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition active:scale-95 shadow-xs"
                        >
                          প্রয়োগ
                        </button>
                      </div>

                      {couponError && (
                        <p className="text-[11px] text-rose-600 font-medium">
                          {couponError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-mono font-bold text-xs text-emerald-800">
                            {appliedCoupon.code} <span className="font-normal text-[10px]">({appliedCoupon.note})</span>
                          </p>
                          <p className="text-[11px] text-emerald-600 font-semibold">
                            ছাড়: ৳ {discountAmount}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="কুপন মুছুন"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {couponSuccess && !appliedCoupon && (
                    <p className="text-[11px] text-emerald-600 font-medium mt-1">
                      {couponSuccess}
                    </p>
                  )}
                </div>

                {/* আর্থিক হিসাব */}
                <div className="border-t border-pink-50 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>প্রোডাক্ট সাবটোটাল:</span>
                    <span className="font-semibold font-mono">৳ {subtotal}</span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50/60 p-1.5 rounded-lg border border-emerald-100">
                      <span>কুপন ডিসকাউন্ট ({appliedCoupon.code}):</span>
                      <span className="font-mono">-৳ {discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="font-semibold font-mono">৳ {deliveryCharge}</span>
                  </div>

                  <div className="flex justify-between font-bold text-sm text-gray-900 pt-2 border-t border-pink-100">
                    <span>মোট প্রদেয় টাকা:</span>
                    <span className="text-base font-mono" style={{ color: config.primaryColor || '#DB2777' }}>
                      ৳ {grandTotal}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 text-white rounded-2xl font-bold text-xs shadow-lg shadow-pink-600/25 transition active:scale-[0.98] mt-2 flex items-center justify-center gap-2"
                  style={{ backgroundColor: config.primaryColor || '#DB2777' }}
                >
                  {isSubmitting ? (
                    'অর্ডার প্রসেস হচ্ছে...'
                  ) : (
                    <>
                      <span>অর্ডার কনফার্ম করুন (৳ {grandTotal})</span>
                      <ArrowLeft className="w-4 h-4 rotate-180" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
