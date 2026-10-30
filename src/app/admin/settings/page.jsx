'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Palette, 
  Type, 
  CheckCircle, 
  RefreshCcw, 
  LayoutTemplate, 
  Image as ImageIcon, 
  Package, 
  ExternalLink,
  Truck,
  Tag,
  Trash2,
  Plus,
  Percent,
  Sparkles,
  Users,
  LogOut,
  Lock,
  Search,
  Copy,
  Check,
  UserCheck,
  AlertCircle,
  Globe,
  User,
  Sliders,
  DollarSign
} from 'lucide-react';

function AdminSettingsContent() {
  const { currentAdmin, isAuthLoaded, logoutAdmin } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { config, updateConfig, updatePricing, resetToDefault } = useSiteConfig();

  // অ্যাক্টিভ ট্যাব স্টেট ('theme' | 'business' | 'coupons')
  const initialTab = searchParams.get('tab') || 'theme';
  const [activeTab, setActiveTab] = useState(
    ['theme', 'business', 'coupons'].includes(initialTab) ? initialTab : 'theme'
  );

  const [form, setForm] = useState(config);
  const [pricingForm, setPricingForm] = useState({
    opex_percentage: 8.5,
    growth_pool_percentage: 12.0,
    net_profit_percentage: 10.0,
    advance_delivery_inside_city: 80,
    advance_delivery_outside_city: 150,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState('');

  // কাস্টমার তালিকা (টার্গেটেড কুপন খোঁজার জন্য)
  const [customerList, setCustomerList] = useState([]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

  // আপগ্রেডেড কুপন ফর্ম স্টেট (টার্গেটেড ইন্ডিভিজুয়াল ও লিমিট সাপোর্ট)
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage', // 'percentage' | 'flat'
    discount: '',
    note: '',
    targetAudience: 'GLOBAL', // 'GLOBAL' | 'INDIVIDUAL'
    assignedCustomerId: '',
    assignedCustomerName: '',
    assignedCustomerPhone: '',
    assignedCustomerEmail: '',
    usageLimitPerUser: 1,
    minOrderValue: '',
  });

  // কুপন তালিকা ফিল্টার ('ALL' | 'GLOBAL' | 'INDIVIDUAL')
  const [couponFilter, setCouponFilter] = useState('ALL');

  // Authentication Guard
  useEffect(() => {
    if (isAuthLoaded && !currentAdmin) {
      router.push('/admin/login');
    }
  }, [isAuthLoaded, currentAdmin, router]);

  // URL query parameter সিঙ্ক
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['theme', 'business', 'coupons'].includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // কনফিগ ও প্রাইসিং ইনিশিয়ালাইজেশন
  useEffect(() => {
    setForm(config);
    if (config.pricingSettings) {
      setPricingForm({
        opex_percentage: Number(config.pricingSettings.opex_percentage) || 8.5,
        growth_pool_percentage: Number(config.pricingSettings.growth_pool_percentage) || 12.0,
        net_profit_percentage: Number(config.pricingSettings.net_profit_percentage) || 10.0,
        advance_delivery_inside_city: Number(config.pricingSettings.advance_delivery_inside_city) || 80,
        advance_delivery_outside_city: Number(config.pricingSettings.advance_delivery_outside_city) || 150,
      });
    }
  }, [config]);

  // কাস্টমার ডাটা লোড (টার্গেটেড কুপন সিলেকশনের জন্য)
  useEffect(() => {
    try {
      const registered = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
      const orders = JSON.parse(localStorage.getItem('flamingo_orders') || '[]');
      const custMap = new Map();

      registered.forEach((u) => {
        const key = u.phone || u.email || u.id;
        custMap.set(key, {
          id: u.id,
          name: u.name,
          phone: u.phone || '',
          email: u.email || '',
          isRegistered: true,
        });
      });

      orders.forEach((o) => {
        const c = o.customer || {};
        const key = c.phone || c.email || c.name;
        if (key && !custMap.has(key)) {
          custMap.set(key, {
            id: 'guest_' + (c.phone || Math.random().toString(36).substr(2, 6)),
            name: c.name || c.customerName || 'গেস্ট কাস্টমার',
            phone: c.phone || '',
            email: c.email || '',
            isRegistered: false,
          });
        }
      });

      setCustomerList(Array.from(custMap.values()));
    } catch (e) {
      console.error('Failed to load customers for coupon targeting:', e);
    }
  }, []);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    router.replace(`/admin/settings?tab=${tabKey}`, { scroll: false });
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handlePricingChange = (e) => {
    const { name, value } = e.target;
    const num = Number(value);
    setPricingForm((prev) => {
      const updated = { ...prev, [name]: num };
      if (name === 'advance_delivery_inside_city') {
        setForm((f) => ({ ...f, deliveryChargeInsideDhaka: num }));
      }
      if (name === 'advance_delivery_outside_city') {
        setForm((f) => ({ ...f, deliveryChargeOutsideDhaka: num }));
      }
      return updated;
    });
  };

  // থিম ও কনটেন্ট সেটিংস সেভ
  const handleSaveTheme = (e) => {
    e.preventDefault();
    updateConfig(form);
    showNotice('থিম ও কনটেন্ট সেটিংস সফলভাবে সেভ হয়েছে!');
  };

  // বিজনেস ও মার্জিন সেটিংস সেভ (সুপার অ্যাডমিন মাত্র)
  const handleSaveBusiness = async (e) => {
    e.preventDefault();
    if (currentAdmin.role !== 'superadmin') {
      alert('শুধুমাত্র সুপার অ্যাডমিন বিজনেস ও মার্জিন পরিবর্তন করতে পারেন!');
      return;
    }

    const updated = {
      ...form,
      deliveryChargeInsideDhaka: pricingForm.advance_delivery_inside_city,
      deliveryChargeOutsideDhaka: pricingForm.advance_delivery_outside_city,
      pricingSettings: pricingForm,
    };
    updateConfig(updated);

    if (updatePricing) {
      await updatePricing(pricingForm, currentAdmin.role);
    }
    showNotice('বিজনেস ও অ্যাকাউন্টিং মার্জিন সফলভাবে সেভ হয়েছে!');
  };

  // সফল মেসেজ দেখানো
  const showNotice = (msg) => {
    setSuccessMessage(msg);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setSuccessMessage('');
    }, 3500);
  };

  // ডিফল্ট রিসেট
  const handleReset = () => {
    if (confirm('আপনি কি সব সেটিংস ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?')) {
      resetToDefault();
      window.location.reload();
    }
  };

  // নতুন আপগ্রেডেড কুপন তৈরি
  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim() || !newCoupon.discount) {
      alert('কুপন কোড ও ছাড়ের পরিমাণ দেওয়া বাধ্যতামূলক!');
      return;
    }

    if (newCoupon.targetAudience === 'INDIVIDUAL' && !newCoupon.assignedCustomerPhone && !newCoupon.assignedCustomerId) {
      alert('নির্দিষ্ট কাস্টমারের জন্য কুপন তৈরি করতে অনুগ্রহ করে একজন গ্রাহক সিলেক্ট করুন বা মোবাইল নম্বর লিখুন!');
      return;
    }

    const formattedCode = newCoupon.code.trim().toUpperCase();
    const existingCoupons = form.coupons || [];

    if (existingCoupons.some((c) => c.code === formattedCode)) {
      alert('এই কুপন কোডটি ইতিমধ্যে বিদ্যমান রয়েছে!');
      return;
    }

    const formattedCoupon = {
      id: `cpn_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      code: formattedCode,
      type: newCoupon.type,
      discount: Number(newCoupon.discount),
      note: newCoupon.note.trim() || `${newCoupon.discount}${newCoupon.type === 'percentage' ? '%' : ' ৳'} ছাড়`,
      targetAudience: newCoupon.targetAudience, // 'GLOBAL' | 'INDIVIDUAL'
      assignedCustomerId: newCoupon.targetAudience === 'INDIVIDUAL' ? (newCoupon.assignedCustomerId || null) : null,
      assignedCustomerName: newCoupon.targetAudience === 'INDIVIDUAL' ? (newCoupon.assignedCustomerName || null) : null,
      assignedCustomerPhone: newCoupon.targetAudience === 'INDIVIDUAL' ? (newCoupon.assignedCustomerPhone || null) : null,
      assignedCustomerEmail: newCoupon.targetAudience === 'INDIVIDUAL' ? (newCoupon.assignedCustomerEmail || null) : null,
      usageLimitPerUser: Math.max(1, Number(newCoupon.usageLimitPerUser) || 1),
      minOrderValue: Math.max(0, Number(newCoupon.minOrderValue) || 0),
      usedCount: 0,
      usedByUsers: [],
      isActive: true,
      createdAt: Date.now(),
    };

    const updatedCoupons = [formattedCoupon, ...existingCoupons];
    const updatedForm = { ...form, coupons: updatedCoupons };
    setForm(updatedForm);
    updateConfig(updatedForm);

    // সুপাবেজ ডাটাবেজে সিঙ্ক (Optional)
    if (isSupabaseConfigured()) {
      try {
        await supabase.from('coupons').insert([
          {
            id: formattedCoupon.id,
            code: formattedCoupon.code,
            discount_amount: formattedCoupon.discount,
            discount_type: formattedCoupon.type,
            min_spend: formattedCoupon.minOrderValue,
            min_order_value: formattedCoupon.minOrderValue,
            is_exclusive: formattedCoupon.targetAudience === 'INDIVIDUAL',
            target_audience: formattedCoupon.targetAudience,
            assigned_user_id: formattedCoupon.assignedCustomerId,
            assigned_customer_phone: formattedCoupon.assignedCustomerPhone,
            assigned_customer_email: formattedCoupon.assignedCustomerEmail,
            assigned_customer_name: formattedCoupon.assignedCustomerName,
            usage_limit_per_user: formattedCoupon.usageLimitPerUser,
            is_active: true,
          },
        ]);
      } catch (err) {
        console.warn('Supabase coupon sync fallback:', err);
      }
    }

    setNewCoupon({
      code: '',
      type: 'percentage',
      discount: '',
      note: '',
      targetAudience: 'GLOBAL',
      assignedCustomerId: '',
      assignedCustomerName: '',
      assignedCustomerPhone: '',
      assignedCustomerEmail: '',
      usageLimitPerUser: 1,
      minOrderValue: '',
    });
    setCustomerSearchQuery('');
    showNotice(`কুপন "${formattedCode}" সফলভাবে তৈরি হয়েছে!`);
  };

  // কুপন মুছে ফেলা
  const handleDeleteCoupon = async (indexToDelete) => {
    const couponToDelete = (form.coupons || [])[indexToDelete];
    if (!couponToDelete) return;

    if (confirm(`আপনি কি "${couponToDelete.code}" কুপনটি ডিলিট করতে চান?`)) {
      const updatedCoupons = (form.coupons || []).filter((_, idx) => idx !== indexToDelete);
      const updatedForm = { ...form, coupons: updatedCoupons };
      setForm(updatedForm);
      updateConfig(updatedForm);

      if (isSupabaseConfigured() && couponToDelete.code) {
        try {
          await supabase.from('coupons').delete().eq('code', couponToDelete.code);
        } catch (err) {
          console.warn('Supabase coupon delete fallback:', err);
        }
      }
      showNotice(`কুপন "${couponToDelete.code}" মুছে ফেলা হয়েছে।`);
    }
  };

  // কুপন কোড কপি
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  if (!isAuthLoaded || !currentAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs text-gray-400">
        অ্যাডমিন প্রমাণীকরণ যাচাই হচ্ছে...
      </div>
    );
  }

  // ফিল্টার করা কাস্টমার ড্রপডাউন
  const filteredCustomerSuggestions = customerList.filter((c) => {
    const q = customerSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  }).slice(0, 8);

  // ফিল্টার করা কুপন তালিকা
  const displayCoupons = (form.coupons || []).filter((coupon) => {
    if (couponFilter === 'GLOBAL') {
      return !coupon.targetAudience || coupon.targetAudience === 'GLOBAL';
    }
    if (couponFilter === 'INDIVIDUAL') {
      return coupon.targetAudience === 'INDIVIDUAL' || coupon.isExclusive;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* টপ হেডার ও ন্যাভিগেশন */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 mb-6 gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2 text-xs font-semibold">
              <span className="text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5" /> সিস্টেম সেটিংস
              </span>
              <span className="text-gray-300">|</span>
              <Link 
                href="/admin/orders" 
                className="text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
              >
                <Package className="w-3.5 h-3.5" /> অর্ডার ম্যানেজমেন্ট
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/admin/products" 
                className="text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5" /> প্রোডাক্ট ক্যাটালগ
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/admin/customers" 
                className="text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
              >
                <Users className="w-3.5 h-3.5" /> কাস্টমার CRM
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/collections" 
                target="_blank"
                className="text-gray-400 hover:text-gray-700 flex items-center gap-1"
              >
                <span>স্টোরফ্রন্ট</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-pink-600" /> FLAMINGO কন্ট্রোল সেন্টার ও অ্যাডমিন সেটিংস
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              থিম ডিজাইন, অ্যাকাউন্টিং মার্জিন রেট এবং টার্গেটেড প্রোমো কুপন ক্যাম্পেইন পরিচালনা করুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* অ্যাডমিন প্রোফাইল ব্যাজ */}
            <div className="flex items-center gap-2.5 bg-white p-2 sm:px-3 rounded-2xl border border-gray-200 shadow-xs text-xs">
              <div className="text-right">
                <div className="font-bold text-gray-900 leading-tight">{currentAdmin.name}</div>
                <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-md ${
                  currentAdmin.role === 'superadmin' ? 'bg-pink-50 text-pink-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {currentAdmin.role === 'superadmin' ? 'Super Admin' : 'Staff Moderator'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  logoutAdmin();
                  router.push('/admin/login');
                }}
                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                title="লগআউট"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl transition"
              title="ডিফল্ট কনফিগারেশন রিস্টোর"
            >
              <RefreshCcw className="w-3.5 h-3.5" /> ডিফল্ট রিসেট
            </button>
          </div>
        </div>

        {/* সাকসেস নোটিশ ব্যানার */}
        {savedSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm shadow-sm animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage || 'পরিবর্তনগুলো সফলভাবে সেভ হয়েছে!'}</span>
          </div>
        )}

        {/* মেইন লজিক্যাল ট্যাব বার */}
        <div className="flex border-b border-gray-200 bg-white rounded-2xl p-1.5 shadow-xs mb-8 gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleTabChange('theme')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'theme'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50/50'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>থিম ও কনটেন্ট (Theme & Design)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('business')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'business'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50/50'
            }`}
          >
            <Percent className="w-4 h-4" />
            <span>বিজনেস ও প্রাইসিং মার্জিন (Business & Margins)</span>
            {currentAdmin.role === 'superadmin' ? (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ml-1 ${
                activeTab === 'business' ? 'bg-pink-700 text-white' : 'bg-pink-50 text-pink-700'
              }`}>
                🔒 সুপার অ্যাডমিন
              </span>
            ) : (
              <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full ml-1">
                লক
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('coupons')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50/50'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>মার্কেটিং ও কুপন (Marketing & Coupons)</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ml-1 font-mono font-bold ${
              activeTab === 'coupons' ? 'bg-pink-700 text-white' : 'bg-pink-100 text-pink-700'
            }`}>
              {(form.coupons || []).length}
            </span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* ট্যাব ১: থিম ও কনটেন্ট (Theme & Content Settings)                         */}
        {/* ========================================================================= */}
        {activeTab === 'theme' && (
          <form onSubmit={handleSaveTheme} className="space-y-6 animate-in fade-in">
            {/* লোগো ও ব্রাউজার ডিসপ্লে সেটিংস */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
                <ImageIcon className="w-5 h-5 text-pink-600" /> লোগো ও ব্রাউজার ডিসপ্লে সেটিংস
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                <div className="sm:col-span-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      লোগো ইমেজ পাথ / লিংক
                    </label>
                    <input
                      type="text"
                      name="logoUrl"
                      value={form.logoUrl || ''}
                      onChange={handleChange}
                      placeholder="/logo.png অথবা https://..."
                      className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-pink-500"
                    />
                    <span className="text-[11px] text-gray-400 mt-1 block">
                      পাবলিক ফোল্ডারের ফাইল হলে যেমন <code>/logo.png</code> দিতে পারেন।
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-xs font-semibold text-gray-700">
                        লোগোর উচ্চতা / সাইজ ({form.logoHeight || 44}px)
                      </label>
                    </div>
                    <input
                      type="range"
                      name="logoHeight"
                      min="24"
                      max="90"
                      step="2"
                      value={form.logoHeight || 44}
                      onChange={handleChange}
                      className="w-full accent-pink-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* লাইভ লোগো প্রিভিউ বক্স */}
                <div className="sm:col-span-6 flex flex-col items-center justify-center p-4 bg-pink-50/40 rounded-2xl border border-pink-100 min-h-[130px]">
                  <span className="text-[11px] font-semibold text-gray-500 mb-2">লাইভ লোগো প্রিভিউ</span>
                  {form.logoUrl ? (
                    <img
                      src={form.logoUrl}
                      alt="Logo Preview"
                      style={{ height: `${form.logoHeight || 44}px` }}
                      className="w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="text-xs text-gray-400">কোনো লোগো লিংক দেওয়া নেই</span>
                  )}
                </div>
              </div>
            </div>

            {/* ব্র্যান্ড কালার ও ফন্ট */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
                <Palette className="w-5 h-5 text-pink-600" /> ব্র্যান্ডের রঙ ও ফন্ট স্টাইলিং
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    মেইন ব্র্যান্ড কালার (Primary Color)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="primaryColor"
                      value={form.primaryColor}
                      onChange={handleChange}
                      className="w-12 h-12 rounded-xl cursor-pointer border border-gray-200"
                    />
                    <input
                      type="text"
                      name="primaryColor"
                      value={form.primaryColor}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border rounded-xl text-xs font-mono uppercase focus:outline-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    ব্যাকগ্রাউন্ড শেড (Pastel Shade)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      name="accentBgColor"
                      value={form.accentBgColor}
                      onChange={handleChange}
                      className="w-12 h-12 rounded-xl cursor-pointer border border-gray-200"
                    />
                    <input
                      type="text"
                      name="accentBgColor"
                      value={form.accentBgColor}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border rounded-xl text-xs font-mono uppercase focus:outline-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    ফন্ট স্টাইল টাইপোগ্রাফি
                  </label>
                  <select
                    name="fontFamily"
                    value={form.fontFamily}
                    onChange={handleChange}
                    className="w-full px-3 py-3 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-pink-500 bg-white"
                  >
                    <option value="serif">ক্লাসিক সেরিফ (Serif / এলিগ্যান্ট লাক্সারি লুক)</option>
                    <option value="sans">আধুনিক সান্স-সেরিফ (Sans-Serif / ক্লিন মডার্ন লুক)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* হেডলাইন ও ব্র্যান্ড টেক্সট */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
                <Type className="w-5 h-5 text-pink-600" /> হেডলাইন ও ব্র্যান্ড কনটেন্ট
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ব্র্যান্ডের নাম</label>
                  <input
                    type="text"
                    name="brandName"
                    value={form.brandName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">ট্যাগলাইন</label>
                  <input
                    type="text"
                    name="tagline"
                    value={form.tagline}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">টপ ব্যানার / অ্যানাউন্সমেন্ট টেক্সট</label>
                <input
                  type="text"
                  name="announcementText"
                  value={form.announcementText}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">শপ পেজের মূল হেডলাইন</label>
                <input
                  type="text"
                  name="heroHeadline"
                  value={form.heroHeadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">শপ পেজের সাব-হেডলাইন</label>
                <textarea
                  rows={2}
                  name="heroSubheadline"
                  value={form.heroSubheadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-pink-500"
                />
              </div>
            </div>

            {/* সেভ বাটন */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-8 py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-bold shadow-lg shadow-pink-600/30 transition active:scale-[0.98] text-xs sm:text-sm"
              >
                থিম ও কনটেন্ট সেভ করুন (Save Theme & Content)
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* ট্যাব ২: বিজনেস ও প্রাইসিং মার্জিন (Business & Margins - Super Admin)   */}
        {/* ========================================================================= */}
        {activeTab === 'business' && (
          <div className="space-y-6 animate-in fade-in">
            {currentAdmin.role !== 'superadmin' ? (
              <div className="bg-white p-8 rounded-3xl border border-rose-200 shadow-md text-center max-w-lg mx-auto space-y-4">
                <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">শুধুমাত্র সুপার অ্যাডমিন এক্সেস সংরক্ষিত</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  বিজনেস মার্জিন রেট (OPEX, Growth Pool, Net Profit) এবং ডেলিভারি ফি পরিবর্তন শুধুমাত্র প্রধান সুপার অ্যাডমিনের অনুমতি সাপেক্ষে নিয়ন্ত্রিত হয়।
                </p>
                <button
                  type="button"
                  onClick={() => handleTabChange('theme')}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition"
                >
                  থিম ও কনটেন্ট ট্যাবে ফিরে যান
                </button>
              </div>
            ) : (
              <form onSubmit={handleSaveBusiness} className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-pink-200 shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
                    <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                      <Percent className="w-5 h-5 text-pink-600" /> গ্লোবাল প্রাইসিং ও মার্জিন ইঞ্জিন সেটিংস (Accounting Margin)
                    </h2>
                    <span className="text-xs font-semibold text-pink-700 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full w-fit">
                      🔒 সুপার অ্যাডমিন পলিসি
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-500 -mt-2">
                    পণ্য তালিকায় শুধুমাত্র পণ্য ক্রয়ের মূল দাম (Base Cost Price) ইনপুট দিলেই স্বয়ংক্রিয়ভাবে মোট মার্জিন যোগ হয়ে বিক্রয় মূল্য (MRP) নির্ধারিত হবে।
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        অপারেশনাল খরচ (OPEX %) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          name="opex_percentage"
                          min="0"
                          max="50"
                          required
                          value={pricingForm.opex_percentage}
                          onChange={handlePricingChange}
                          className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold text-gray-900 focus:outline-pink-500"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs font-bold text-gray-400">%</span>
                      </div>
                      <span className="text-[11px] text-gray-400 mt-1 block">ডিফল্ট: ৮.৫%</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        গ্রোথ ও মার্কেটিং পুল (Growth Pool %) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          name="growth_pool_percentage"
                          min="0"
                          max="50"
                          required
                          value={pricingForm.growth_pool_percentage}
                          onChange={handlePricingChange}
                          className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold text-gray-900 focus:outline-pink-500"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs font-bold text-gray-400">%</span>
                      </div>
                      <span className="text-[11px] text-gray-400 mt-1 block">ডিফল্ট: ১২.০% (কমিশন পুল এতে অন্তর্ভুক্ত)</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        কোম্পানির নিট প্রফিট (Net Profit %) *
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          name="net_profit_percentage"
                          min="0"
                          max="50"
                          required
                          value={pricingForm.net_profit_percentage}
                          onChange={handlePricingChange}
                          className="w-full px-4 py-2.5 border rounded-xl text-sm font-bold text-gray-900 focus:outline-pink-500"
                        />
                        <span className="absolute right-3.5 top-2.5 text-xs font-bold text-gray-400">%</span>
                      </div>
                      <span className="text-[11px] text-gray-400 mt-1 block">ডিফল্ট: ১০.০%</span>
                    </div>
                  </div>

                  {/* লাইভ টোটাল মার্জিন ওভারভিউ কার্ড */}
                  <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl border border-pink-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <span className="text-xs font-bold text-pink-700 uppercase tracking-wider block">
                        মোট অ্যাকাউন্টিং মার্জিন (Total Margin)
                      </span>
                      <p className="text-xs text-gray-600 mt-0.5">
                        সূত্র: <code>Selling Price = Cost Price / (1 - (Total Margin / 100))</code>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black font-mono text-pink-600">
                        {(pricingForm.opex_percentage + pricingForm.growth_pool_percentage + pricingForm.net_profit_percentage).toFixed(1)}%
                      </span>
                      <span className="text-[11px] text-gray-500 block">
                        {pricingForm.opex_percentage}% + {pricingForm.growth_pool_percentage}% + {pricingForm.net_profit_percentage}%
                      </span>
                    </div>
                  </div>

                  {/* ডেলিভারি ফি সেটিংস */}
                  <div className="pt-2 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-pink-600" /> ডেলিভারি চার্জ নির্ধারণ (Doorstep COD Fee)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          ঢাকা সিটির ভেতরে ডেলিভারি ফি (৳) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400">৳</span>
                          <input
                            type="number"
                            name="advance_delivery_inside_city"
                            min="0"
                            required
                            value={pricingForm.advance_delivery_inside_city}
                            onChange={handlePricingChange}
                            className="w-full pl-8 pr-4 py-2.5 border rounded-xl text-sm font-bold focus:outline-pink-500"
                          />
                        </div>
                        <span className="text-[11px] text-gray-400 mt-1 block">ডিফল্ট: ৳ ৮০</span>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                          ঢাকা সিটির বাইরে সমগ্র বাংলাদেশ ডেলিভারি ফি (৳) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400">৳</span>
                          <input
                            type="number"
                            name="advance_delivery_outside_city"
                            min="0"
                            required
                            value={pricingForm.advance_delivery_outside_city}
                            onChange={handlePricingChange}
                            className="w-full pl-8 pr-4 py-2.5 border rounded-xl text-sm font-bold focus:outline-pink-500"
                          />
                        </div>
                        <span className="text-[11px] text-gray-400 mt-1 block">ডিফল্ট: ৳ ১৫০</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-bold shadow-lg shadow-pink-600/30 transition active:scale-[0.98] text-xs sm:text-sm"
                  >
                    মার্জিন ও বিজনেস সেটিংস সেভ করুন (Save Business & Margins)
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ট্যাব ৩: মার্কেটিং ও কুপন (Marketing & Targeted Coupons)                   */}
        {/* ========================================================================= */}
        {activeTab === 'coupons' && (
          <div className="space-y-6 animate-in fade-in">
            {/* কুপন তৈরির আপগ্রেডেড ফর্ম */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-3 gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-pink-600" /> প্রোমো কুপন ও টার্গেটেড ভাউচার ইঞ্জিন
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    পাবলিক ক্যাম্পেইন অথবা নির্দিষ্ট বিশেষ কাস্টমারের জন্য কুপন তৈরি ও ব্যবহার নিয়ন্ত্রণ করুন।
                  </p>
                </div>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full w-fit">
                  ✨ আপগ্রেডেড টার্গেটিং মোড
                </span>
              </div>

              <form onSubmit={handleAddCoupon} className="space-y-5 bg-pink-50/30 p-5 rounded-2xl border border-pink-100">
                <h3 className="text-xs font-bold text-pink-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> নতুন কুপন / রেফারেল কোড তৈরি করুন
                </h3>

                {/* টার্গেট অডিয়েন্স সিলেকশন (কুপন ব্যবহারের সুযোগ) */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-2">
                    কুপন ব্যবহারের সুযোগ (Target Audience) *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewCoupon((prev) => ({ 
                        ...prev, 
                        targetAudience: 'GLOBAL',
                        assignedCustomerId: '',
                        assignedCustomerName: '',
                        assignedCustomerPhone: '',
                        assignedCustomerEmail: ''
                      }))}
                      className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                        newCoupon.targetAudience === 'GLOBAL'
                          ? 'border-pink-600 bg-white shadow-xs ring-2 ring-pink-500/20 text-gray-900'
                          : 'border-gray-200 bg-white/70 hover:bg-white text-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        newCoupon.targetAudience === 'GLOBAL' ? 'border-pink-600 bg-pink-600' : 'border-gray-300'
                      }`}>
                        {newCoupon.targetAudience === 'GLOBAL' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-pink-600" />
                          <span>সকলের জন্য উন্মুক্ত (Public / Global)</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">যে কোনো ক্রেতা চেকআউটে কোডটি ব্যবহার করতে পারবেন</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewCoupon((prev) => ({ ...prev, targetAudience: 'INDIVIDUAL' }))}
                      className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                        newCoupon.targetAudience === 'INDIVIDUAL'
                          ? 'border-pink-600 bg-white shadow-xs ring-2 ring-pink-500/20 text-gray-900'
                          : 'border-gray-200 bg-white/70 hover:bg-white text-gray-600'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        newCoupon.targetAudience === 'INDIVIDUAL' ? 'border-pink-600 bg-pink-600' : 'border-gray-300'
                      }`}>
                        {newCoupon.targetAudience === 'INDIVIDUAL' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-purple-600" />
                          <span>নির্দিষ্ট কাস্টমার (Individual / User Specific)</span>
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">শুধুমাত্র বরাদ্দকৃত নির্দিষ্ট গ্রাহক ব্যবহার করতে পারবেন</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* যদি নির্দিষ্ট কাস্টমার সিলেক্ট করা থাকে তবে কাস্টমার ড্রপডাউন / সার্চ */}
                {newCoupon.targetAudience === 'INDIVIDUAL' && (
                  <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        টার্গেটেড কাস্টমার নির্বাচন করুন *
                      </label>
                      {newCoupon.assignedCustomerPhone && (
                        <button
                          type="button"
                          onClick={() => setNewCoupon((prev) => ({
                            ...prev,
                            assignedCustomerId: '',
                            assignedCustomerName: '',
                            assignedCustomerPhone: '',
                            assignedCustomerEmail: ''
                          }))}
                          className="text-[10px] text-rose-600 hover:underline font-semibold"
                        >
                          রিসেট সিলেকশন
                        </button>
                      )}
                    </div>

                    {newCoupon.assignedCustomerPhone ? (
                      <div className="p-3 bg-white rounded-xl border border-purple-200 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-xs text-gray-900">{newCoupon.assignedCustomerName || 'গ্রাহক'}</p>
                          <p className="text-[11px] font-mono text-purple-700">
                            📱 {newCoupon.assignedCustomerPhone} {newCoupon.assignedCustomerEmail && `| ✉️ ${newCoupon.assignedCustomerEmail}`}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          বরাদ্দকৃত
                        </span>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="গ্রাহকের নাম, মোবাইল নম্বর (১১ ডিজিট) বা ইমেইল দিয়ে সার্চ করুন..."
                            value={customerSearchQuery}
                            onFocus={() => setIsCustomerDropdownOpen(true)}
                            onChange={(e) => {
                              setCustomerSearchQuery(e.target.value);
                              setIsCustomerDropdownOpen(true);
                            }}
                            className="w-full pl-9 pr-4 py-2 border border-purple-200 rounded-xl text-xs bg-white focus:outline-purple-500"
                          />
                          <Search className="w-4 h-4 text-purple-400 absolute left-3 top-2.5" />
                        </div>

                        {/* সার্চ ড্রপডাউন রেজাল্ট */}
                        {isCustomerDropdownOpen && (
                          <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white rounded-2xl border border-purple-200 shadow-xl max-h-52 overflow-y-auto p-1.5">
                            {filteredCustomerSuggestions.length === 0 ? (
                              <div className="p-3 text-center text-xs text-gray-500">
                                কোনো কাস্টমার পাওয়া যায়নি। নিচের বক্সে সরাসরি নম্বর লিখুন।
                              </div>
                            ) : (
                              filteredCustomerSuggestions.map((cust, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => {
                                    setNewCoupon((prev) => ({
                                      ...prev,
                                      assignedCustomerId: cust.id,
                                      assignedCustomerName: cust.name,
                                      assignedCustomerPhone: cust.phone,
                                      assignedCustomerEmail: cust.email,
                                    }));
                                    setIsCustomerDropdownOpen(false);
                                  }}
                                  className="w-full text-left p-2.5 hover:bg-purple-50 rounded-xl transition flex justify-between items-center text-xs"
                                >
                                  <div>
                                    <div className="font-bold text-gray-900">{cust.name}</div>
                                    <div className="text-[11px] text-gray-500 font-mono">
                                      {cust.phone} {cust.email && `• ${cust.email}`}
                                    </div>
                                  </div>
                                  <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                                    {cust.isRegistered ? 'রেজিস্টার্ড' : 'অর্ডারকারী'}
                                  </span>
                                </button>
                              ))
                            )}

                            {/* সরাসরি ফোন নম্বর এন্ট্রি সাপোর্ট */}
                            {customerSearchQuery && (
                              <div className="border-t border-gray-100 p-2 text-center bg-gray-50 rounded-xl mt-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewCoupon((prev) => ({
                                      ...prev,
                                      assignedCustomerId: null,
                                      assignedCustomerName: `কাস্টমার (${customerSearchQuery})`,
                                      assignedCustomerPhone: customerSearchQuery.trim(),
                                      assignedCustomerEmail: '',
                                    }));
                                    setIsCustomerDropdownOpen(false);
                                  }}
                                  className="text-xs text-purple-700 font-bold hover:underline"
                                >
                                  👉 &quot;{customerSearchQuery}&quot; নম্বরকে সরাসরি টার্গেটেড গ্রাহক হিসেবে নির্বাচন করুন
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* কুপনের মূল প্যারামিটারসমূহ */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-end">
                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">কুপন কোড *</label>
                    <input
                      type="text"
                      placeholder="যেমন: SPECIAL20"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                      className="w-full px-3.5 py-2.5 border border-pink-200 rounded-xl text-xs font-mono uppercase bg-white focus:outline-pink-500 font-bold"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">ডিসকাউন্ট টাইপ</label>
                    <select
                      value={newCoupon.type}
                      onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                      className="w-full px-3 py-2.5 border border-pink-200 rounded-xl text-xs bg-white focus:outline-pink-500 font-medium"
                    >
                      <option value="percentage">শতকরা (%)</option>
                      <option value="flat">ফিক্সড টাকা (৳)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      ছাড় ({newCoupon.type === 'percentage' ? '%' : '৳'}) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="যেমন: 15 বা 100"
                      value={newCoupon.discount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                      className="w-full px-3 py-2.5 border border-pink-200 rounded-xl text-xs font-bold bg-white focus:outline-pink-500 font-mono"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      সর্বনিম্ন অর্ডার (৳)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="০ = কোনো শর্ত নেই"
                      value={newCoupon.minOrderValue}
                      onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: e.target.value })}
                      className="w-full px-3 py-2.5 border border-pink-200 rounded-xl text-xs bg-white focus:outline-pink-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      ব্যবহারের সীমা (বার/গ্রাহক)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="ডিফল্ট: ১ বার"
                      value={newCoupon.usageLimitPerUser}
                      onChange={(e) => setNewCoupon({ ...newCoupon, usageLimitPerUser: e.target.value })}
                      className="w-full px-3 py-2.5 border border-pink-200 rounded-xl text-xs bg-white focus:outline-pink-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">কুপনের নোট / ক্যাম্পেইন বিবরণ</label>
                  <input
                    type="text"
                    placeholder="যেমন: ভিআইপি লয়াল কাস্টমার ২০% উইকেন্ড অফার"
                    value={newCoupon.note}
                    onChange={(e) => setNewCoupon({ ...newCoupon, note: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-pink-200 rounded-xl text-xs bg-white focus:outline-pink-500"
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>কুপন যোগ করুন (Create Coupon)</span>
                  </button>
                </div>
              </form>

              {/* সক্রিয় কুপন তালিকা ও ফিল্টার */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <span className="text-xs font-bold text-gray-800">
                    বিদ্যমান কুপনসমূহ ({displayCoupons.length} টি সক্রিয়):
                  </span>

                  {/* ফিল্টার বাটন */}
                  <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => setCouponFilter('ALL')}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${
                        couponFilter === 'ALL' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      সকল ({form.coupons?.length || 0})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCouponFilter('GLOBAL')}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${
                        couponFilter === 'GLOBAL' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      পাবলিক
                    </button>
                    <button
                      type="button"
                      onClick={() => setCouponFilter('INDIVIDUAL')}
                      className={`px-3 py-1 rounded-lg font-semibold transition ${
                        couponFilter === 'INDIVIDUAL' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      টার্গেটেড
                    </button>
                  </div>
                </div>

                {displayCoupons.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400">
                    কোনো সক্রিয় কুপন পাওয়া যায়নি। উপরের ফর্ম পূরণ করে নতুন কুপন যুক্ত করুন।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {displayCoupons.map((coupon, idx) => {
                      const isIndividual = coupon.targetAudience === 'INDIVIDUAL' || coupon.isExclusive;
                      return (
                        <div
                          key={coupon.id || idx}
                          className="p-4 bg-white rounded-2xl border border-pink-100 shadow-xs hover:border-pink-300 transition space-y-2.5 relative"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-sm bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-lg border border-pink-200 tracking-wider">
                                  {coupon.code}
                                </span>
                                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                  {coupon.type === 'percentage' ? `${coupon.discount}% ছাড়` : `৳ ${coupon.discount} ছাড়`}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-600 mt-1 font-medium line-clamp-1">
                                {coupon.note || 'প্রোমো কুপন'}
                              </p>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleCopyCode(coupon.code)}
                                className="p-1.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                                title="কোড কপি করুন"
                              >
                                {copiedCode === coupon.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCoupon(idx)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                title="কুপন মুছুন"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* মেটাডাটা ও অডিয়েন্স ব্যাজসমূহ */}
                          <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center gap-1.5 text-[10px]">
                            {isIndividual ? (
                              <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>টার্গেটেড: {coupon.assignedCustomerName || coupon.assignedCustomerPhone || 'নির্দিষ্ট কাস্টমার'}</span>
                              </span>
                            ) : (
                              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                                <Globe className="w-3 h-3 text-gray-500" />
                                <span>পাবলিক (সকলের জন্য)</span>
                              </span>
                            )}

                            {coupon.minOrderValue > 0 && (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-medium">
                                সর্বনিম্ন অর্ডার: ৳ {coupon.minOrderValue}
                              </span>
                            )}

                            <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-medium">
                              ব্যবহার সীমা: {coupon.usageLimitPerUser || 1} বার
                            </span>

                            {coupon.usedCount > 0 && (
                              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-medium">
                                ব্যবহৃত: {coupon.usedCount} বার
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs text-gray-400">অ্যাডমিন সেটিংস লোড হচ্ছে...</div>}>
      <AdminSettingsContent />
    </Suspense>
  );
}
