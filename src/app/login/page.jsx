'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { User, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginCustomer, currentUser, isAuthLoaded } = useAuth();
  const { config } = useSiteConfig();

  const redirectUrl = searchParams.get('redirect') || '/account';

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ইতোমধ্যে লগইন থাকলে কাঙ্ক্ষিত পেজে রিডাইরেক্ট
  useEffect(() => {
    if (isAuthLoaded && currentUser) {
      router.push(redirectUrl);
    }
  }, [currentUser, isAuthLoaded, redirectUrl, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.identifier.trim() || !formData.password) {
      setError('অনুগ্রহ করে মোবাইল/ইমেইল এবং পাসওয়ার্ড লিখুন।');
      return;
    }

    setIsSubmitting(true);

    const res = loginCustomer({
      identifier: formData.identifier,
      password: formData.password,
    });

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.error || 'লগইন ব্যর্থ হয়েছে।');
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
            কাস্টমার লগইন
          </h1>
          <p className="text-xs text-gray-500">
            আপনার অ্যাকাউন্টে লগইন করে পূর্বের অর্ডার ও ওয়ারেন্টি স্ট্যাটাস দেখুন।
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
            <label className="block font-semibold text-gray-700 mb-1.5">মোবাইল নম্বর অথবা ইমেইল *</label>
            <div className="relative">
              <input
                type="text"
                name="identifier"
                required
                placeholder="017XXXXXXXX অথবা example@mail.com"
                value={formData.identifier}
                onChange={handleChange}
                className="w-full pl-9 pr-3.5 py-2.5 border border-pink-200 rounded-xl focus:outline-pink-500 bg-white"
              />
              <User className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="font-semibold text-gray-700">পাসওয়ার্ড *</label>
            </div>
            <div className="relative">
              <input
                type="password"
                name="password"
                required
                placeholder="আপনার পাসওয়ার্ড লিখুন"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-9 pr-3.5 py-2.5 border border-pink-200 rounded-xl focus:outline-pink-500 bg-white"
              />
              <Lock className="w-4 h-4 text-pink-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 text-white rounded-2xl font-bold shadow-lg shadow-pink-600/25 transition active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
            style={{ backgroundColor: config.primaryColor || '#DB2777' }}
          >
            {isSubmitting ? 'লগইন হচ্ছে...' : (
              <>
                <span>লগইন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-gray-100 text-xs text-gray-600">
          কোনো অ্যাকাউন্ট নেই?{' '}
          <Link href="/register" className="font-bold text-pink-600 hover:underline">
            নতুন অ্যাকাউন্ট খুলুন
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF5F6] flex items-center justify-center text-xs text-gray-500">লোড হচ্ছে...</div>}>
      <LoginContent />
    </Suspense>
  );
}
