'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { User, Lock, ArrowRight, AlertCircle, Sparkles, Shield, UserCheck } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { unifiedLogin, currentUser, currentAdmin, isAuthLoaded } = useAuth();
  const { config } = useSiteConfig();

  const redirectUrl = searchParams.get('redirect') || '/account';

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ইতোমধ্যে লগইন থাকলে যথাযথ পোর্টালে রিডাইরেক্ট
  useEffect(() => {
    if (isAuthLoaded) {
      if (currentAdmin) {
        router.push('/admin/orders');
      } else if (currentUser) {
        router.push(redirectUrl);
      }
    }
  }, [currentUser, currentAdmin, isAuthLoaded, redirectUrl, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleQuickFill = (identifier, password) => {
    setFormData({ identifier, password });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccessToast('');

    if (!formData.identifier.trim() || !formData.password) {
      setError('অনুগ্রহ করে মোবাইল নম্বর/ইউজারনেম এবং পাসওয়ার্ড লিখুন।');
      return;
    }

    setIsSubmitting(true);

    const res = unifiedLogin({
      identifier: formData.identifier,
      password: formData.password,
    });

    if (res.success) {
      if (res.userType === 'admin') {
        setSuccessToast(`স্বাগতম ${res.admin?.name || 'অ্যাডমিন'}! অ্যাডমিন ড্যাশবোর্ডে প্রবেশ করা হচ্ছে...`);
        setTimeout(() => {
          router.push('/admin/orders');
        }, 600);
      } else {
        setSuccessToast(`স্বাগতম ${res.user?.name || 'সম্মানিত কাস্টমার'}! আপনার প্রোফাইলে প্রবেশ করা হচ্ছে...`);
        setTimeout(() => {
          router.push(redirectUrl);
        }, 600);
      }
    } else {
      setError(res.error || 'ইউজারনেম/মোবাইল অথবা পাসওয়ার্ড সঠিক নয়!');
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
            স্মার্ট লগইন গেটওয়ে
          </h1>
          <p className="text-xs text-gray-500">
            কাস্টমার অ্যাকাউন্ট অথবা স্টাফ ক্রেডেনশিয়াল ব্যবহার করে এক ক্লিকে লগইন করুন।
          </p>
        </div>

        {/* এরর মেসেজ */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* সাকসেস টোস্ট */}
        {successToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 animate-in fade-in font-medium">
            <UserCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 mb-1.5">মোবাইল নম্বর / ইমেইল / ইউজারনেম *</label>
            <div className="relative">
              <input
                type="text"
                name="identifier"
                required
                placeholder="017XXXXXXXX অথবা admin / moderator"
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
            {isSubmitting ? 'যাচাই হচ্ছে...' : (
              <>
                <span>লগইন করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* ডেমো ক্রেডেনশিয়াল ফিল বাটনস */}
        <div className="pt-2 border-t border-gray-100">
          <p className="text-[11px] font-semibold text-gray-500 mb-2 text-center">
            টেস্টিং ডেমো অ্যাকাউন্টস (১-ক্লিক ফিল):
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'password123')}
              className="text-[10px] px-2.5 py-1.5 bg-pink-50 text-pink-700 hover:bg-pink-100 rounded-lg font-semibold border border-pink-100 transition flex items-center gap-1"
            >
              <Shield className="w-3 h-3" /> সুপার অ্যাডমিন
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('moderator', 'mod123')}
              className="text-[10px] px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold border border-blue-100 transition flex items-center gap-1"
            >
              <Shield className="w-3 h-3" /> মডারেটর
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('01700112233', '123456')}
              className="text-[10px] px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-semibold border border-emerald-100 transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" /> ডেমো কাস্টমার
            </button>
          </div>
        </div>

        <div className="text-center pt-3 border-t border-gray-100 text-xs text-gray-600">
          কোনো অ্যাকাউন্ট নেই?{' '}
          <Link href="/register" className="font-bold text-pink-600 hover:underline">
            নতুন কাস্টমার রেজিস্ট্রেশন
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
