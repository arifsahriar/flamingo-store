'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { Lock, User, ShieldCheck, ArrowRight, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { loginAdmin, currentAdmin, isAuthLoaded } = useAuth();
  const { config } = useSiteConfig();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ইতোমধ্যে অ্যাডমিন হিসেবে লগইন থাকলে ড্যাশবোর্ডে রিডাইরেক্ট
  useEffect(() => {
    if (isAuthLoaded && currentAdmin) {
      if (currentAdmin.role === 'superadmin') {
        router.push('/admin/settings');
      } else {
        router.push('/admin/orders');
      }
    }
  }, [currentAdmin, isAuthLoaded, router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('ইউজারনেম এবং পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    setIsSubmitting(true);

    const res = loginAdmin({ username, password });

    if (res.success) {
      if (res.admin.role === 'superadmin') {
        router.push('/admin/settings');
      } else {
        router.push('/admin/orders');
      }
    } else {
      setError(res.error || 'ভুল ইউজারনেম বা পাসওয়ার্ড!');
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#1F2937] py-12 px-4 sm:px-6 flex items-center justify-center text-white">
      <div className="max-w-md w-full bg-[#111827] rounded-3xl p-8 sm:p-10 shadow-2xl border border-gray-800 space-y-6">
        
        {/* ব্র্যান্ড হেডার */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-pink-600/20 text-pink-500 rounded-2xl flex items-center justify-center mx-auto border border-pink-500/30">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="text-xl sm:text-2xl font-serif font-black tracking-wider uppercase text-white">
            {config.brandName || 'FLAMINGO'} স্টাফ পোর্টাল
          </h1>
          <p className="text-xs text-gray-400">
            স্টোর কনফিগারেশন, অর্ডার প্রসেসিং ও প্রোডাক্ট ক্যাটালগ ম্যানেজমেন্ট।
          </p>
        </div>

        {/* এরর মেসেজ */}
        {error && (
          <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-2xl flex items-center gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-300 mb-1.5">স্টাফ ইউজারনেম *</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="যেমন: admin অথবা moderator"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-pink-500 text-xs"
              />
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-300 mb-1.5">অ্যাক্সেস পাসওয়ার্ড *</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="পাসওয়ার্ড লিখুন"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-pink-500 text-xs"
              />
              <KeyRound className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-bold shadow-lg shadow-pink-600/30 transition active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? 'লগইন যাচাই হচ্ছে...' : (
              <>
                <span>স্টাফ ড্যাশবোর্ডে প্রবেশ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* টেস্ট ক্রেডেনশিয়াল কুইক-ফিল বাটনসমূহ */}
        <div className="pt-3 border-t border-gray-800 space-y-2">
          <p className="text-[11px] text-gray-400 font-semibold text-center">
            টেস্টিং ডেমো ক্রেডেনশিয়ালস (এক ক্লিকে ফিল করুন):
          </p>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <button
              type="button"
              onClick={() => handleQuickFill('admin', 'password123')}
              className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-left border border-gray-700 transition"
            >
              <div className="font-bold text-pink-400">Super Admin</div>
              <div className="text-[10px] text-gray-400 font-mono">admin / password123</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('moderator', 'mod123')}
              className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-xl text-left border border-gray-700 transition"
            >
              <div className="font-bold text-blue-400">Moderator</div>
              <div className="text-[10px] text-gray-400 font-mono">moderator / mod123</div>
            </button>
          </div>
        </div>

        <div className="text-center pt-2 text-xs">
          <Link href="/" className="text-gray-400 hover:text-white transition flex items-center justify-center gap-1">
            <ArrowRight className="w-3 h-3 rotate-180" /> স্টোরফ্রন্টে ফিরে যান
          </Link>
        </div>

      </div>
    </div>
  );
}
