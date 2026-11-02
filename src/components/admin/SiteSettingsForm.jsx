'use client';

import React, { useState, useEffect } from 'react';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { fetchSiteSettings, saveSiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/siteSettings';
import { 
  Building, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  Save, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Check, 
  ExternalLink 
} from 'lucide-react';

function FacebookIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

const BADGE_ICONS = [Sparkles, Truck, ShieldCheck, RotateCcw];

export default function SiteSettingsForm() {
  const { siteSettings, updateSiteSettings } = useSiteConfig();
  const [formData, setFormData] = useState(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }

  // Initial fetch from Supabase (row id = 1)
  useEffect(() => {
    let isMounted = true;
    async function loadInitial() {
      setIsLoading(true);
      try {
        const remoteData = await fetchSiteSettings();
        if (isMounted && remoteData) {
          setFormData(remoteData);
        }
      } catch (err) {
        console.error('Error fetching site_settings:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadInitial();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBadgeChange = (index, field, value) => {
    setFormData((prev) => {
      const currentBadges = Array.isArray(prev.trust_badges) && prev.trust_badges.length === 4
        ? [...prev.trust_badges]
        : [...DEFAULT_SITE_SETTINGS.trust_badges];
      
      currentBadges[index] = {
        ...currentBadges[index],
        [field]: value,
      };

      return {
        ...prev,
        trust_badges: currentBadges,
      };
    });
  };

  const showToast = (message, type = 'success') => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await (updateSiteSettings ? updateSiteSettings(formData) : saveSiteSettings(formData));
      if (res.success) {
        if (res.dbSynced) {
          showToast('সাইট ইনফো ও ফুটার সেটিংস সুপাবেজ ডাটাবেজে সফলভাবে সংরক্ষিত হয়েছে!');
        } else {
          showToast('সাইট ইনফো সেটিংস সফলভাবে সেভ হয়েছে (লোকাল ক্যাশে সংরক্ষিত)!');
        }
      } else {
        showToast('সেভ করার সময় সমস্যা হয়েছে, অনুগ্রহ করে পুনরায় চেষ্টা করুন।', 'error');
      }
    } catch (err) {
      console.error('Save failed:', err);
      showToast('সেভ করতে ব্যর্থ হয়েছে: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('আপনি কি সব সাইট ইনফো ও ফুটার সেটিংস ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান?')) {
      setFormData(DEFAULT_SITE_SETTINGS);
      showToast('ফর্ম ডিফল্ট মানে রিসেট করা হয়েছে। সেভ করতে "সেটিংস সংরক্ষণ করুন" বাটনে ক্লিক করুন।', 'success');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`p-4 rounded-2xl flex items-center justify-between text-sm shadow-md animate-in fade-in slide-in-from-top-2 transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            )}
            <span className="font-semibold">{toast.message}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setToast(null)}
            className="text-xs font-bold hover:underline opacity-80"
          >
            বন্ধ করুন
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* ১. ব্র্যান্ড পরিচিতি ও কপিরাইট টেক্সট */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Building className="w-5 h-5 text-pink-600" /> ব্র্যান্ড পরিচিতি ও ফুটার টেক্সট
            </h2>
            <span className="text-[11px] bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-full font-semibold">
              সুপাবেজ site_settings
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                ব্র্যান্ড পরিচিতি বর্ণনা (About Brand Description) *
              </label>
              <textarea
                rows={3}
                name="about_text"
                value={formData.about_text || ''}
                onChange={handleChange}
                placeholder="খাঁটি ৯২৫ স্টার্লিং সিলভারের লাক্সারি ও মার্জিত ডিজাইনের বিশ্বস্ত ঠিকানা..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-xs sm:text-sm text-gray-800 focus:outline-pink-500 transition leading-relaxed"
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                ফুটারের প্রথম কলামে লোগোর ঠিক নিচে এই পরিচিতি টেক্সটটি প্রদর্শিত হবে।
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                কপিরাইট ফুটার টেক্সট (Copyright Footer Text) *
              </label>
              <input
                type="text"
                name="copyright_text"
                value={formData.copyright_text || ''}
                onChange={handleChange}
                placeholder="© 2026 FLAMINGO. সর্বস্বত্ব সংরক্ষিত। খাঁটি ৯২৫ স্টার্লিং সিলভার জুয়েলারি।"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-pink-500 transition font-medium"
                required
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                ফুটারের সবার নিচের বারে কপিরাইট নোটিস হিসেবে প্রদর্শিত হবে।
              </span>
            </div>
          </div>
        </div>

        {/* ২. কাস্টমার সাপোর্ট ও যোগাযোগের তথ্য */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Phone className="w-5 h-5 text-pink-600" /> কাস্টমার কেয়ার হেল্পলাইন ও শপের ঠিকানা
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              এখানে দেওয়া মোবাইল নম্বর ও হোয়াটসঅ্যাপ নম্বরে গ্রাহক ফুটার থেকে সরাসরি এক ক্লিকে কল বা মেসেজ পাঠাতে পারবেন।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                সাপোর্ট ফোন নম্বর (Support Phone Number) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="support_phone"
                  value={formData.support_phone || ''}
                  onChange={handleChange}
                  placeholder="01700-000000 (সকাল ১০টা - রাত ১০টা)"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-pink-500 font-medium"
                  required
                />
                <Phone className="w-4 h-4 text-pink-500 absolute left-3 top-3" />
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">
                ফুটারের লিঙ্ক স্বয়ংক্রিয়ভাবে <code className="bg-gray-100 px-1 py-0.5 rounded text-pink-600 font-mono">tel:</code> তৈরি করে নিবে।
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                হোয়াটসঅ্যাপ নম্বর (WhatsApp Number) *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="support_whatsapp"
                  value={formData.support_whatsapp || ''}
                  onChange={handleChange}
                  placeholder="01700000000 বা +8801700000000"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-pink-500 font-mono"
                  required
                />
                <MessageCircle className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">
                ফুটারের লিঙ্ক স্বয়ংক্রিয়ভাবে <code className="bg-gray-100 px-1 py-0.5 rounded text-emerald-600 font-mono">https://wa.me/...</code> ডায়নামিক চ্যাট লিংক তৈরি করবে।
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              অফিস / স্টোর ঠিকানা (Office / Store Address) *
            </label>
            <div className="relative">
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="বনানী, ঢাকা-১২১৩, বাংলাদেশ"
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-pink-500 font-medium"
                required
              />
              <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>

        {/* ৩. সোশ্যাল মিডিয়া লিংক */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-pink-600" /> সোশ্যাল মিডিয়া প্রোফাইল লিংক
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              ফুটারের ব্র্যান্ড সেকশনে অবস্থিত ফেসবুক ও ইনস্টাগ্রাম বাটনের সরাসরি লিংক।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                ফেসবুক পেজ লিংক (Facebook URL)
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="facebook_url"
                  value={formData.facebook_url || ''}
                  onChange={handleChange}
                  placeholder="https://facebook.com/flamingostore"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-pink-500 font-mono"
                />
                <div className="absolute left-3 top-3 text-blue-600">
                  <FacebookIcon className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                ইনস্টাগ্রাম প্রোফাইল লিংক (Instagram URL)
              </label>
              <div className="relative">
                <input
                  type="url"
                  name="instagram_url"
                  value={formData.instagram_url || ''}
                  onChange={handleChange}
                  placeholder="https://instagram.com/flamingostore"
                  className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 focus:outline-pink-500 font-mono"
                />
                <div className="absolute left-3 top-3 text-pink-600">
                  <InstagramIcon className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ৪. ৪টি ট্রাস্ট ব্যাজ (৪ Trust Badges) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-600" /> ৪টি ট্রাস্ট ব্যাজ (Top Trust Badges)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                ফুটারের একদম শীর্ষে প্রদর্শিত ৪টি ট্রাস্টের টাইটেল ও সাব-টাইটেল সরাসরি কাস্টমাইজ করুন।
              </p>
            </div>
            <span className="text-xs font-bold text-pink-700 bg-pink-50 border border-pink-200 px-3 py-1 rounded-full">
              ৪টি ব্যাজ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 1, 2, 3].map((index) => {
              const Icon = BADGE_ICONS[index];
              const badge = (formData.trust_badges && formData.trust_badges[index]) || DEFAULT_SITE_SETTINGS.trust_badges[index];
              
              return (
                <div 
                  key={index} 
                  className="p-4 rounded-2xl border border-pink-100 bg-[#FFFDFD] space-y-3 hover:border-pink-300 transition"
                >
                  <div className="flex items-center gap-2.5 border-b border-pink-50 pb-2">
                    <div className="w-7 h-7 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-gray-800">
                      ব্যাজ নং {index + 1}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        টাইটেল (Title) *
                      </label>
                      <input
                        type="text"
                        value={badge.title || ''}
                        onChange={(e) => handleBadgeChange(index, 'title', e.target.value)}
                        placeholder={`ব্যাজ ${index + 1} এর শিরোনাম`}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-pink-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                        সাব-টাইটেল বিবরণ (Subtitle) *
                      </label>
                      <input
                        type="text"
                        value={badge.subtitle || ''}
                        onChange={(e) => handleBadgeChange(index, 'subtitle', e.target.value)}
                        placeholder={`ব্যাজ ${index + 1} এর সাব-টাইটেল`}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs text-gray-600 focus:outline-pink-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ৫. পলিসি টেক্সটসমূহ (Policy Texts) */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-5">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-pink-600" /> পলিসি ও গাইডলাইন টেক্সট (Customer Policies)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              ফুটারের পলিসি লিংকসমূহে ক্লিক করলে কাস্টমার পপআপে এই তথ্যগুলো দেখতে পাবেন।
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-pink-600" />
                ডেলিভারি পলিসি ও চার্জ (Delivery Policy)
              </label>
              <textarea
                rows={3}
                name="policy_delivery"
                value={formData.policy_delivery || ''}
                onChange={handleChange}
                placeholder="• ঢাকা সিটির ভেতরে ডেলিভারি চার্জ..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-xs leading-relaxed text-gray-800 focus:outline-pink-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-pink-600" />
                ওয়ারেন্টি ও কেয়ার গাইড পলিসি (Warranty Guide)
              </label>
              <textarea
                rows={3}
                name="policy_warranty"
                value={formData.policy_warranty || ''}
                onChange={handleChange}
                placeholder="• প্রতিটি ৯২৫ সিলভার গহনার সাথে আন্তর্জাতিক হলমার্ক সার্টিফিকেট..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-xs leading-relaxed text-gray-800 focus:outline-pink-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5 text-pink-600" />
                ৭ দিনের রিটার্ন ও সহজ এক্সচেঞ্জ পলিসি (7 Days Exchange Policy)
              </label>
              <textarea
                rows={3}
                name="policy_exchange"
                value={formData.policy_exchange || ''}
                onChange={handleChange}
                placeholder="• পার্সেল গ্রহণের ৭ দিনের মধ্যে যেকোনো সাইজ বা মডেল পরিবর্তনের সুযোগ..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-2xl text-xs leading-relaxed text-gray-800 focus:outline-pink-500"
              />
            </div>
          </div>
        </div>

        {/* সাবমিট ও অ্যাকশন বার */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 pb-8">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50/50 transition w-full sm:w-auto justify-center"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> ডিফল্ট টেক্সটে রিসেট
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center justify-center gap-2 px-8 py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-pink-600/30 transition active:scale-[0.98] disabled:opacity-50 w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>সেভ হচ্ছে...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>সেটিংস সংরক্ষণ করুন (Save Settings)</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
