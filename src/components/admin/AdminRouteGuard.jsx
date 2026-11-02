'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { normalizeRole } from '@/lib/userService';
import { ShieldAlert, Package, Sparkles, ArrowLeft, Home, Lock } from 'lucide-react';

/**
 * Route protection guard for admin routes
 * @param {string} requiredRole - 'super_admin' (Super Admin only) | 'moderator' (Moderators & Super Admins)
 */
export default function AdminRouteGuard({ children, requiredRole = 'moderator' }) {
  const router = useRouter();
  const { currentAdmin, currentUser, isAuthLoaded } = useAuth();

  // Determine current active admin role
  const effectiveRole = currentAdmin
    ? normalizeRole(currentAdmin.role)
    : currentUser?.role
    ? normalizeRole(currentUser.role)
    : null;

  useEffect(() => {
    if (!isAuthLoaded) return;

    // 1. Not logged in as admin/staff
    if (!effectiveRole) {
      router.replace('/admin/login');
      return;
    }

    // 2. Regular customer attempting to access admin route -> redirect to '/'
    if (effectiveRole === 'customer') {
      router.replace('/');
      return;
    }

    // 3. Moderator trying to access non-authorized admin routes (fallback redirect if needed)
    // Handled visually by Access Denied screen below for a transparent, polite UX.
  }, [isAuthLoaded, effectiveRole, router]);

  // Loading state
  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-pink-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs text-gray-500 font-medium">অ্যাডমিন অ্যাক্সেস পারমিশন যাচাই হচ্ছে...</p>
      </div>
    );
  }

  // Not authenticated
  if (!effectiveRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs text-gray-400">
        অ্যাডমিন লগইন পেজে রিডাইরেক্ট করা হচ্ছে...
      </div>
    );
  }

  // Regular customer: redirecting to home
  if (effectiveRole === 'customer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs text-gray-400">
        অনুমতি নেই। হোমপেজে রিডাইরেক্ট করা হচ্ছে...
      </div>
    );
  }

  // Role Access Check: if page requires 'super_admin' and user is only 'moderator'
  if (requiredRole === 'super_admin' && effectiveRole !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto border border-rose-100 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
              403 • অ্যাক্সেস অস্বীকৃত (Access Denied)
            </span>
            <h2 className="text-xl font-bold text-gray-900 mt-3 font-serif">
              অনুমতি নেই — সুপার অ্যাডমিন সংরক্ষিত
            </h2>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              এই পেজটি শুধুমাত্র <strong>Super Admin</strong> একাউন্টের জন্য উন্মুক্ত। আপনার বর্তমান পদবি <strong>Order Moderator</strong>। আপনি অর্ডার ও প্রোডাক্ট ক্যাটালগ ম্যানেজ করতে পারেন।
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/admin/orders"
              className="w-full sm:w-auto px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-pink-600/20"
            >
              <Package className="w-4 h-4" />
              <span>অর্ডারে ফিরে যান</span>
            </Link>

            <Link
              href="/admin/products"
              className="w-full sm:w-auto px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>প্রোডাক্ট ক্যাটালগ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Permitted
  return <>{children}</>;
}
