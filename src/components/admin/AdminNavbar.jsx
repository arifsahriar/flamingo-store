'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { normalizeRole } from '@/lib/userService';
import { 
  Package, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Sliders, 
  ExternalLink, 
  LogOut, 
  UserCheck, 
  Shield 
} from 'lucide-react';

export default function AdminNavbar({ activePage = '' }) {
  const router = useRouter();
  const { currentAdmin, currentUser, logoutAdmin } = useAuth();

  const activeAdmin = currentAdmin || currentUser;
  const role = normalizeRole(activeAdmin?.role);
  const isSuperAdmin = role === 'super_admin';

  const handleLogout = () => {
    logoutAdmin();
    router.push('/admin/login');
  };

  return (
    <div className="pb-6 border-b border-gray-200 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* ন্যাভিগেশন লিংকসমূহ */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          
          {/* ১. অর্ডার ম্যানেজমেন্ট (উভয় রোল) */}
          <Link
            href="/admin/orders"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activePage === 'orders'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>অর্ডার ম্যানেজমেন্ট</span>
          </Link>

          {/* ২. প্রোডাক্ট ক্যাটালগ (উভয় রোল) */}
          <Link
            href="/admin/products"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activePage === 'products'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>প্রোডাক্ট ক্যাটালগ</span>
          </Link>

          {/* ৩. কাস্টমার CRM (উভয় রোল) */}
          <Link
            href="/admin/customers"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
              activePage === 'customers'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>কাস্টমার CRM</span>
          </Link>

          {/* ৪. ইউজার ও স্টাফ (শুধুমাত্র সুপার অ্যাডমিনের জন্য দৃশ্যমান) */}
          {isSuperAdmin && (
            <Link
              href="/admin/users"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                activePage === 'users'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
              <span>ইউজার ও স্টাফ</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-pink-100 text-pink-700 rounded-full font-bold">
                রোলস
              </span>
            </Link>
          )}

          {/* ৫. সাইট সেটিংস (শুধুমাত্র সুপার অ্যাডমিনের জন্য দৃশ্যমান) */}
          {isSuperAdmin && (
            <Link
              href="/admin/settings"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                activePage === 'settings'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-pink-600 hover:bg-pink-50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>সাইট সেটিংস</span>
            </Link>
          )}

          <span className="text-gray-300">|</span>

          {/* স্টোরফ্রন্ট প্রিভিউ */}
          <Link
            href="/collections"
            target="_blank"
            className="text-gray-400 hover:text-gray-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 transition"
          >
            <span>স্টোরফ্রন্ট</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        {/* ডানদিকের অ্যাডমিন প্রোফাইল ব্যাজ ও লগআউট */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2.5 bg-white p-1.5 sm:px-3 rounded-2xl border border-gray-200 shadow-xs text-xs">
            <div className="text-right">
              <div className="font-bold text-gray-900 leading-tight">
                {activeAdmin?.name || activeAdmin?.username || 'অ্যাডমিন'}
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md inline-block ${
                isSuperAdmin ? 'bg-pink-50 text-pink-700 border border-pink-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
              }`}>
                {isSuperAdmin ? 'Super Admin' : 'Order Moderator'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
