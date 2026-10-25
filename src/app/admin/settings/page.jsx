'use client';

import React, { useState } from 'react';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { Palette, Type, CheckCircle, RefreshCcw, LayoutTemplate, Image as ImageIcon } from 'lucide-react';

export default function AdminSettingsPage() {
  const { config, updateConfig, resetToDefault } = useSiteConfig();
  const [form, setForm] = useState(config);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* হেডার */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <LayoutTemplate className="w-6 h-6 text-pink-600" /> FLAMINGO কনটেন্ট ও থিম সেটিংস ড্যাশবোর্ড
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              কোড পরিবর্তন না করেই সাইটের লোগো, সাইজ, লেখা, রঙ ও ফন্ট স্টাইল পরিবর্তন করুন।
            </p>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-xl transition"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> ডিফল্ট রিসেট
          </button>
        </div>

        {savedSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-2 text-sm shadow-sm">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>পরিবর্তনগুলো সফলভাবে সেভ হয়েছে এবং পুরো সাইটে কার্যকর হয়েছে!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          
          {/* সেকশন ১: লোগো ও ব্র্যান্ড ইমেজ সেটিংস (নতুন) */}
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

          {/* সেকশন ২: কালার ও ফন্ট */}
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

          {/* সেকশন ৩: হেডলাইন ও ব্র্যান্ড টেক্সট */}
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