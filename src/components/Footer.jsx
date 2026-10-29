'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Mail, 
  ExternalLink,
  Lock,
  ArrowRight,
  X
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

export default function Footer() {
  const pathname = usePathname();
  const { config } = useSiteConfig();
  const [activePolicy, setActivePolicy] = useState(null);
  const [currentYear, setCurrentYear] = useState('2026');

  useEffect(() => {
    setCurrentYear(String(new Date().getFullYear()));
  }, []);

  // অ্যাডমিন ড্যাশবোর্ডে স্টোরফ্রন্ট ফুটার প্রদর্শন না করা
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // সোয়াইপ পেজে ফুল-স্ক্রিন এক্সপেরিয়েন্স রাখার জন্য ফুটার হাইড করা
  if (pathname === '/swipe') {
    return null;
  }

  const policies = {
    delivery: {
      title: 'ডেলিভারি পলিসি ও চার্জ',
      content: `• ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৳${config.deliveryChargeInsideDhaka || 80} (২-৩ কার্যদিবস)।
• ঢাকা সিটির বাইরে ও সমগ্র বাংলাদেশে ডেলিভারি চার্জ ৳${config.deliveryChargeOutsideDhaka || 130} (৩-৫ কার্যদিবস)।
• ক্যাশ অন ডেলিভারি প্রযোজ্য। পার্সেল হাতে পেয়ে ডেলিভারিম্যানের সামনে চেক করে মূল্য পরিশোধের শতভাগ নিশ্চয়তা রয়েছে।`,
    },
    warranty: {
      title: 'ওয়ারেন্টি ও ফ্রি পলিশিং পলিসি',
      content: `• প্রতিটি ৯২৫ সিলভার গহনার সাথে আন্তর্জাতিক হলমার্ক সার্টিফিকেট প্রদান করা হয়।
• নির্দিষ্ট মেয়াদের (৬ মাস/১ বছর) ফ্রি রিপলিশিং ও অ্যান্টি-টার্নিশ কেয়ার সাপোর্ট।
• 'অর্ডার ট্র্যাক' পেজে গিয়ে অর্ডার আইডি বা মোবাইল নম্বর দিয়ে যেকোনো সময় ওয়ারেন্টি ক্লেইম মেমো ডাউনলোড করতে পারবেন।`,
    },
    exchange: {
      title: '৭ দিনের সহজ রিটার্ন ও এক্সচেঞ্জ পলিসি',
      content: `• পার্সেল গ্রহণের ৭ দিনের মধ্যে যেকোনো সাইজ বা মডেল পরিবর্তনের সুযোগ।
• গহনা অব্যবহৃত ও মূল গিফট বক্সে থাকতে হবে।
• কাস্টমার সাপোর্টে কল বা হোয়াটসঅ্যাপে মেসেজ দিয়ে সহজে রিটার্ন পিকআপ বুক করতে পারবেন।`,
    },
  };

  return (
    <footer className="no-print print:hidden bg-white border-t border-pink-100 text-gray-700 text-xs transition-colors">
      
      {/* ১. ট্রাস্ট ব্যাজ সেকশন */}
      <div className="border-b border-pink-100/70 bg-[#FFF9FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div 
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs"
                style={{ backgroundColor: '#FDF2F8', color: config.primaryColor || '#DB2777' }}
              >
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-gray-900 text-sm">১০০% খাঁটি ৯২৫ সিলভার</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">আন্তর্জাতিক হলমার্ক সার্টিফাইড</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div 
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs"
                style={{ backgroundColor: '#FDF2F8', color: config.primaryColor || '#DB2777' }}
              >
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-gray-900 text-sm">ক্যাশ অন ডেলিভারি</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">পার্সেল চেক করে পেমেন্ট করার সুযোগ</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div 
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs"
                style={{ backgroundColor: '#FDF2F8', color: config.primaryColor || '#DB2777' }}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-gray-900 text-sm">লাইভ ওয়ারেন্টি সাপোর্ট</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">ফ্রি পলিশিং ও অ্যান্টি-টার্নিশ কেয়ার</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div 
                className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs"
                style={{ backgroundColor: '#FDF2F8', color: config.primaryColor || '#DB2777' }}
              >
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-gray-900 text-sm">৭ দিনের সহজ এক্সচেঞ্জ</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">ঝামেলাবিহীন সাইজ ও মডেল পরিবর্তন</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ২. মূল ফুটার কনটেন্ট গ্রিড */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* ব্র্যান্ড পরিচিতি কলাম */}
          <div className="md:col-span-4 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              {config.logoUrl && (
                <img 
                  src={config.logoUrl} 
                  alt={config.brandName} 
                  style={{ height: `${Math.min(config.logoHeight || 40, 44)}px` }}
                  className="w-auto object-contain"
                />
              )}
              <div>
                <span 
                  className="text-xl sm:text-2xl font-serif font-black tracking-wider uppercase block leading-tight" 
                  style={{ color: config.primaryColor || '#DB2777' }}
                >
                  {config.brandName || 'FLAMINGO'}
                </span>
                <span className="text-[9px] text-gray-400 tracking-widest uppercase block">
                  {config.tagline || 'Elegance That Endures'}
                </span>
              </div>
            </Link>

            <p className="text-gray-500 leading-relaxed text-[11.5px]">
              খাঁটি ৯২৫ স্টার্লিং সিলভারের লাক্সারি ও মার্জিত ডিজাইনের বিশ্বস্ত ঠিকানা। সংবেদনশীল ত্বকের জন্য শতভাগ অ্যালার্জি-মুক্ত রোডিয়াম কোটিং ও সার্টিফাইড বিশুদ্ধতার অনন্য মেলবন্ধন।
            </p>

            {/* সোশ্যাল লিংকস */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-pink-100/60 hover:text-pink-600 flex items-center justify-center transition"
                title="ফেসবুক পেজ"
              >
                <FacebookIcon className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-pink-100/60 hover:text-pink-600 flex items-center justify-center transition"
                title="ইনস্টাগ্রাম প্রোফাইল"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/8801700000000?text=Hello%20FLAMINGO%20Jewelry"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition"
                title="হোয়াটসঅ্যাপে মেসেজ দিন"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* কুইক নেভিগেশন লিংক */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-gray-900 text-sm border-b border-pink-50 pb-2">
              প্রয়োজনীয় লিংক
            </h4>
            <ul className="space-y-2 text-gray-600 text-[11.5px]">
              <li>
                <Link href="/collections" className="hover:text-pink-600 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-pink-400" /> সকল সিলভার কালেকশন
                </Link>
              </li>
              <li>
                <Link href="/swipe" className="hover:text-pink-600 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-pink-400" /> সোয়াইপ মোড শপিং
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="hover:text-pink-600 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-pink-400" /> অর্ডার ও লাইভ ওয়ারেন্টি ট্র্যাক
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-pink-600 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-pink-400" /> চেকআউট ও পেমেন্ট
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-pink-600 transition flex items-center gap-1.5 font-semibold text-pink-700">
                  <ArrowRight className="w-3 h-3 text-pink-400" /> আমার একাউন্ট ও রেফারেল
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-pink-600 transition flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-pink-400" /> কাস্টমার ও স্টাফ লগইন
                </Link>
              </li>
            </ul>
          </div>

          {/* কাস্টমার পলিসি ও গ্যারান্টি */}
          <div className="md:col-span-2 space-y-3">
            <h4 className="font-serif font-bold text-gray-900 text-sm border-b border-pink-50 pb-2">
              পলিসি ও নির্দেশিকা
            </h4>
            <ul className="space-y-2 text-gray-600 text-[11.5px]">
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('delivery')}
                  className="hover:text-pink-600 transition text-left"
                >
                  ডেলিভারি পলিসি ও চার্জ
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('warranty')}
                  className="hover:text-pink-600 transition text-left"
                >
                  ওয়ারেন্টি ও কেয়ার গাইড
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActivePolicy('exchange')}
                  className="hover:text-pink-600 transition text-left"
                >
                  ৭ দিনের এক্সচেঞ্জ পলিসি
                </button>
              </li>
            </ul>
          </div>

          {/* যোগাযোগ ও হেল্পলাইন */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="font-serif font-bold text-gray-900 text-sm border-b border-pink-50 pb-2">
              কাস্টমার কেয়ার
            </h4>
            <div className="space-y-2 text-gray-600 text-[11.5px]">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-pink-600 flex-shrink-0" />
                <a href="tel:01700000000" className="hover:text-pink-600 font-mono font-bold">
                  01700-000000 (সকাল ১০টা - রাত ১০টা)
                </a>
              </p>
              <p className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <a 
                  href="https://wa.me/8801700000000?text=Hello%20FLAMINGO" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="hover:text-emerald-700 font-semibold"
                >
                  হোয়াটসঅ্যাপে সরাসরি চ্যাট
                </a>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>বনানী, ঢাকা-১২১৩, বাংলাদেশ</span>
              </p>
            </div>

            <div className="pt-2">
              <Link
                href="/track-order"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-pink-700 bg-pink-50 border border-pink-100 hover:bg-pink-100/70 transition shadow-xs"
              >
                <Truck className="w-3.5 h-3.5 text-pink-600" />
                <span>অর্ডার ট্র্যাক করুন</span>
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ৩. কপিরাইট ও অ্যাডমিন লিংক ফুটার বটম */}
      <div className="border-t border-pink-100/70 py-6 px-4 text-center text-gray-500 bg-[#FFFDFD]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-[11px]">
          <p>
            © {currentYear} <strong className="text-gray-800">{config.brandName || 'FLAMINGO'}</strong>. সর্বস্বত্ব সংরক্ষিত। খাঁটি ৯২৫ স্টার্লিং সিলভার জুয়েলারি।
          </p>
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/settings" 
              className="text-gray-400 hover:text-pink-600 transition flex items-center gap-1"
              title="অ্যাডমিন কন্ট্রোল সেন্টার"
            >
              <Lock className="w-3 h-3" /> অ্যাডমিন পোর্টাল
            </Link>
          </div>
        </div>
      </div>

      {/* পলিসি মোডাল */}
      {activePolicy && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-pink-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-pink-100">
              <h3 className="font-serif font-bold text-gray-900 text-sm sm:text-base">
                {policies[activePolicy]?.title}
              </h3>
              <button
                onClick={() => setActivePolicy(null)}
                className="p-1 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-pink-50/30 p-4 rounded-2xl border border-pink-100/60">
              {policies[activePolicy]?.content}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActivePolicy(null)}
                className="px-5 py-2 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                style={{ backgroundColor: config.primaryColor || '#DB2777' }}
              >
                ঠিক আছে
              </button>
            </div>
          </div>
        </div>
      )}

    </footer>
  );
}
