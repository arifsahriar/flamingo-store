'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { Sparkles, User, Phone, Mail, Lock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { registerCustomer, currentUser, isAuthLoaded } = useAuth();
  const { config } = useSiteConfig();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ইতোমধ্যে লগইন থাকলে সরাসরি অ্যাকাউন্টে পাঠানো
  useEffect(() => {
    if (isAuthLoaded && currentUser) {
      router.push('/account');
    }
  }, [currentUser, isAuthLoaded, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // ভ্যালিডেশন
    if (!formData.name.trim()) {
      setError('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      return;
    }

    if (!/^[0-9]{11}$/.test(formData.phone.trim())) {
      setError('অনুগ্রহ করে সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)।');
      return;
    }

    if (formData.password.length < 6) {
      setError('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('পাসওয়ার্ড ও কনফার্ম পাসওয়ার্ড মিলছে না!');
      return;
    }

    setIsSubmitting(true);

    const res = registerCustomer({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      password: formData.password,
    });

    if (res.success) {
      router.push('/account');
    } else {
      setError(res.error || 'রেজিস্ট্রেশন সম্পন্ন করা সম্ভব হয়নি।');
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen py-12 px-4 sm:px-6 flex items-center justify-center transition-colors"
      style={{ backgroundColor: config.accentBgColor || '#FFF5F6' }}
    >
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-pink-100 space-y-6">
        
        {/* লোগো ও হেডার */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block">
            {config.logoUrl && (
              <img 
                src={config.logoUrl} 
                alt={config.brandName} 
                style={{ height: `${Math.min(config.logoHeight || 44, 48)}px` }}
                className="w-auto object-contain mx-auto"
              />
            )}
            <span 
              className="text-2xl font-serif font-black tracking-wider uppercase block mt-1"
              style={{ color: config.primaryColor || '#DB2777' }}
            >
              {config.brandName || 'FLAMINGO'}
            </span>
          </Link>
          <h1 className="text-xl font-serif font-bold text-gray-900">
            নতুন মেম্বার রেজিস্ট্রেশন
          </h1>
          <p className="text-xs text-gray-500">
            আপনার পছন্দের ৯২৫ সিলভার জুয়েলারি অর্ডার ও ওয়ারেন্টি ট্র্যাক করতে অ্যাকাউন্ট খুলুন।
          </p>
        </div>

        {/* এরর মেসেজ */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">আপনার পূর্ণ নাম *</label>
            <div className="relative">
              <input
                type="text"
                name="name"
                required
                placeholder="যেমন: ফারিয়া ইসলাম"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-9 pr-3.5 py-2.5 border border-pink-200 rounded-xl focus:outline-pink-500 bg-white"
              />
              <User className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">মোবাইল নম্বর (১১ ডিজিট) *</label>
            <div className="relative">
              <input
                type="tel"
                name="phone"
                required
                placeholder="017XXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-9 pr-3.5 py-2.5 border border-pink-200 rounded-xl focus:outline-pink-500 bg-white font-mono"
              />
              <Phone className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">ইমেইল ঠিকানা (ঐচ্ছিক)</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                placeholder="faria@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-9 pr-3.5 py-2.5 border border-pink-200 rounded-xl focus:outline-pink-500 bg-white"
              />
              <Mail className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">পাসওয়ার্ড *</label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-pink-200 rounded-xl focus:outline-pink-500 bg-white"
                />
                <Lock className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1.5">পাসওয়ার্ড নিশ্চিত করুন *</label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  required
                  placeholder="পুনরায় পাসওয়ার্ড দিন"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3.5 py-2.5 border border-pink-200 rounded-xl focus:outline-pink-500 bg-white"
                />
                <Lock className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>

          <div className="p-3 bg-pink-50/60 rounded-xl border border-pink-100 flex items-center gap-2 text-[11px] text-gray-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>আপনার পাসওয়ার্ড ও তথ্যাদি সম্পূর্ণ সুরক্ষিত ও গোপনীয় রাখা হয়।</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 text-white rounded-2xl font-bold shadow-lg shadow-pink-600/25 transition active:scale-[0.98] flex items-center justify-center gap-2"
            style={{ backgroundColor: config.primaryColor || '#DB2777' }}
          >
            {isSubmitting ? 'প্রসেস হচ্ছে...' : (
              <>
                <span>অ্যাকাউন্ট তৈরি করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-100 text-xs text-gray-600">
          ইতোমধ্যে একটি অ্যাকাউন্ট আছে?{' '}
          <Link href="/login" className="font-bold text-pink-600 hover:underline">
            লগইন করুন
          </Link>
        </div>

      </div>
    </div>
  );
}
