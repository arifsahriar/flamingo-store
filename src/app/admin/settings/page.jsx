'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
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
  Lock
} from 'lucide-react';

export default function AdminSettingsPage() {
  const { currentAdmin, isAuthLoaded, logoutAdmin } = useAuth();
  const router = useRouter();
  const { config, updateConfig, resetToDefault } = useSiteConfig();
  const [form, setForm] = useState(config);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Authentication Guard
  useEffect(() => {
    if (isAuthLoaded && !currentAdmin) {
      router.push('/admin/login');
    }
  }, [isAuthLoaded, currentAdmin, router]);

  // নতুন কুপন স্টেট
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage',
    discount: '',
    note: '',
  });

  useEffect(() => {
    setForm(config);
  }, [config]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateConfig(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleReset = () => {
    if (confirm('আপনি কি সব সেটিংস ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?')) {
      resetToDefault();
      window.location.reload();
    }
  };

  // নতুন কুপন যোগ করা
  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim() || !newCoupon.discount) return;

    const formattedCoupon = {
      code: newCoupon.code.trim().toUpperCase(),
      type: newCoupon.type,
      discount: Number(newCoupon.discount),
      note: newCoupon.note.trim() || `${newCoupon.discount}${newCoupon.type === 'percentage' ? '%' : ' ৳'} ছাড়`,
    };

    // চেক করা যাতে ডুপ্লিকেট কোড না হয়
    const existingCoupons = form.coupons || [];
    if (existingCoupons.some((c) => c.code === formattedCoupon.code)) {
      alert('এই কুপন কোডটি ইতিমধ্যে বিদ্যমান রয়েছে!');
      return;
    }

    setForm((prev) => ({
      ...prev,
      coupons: [...existingCoupons, formattedCoupon],
    }));

    setNewCoupon({
      code: '',
      type: 'percentage',
      discount: '',
      note: '',
    });
  };

  // কুপন মুছে ফেলা
  const handleDeleteCoupon = (indexToDelete) => {
    setForm((prev) => ({
      ...prev,
      coupons: (prev.coupons || []).filter((_, idx) => idx !== indexToDelete),
    }));
  };

  if (!isAuthLoaded || !currentAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs text-gray-400">
        অ্যাডমিন প্রমাণীকরণ যাচাই হচ্ছে...
      </div>
    );
  }

  // Moderator Access Restriction (Serial 13 requirement)
  if (currentAdmin.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-[#FDF9FA] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-100 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">অ্যাক্সেস সংরক্ষিত</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            আপনার এই সেটিংসে প্রবেশাধিকার নেই। শুধুমাত্র সুপার অ্যাডমিন (Super Admin) অ্যাক্সেস করতে পারেন।
          </p>
          <div className="pt-2">
            <Link
              href="/admin/orders"
              className="inline-flex items-center justify-center w-full py-3 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md transition"
            >
              অর্ডার ম্যানেজমেন্টে ফিরে যান
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* হেডার */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 text-xs font-semibold">
              <span className="text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <LayoutTemplate className="w-3.5 h-3.5" /> থিম সেটিংস
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
              <LayoutTemplate className="w-6 h-6 text-pink-600" /> FLAMINGO কনটেন্ট ও থিম সেটিংস ড্যাশবোর্ড
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              কোড পরিবর্তন না করেই সাইটের লোগো, সাইজ, ডেলিভারি চার্জ, কুপন, লেখা, রঙ ও ফন্ট স্টাইল পরিবর্তন করুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* অ্যাডমিন প্রোফাইল ব্যাজ */}
            <div className="flex items-center gap-2.5 bg-white p-2 sm:px-3 rounded-2xl border border-gray-200 shadow-xs text-xs">
              <div className="text-right">
                <div className="font-bold text-gray-900 leading-tight">{currentAdmin.name}</div>
                <span className="text-[10px] font-semibold px-2 py-0.2 rounded-md bg-pink-50 text-pink-700">
                  Super Admin
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
            >
              <RefreshCcw className="w-3.5 h-3.5" /> ডিফল্ট রিসেট
            </button>
          </div>
        </div>

        {savedSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm shadow-sm animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>পরিবর্তনগুলো সফলভাবে সেভ হয়েছে এবং পুরো সাইটে কার্যকর হয়েছে!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* সেকশন ১: ডেলিভারি চার্জ সেটিংস (নতুন Serial 10) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
              <Truck className="w-5 h-5 text-pink-600" /> ডেলিভারি চার্জ কনফিগারেশন
            </h2>
            <p className="text-xs text-gray-500 -mt-2">
              চেকআউট পেজে কাস্টমারদের জন্য নির্ধারিত ডেলিভারি রেট পরিবর্তন করুন।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  ঢাকা সিটির ভেতরে ডেলিভারি চার্জ (৳)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400">৳</span>
                  <input
                    type="number"
                    name="deliveryChargeInsideDhaka"
                    min="0"
                    required
                    value={form.deliveryChargeInsideDhaka ?? 80}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2.5 border rounded-xl text-sm font-semibold focus:outline-pink-500"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">ডিফল্ট রেট: ৳ ৮০</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  ঢাকা সিটির বাইরে / সমগ্র বাংলাদেশ ডেলিভারি চার্জ (৳)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-gray-400">৳</span>
                  <input
                    type="number"
                    name="deliveryChargeOutsideDhaka"
                    min="0"
                    required
                    value={form.deliveryChargeOutsideDhaka ?? 130}
                    onChange={handleChange}
                    className="w-full pl-8 pr-4 py-2.5 border rounded-xl text-sm font-semibold focus:outline-pink-500"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">ডিফল্ট রেট: ৳ ১৩০</span>
              </div>
            </div>
          </div>

          {/* সেকশন ২: ডাইনামিক কুপন ও রেফারেল ডিসকাউন্ট ম্যানেজমেন্ট (নতুন Serial 10) */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
              <Tag className="w-5 h-5 text-pink-600" /> প্রোমো কুপন ও রেফারেল ডিসকাউন্ট ম্যানেজমেন্ট
            </h2>

            {/* কুপন যোগ করার সাব-ফর্ম */}
            <div className="bg-pink-50/40 p-4 sm:p-5 rounded-2xl border border-pink-100 space-y-4">
              <h3 className="text-xs font-bold text-pink-700 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" /> নতুন কুপন / রেফারেল কোড তৈরি করুন
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">কুপন কোড *</label>
                  <input
                    type="text"
                    placeholder="যেমন: FLAMINGO10"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl text-xs font-mono uppercase bg-white focus:outline-pink-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">ডিসকাউন্ট টাইপ</label>
                  <select
                    value={newCoupon.type}
                    onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl text-xs bg-white focus:outline-pink-500"
                  >
                    <option value="percentage">শতকরা হার (%)</option>
                    <option value="flat">ফিক্সড টাকা (৳)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                    ছাড়ের পরিমাণ ({newCoupon.type === 'percentage' ? '%' : '৳'}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="যেমন: 10 বা 50"
                    value={newCoupon.discount}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl text-xs font-semibold bg-white focus:outline-pink-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1">নোট / বিবরণ</label>
                  <input
                    type="text"
                    placeholder="যেমন: ১০% ওয়েলকাম ডিসকাউন্ট"
                    value={newCoupon.note}
                    onChange={(e) => setNewCoupon({ ...newCoupon, note: e.target.value })}
                    className="w-full px-3 py-2 border border-pink-200 rounded-xl text-xs bg-white focus:outline-pink-500"
                  />
                </div>

                <div className="sm:col-span-1">
                  <button
                    type="button"
                    onClick={handleAddCoupon}
                    className="w-full py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 flex items-center justify-center"
                    title="কুপন যোগ করুন"
                  >
                    যোগ
                  </button>
                </div>
              </div>
            </div>

            {/* বর্তমান সক্রিয় কুপন তালিকা */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-gray-700 block">
                বর্তমানে সক্রিয় কুপনসমূহ ({(form.coupons || []).length} টি):
              </span>

              {(!form.coupons || form.coupons.length === 0) ? (
                <div className="text-center py-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400">
                  বর্তমানে কোনো সক্রিয় কুপন নেই। উপরের ফর্ম দিয়ে কুপন যুক্ত করুন।
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {form.coupons.map((coupon, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 bg-white rounded-2xl border border-pink-100 shadow-xs flex items-center justify-between gap-3 hover:border-pink-300 transition"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-lg border border-pink-200">
                            {coupon.code}
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                            {coupon.type === 'percentage' ? `${coupon.discount}% ছাড়` : `৳ ${coupon.discount} ছাড়`}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 truncate">
                          {coupon.note}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition flex-shrink-0"
                        title="কুপন মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* সেকশন ৩: লোগো ও ব্র্যান্ড ইমেজ সেটিংস */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
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
                    className="w-full px-4 py-2.5 border rounded-xl text-sm"
                  />
                  <span className="text-[11px] text-gray-400 mt-1 block">
                    পাবলিক ফোল্ডারের ইমেজ হলে যেমন <code>/logo.png</code> বা <code>/logo2.png</code> দিতে পারেন।
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
                <span className="text-[11px] font-semibold text-gray-500 mb-2">লোগো প্রিভিউ</span>
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

          {/* সেকশন ৪: কালার ও ফন্ট */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-5">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
              <Palette className="w-5 h-5 text-pink-600" /> ব্র্যান্ডের রঙ ও ফন্ট
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  মেইন ব্র্যান্ড কালার
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
                    className="flex-1 px-3 py-2 border rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  ব্যাকগ্রাউন্ড শেড
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
                    className="flex-1 px-3 py-2 border rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  ফন্ট স্টাইল
                </label>
                <select
                  name="fontFamily"
                  value={form.fontFamily}
                  onChange={handleChange}
                  className="w-full px-3 py-3 border border-gray-200 rounded-xl text-sm"
                >
                  <option value="serif">ক্লাসিক সেরিফ (Serif / লাক্সারি এলিগ্যান্ট লুক)</option>
                  <option value="sans">আধুনিক সান্স-সেরিফ (Sans-Serif / ক্লিন মডার্ন লুক)</option>
                </select>
              </div>
            </div>
          </div>

          {/* সেকশন ৫: হেডলাইন ও ব্র্যান্ড টেক্সট */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 border-b pb-3">
              <Type className="w-5 h-5 text-pink-600" /> হেডলাইন ও ব্র্যান্ড টেক্সট
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ব্র্যান্ডের নাম</label>
                <input
                  type="text"
                  name="brandName"
                  value={form.brandName}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ট্যাগলাইন</label>
                <input
                  type="text"
                  name="tagline"
                  value={form.tagline}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border rounded-xl text-sm"
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
                className="w-full px-4 py-2.5 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">শপ পেজের মূল হেডলাইন</label>
              <input
                type="text"
                name="heroHeadline"
                value={form.heroHeadline}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">শপ পেজের সাব-হেডলাইন</label>
              <textarea
                rows={2}
                name="heroSubheadline"
                value={form.heroSubheadline}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border rounded-xl text-sm"
              />
            </div>
          </div>

          {/* সেভ বাটন */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-8 py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-bold shadow-lg shadow-pink-600/30 transition active:scale-[0.98]"
            >
              পরিবর্তনগুলো সেভ করুন (Save Settings)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
