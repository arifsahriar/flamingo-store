'use client';

import React from 'react';
import Link from 'next/link';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useAuth } from '@/context/AuthContext';
import { 
  ShoppingBag, 
  Heart, 
  Sparkles, 
  Truck, 
  User, 
  Shield 
} from 'lucide-react';

export default function Header() {
  const { config } = useSiteConfig();
  const { totalItems, setIsCartOpen } = useCart();
  const { favoritesCount } = useFavorites();
  const { currentUser, currentAdmin } = useAuth();

  return (
    <>
      {/* ১. টপ অ্যানাউন্সমেন্ট বার */}
      {config.announcementText && (
        <div 
          className="py-2 px-4 text-center text-xs font-medium text-white transition-colors duration-300 shadow-sm"
          style={{ backgroundColor: config.primaryColor }}
        >
          {config.announcementText}
        </div>
      )}

      {/* ২. হেডার ন্যাভবার */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-pink-100/60 px-4 sm:px-8 py-3.5 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* লোগো ও ব্র্যান্ড নাম */}
          <Link href="/" className="flex items-center gap-3">
            {config.logoUrl && (
              <img 
                src={config.logoUrl} 
                alt={config.brandName} 
                style={{ height: `${config.logoHeight || 40}px` }}
                className="w-auto object-contain"
              />
            )}
            <div>
              <span 
                className="text-xl sm:text-2xl font-serif font-black tracking-wider uppercase block leading-tight" 
                style={{ color: config.primaryColor }}
              >
                {config.brandName}
              </span>
              <span className="text-[9px] sm:text-[10px] text-gray-500 tracking-widest uppercase block">
                {config.tagline}
              </span>
            </div>
          </Link>

          {/* ন্যাভিগেশন লিংক ও অ্যাকশনসমূহ */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            <Link
              href="/track-order"
              className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50/70 transition"
              title="অর্ডার ও লাইভ ট্র্যাক করুন"
            >
              <Truck className="w-3.5 h-3.5 text-pink-600" />
              <span>অর্ডার ট্র্যাক</span>
            </Link>

            <Link
              href="/collections"
              className="hidden sm:inline-block text-xs font-semibold px-3 py-2 text-gray-700 hover:text-pink-600 transition"
            >
              কালেকশন
            </Link>

            {/* সোয়াইপ মোড বাটন */}
            <Link
              href="/swipe"
              className="text-xs font-semibold px-3 sm:px-3.5 py-2 rounded-xl border border-pink-200 text-pink-700 bg-pink-50 hover:bg-pink-100 transition flex items-center gap-1.5 shadow-2xs active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-pink-600" /> 
              <span className="hidden xs:inline">সোয়াইপ</span> মোড
            </Link>

            {/* অ্যাডমিন / অ্যাকাউন্ট */}
            {currentAdmin ? (
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 sm:px-3 py-2 rounded-xl text-pink-700 bg-pink-50 border border-pink-200 hover:bg-pink-100 transition shadow-xs"
                title="অ্যাডমিন প্যানেল"
              >
                <Shield className="w-3.5 h-3.5 text-pink-600" />
                <span className="hidden sm:inline">অ্যাডমিন</span>
              </Link>
            ) : currentUser ? (
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 sm:px-3 py-2 rounded-xl text-pink-700 bg-pink-50 border border-pink-200 hover:bg-pink-100 transition shadow-xs"
                title="আমার অ্যাকাউন্ট"
              >
                <User className="w-3.5 h-3.5 text-pink-600" />
                <span className="hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs font-bold px-2.5 sm:px-3 py-2 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition"
                title="লগইন / একাউন্ট"
              >
                <User className="w-4 h-4 text-pink-600" />
                <span className="hidden sm:inline">লগইন</span>
              </Link>
            )}

            {/* ❤️ উইশলিস্ট / ফেভারিট আইকন বাটন */}
            <Link
              href="/favorites"
              className="relative p-2.5 rounded-xl bg-white border border-pink-100 text-gray-700 hover:text-pink-600 hover:bg-pink-50/50 transition shadow-xs"
              title="পছন্দের তালিকা (Favorites)"
            >
              <Heart 
                className={`w-5 h-5 transition-transform duration-300 ${
                  favoritesCount > 0 ? 'text-pink-600 fill-pink-50' : 'text-gray-700'
                }`} 
              />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-xs animate-in zoom-in-75">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* 🛒 শপিং ব্যাগ / কার্ট বাটন */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-white border border-pink-100 text-gray-700 hover:text-pink-600 hover:bg-pink-50/50 transition shadow-xs"
              title="শপিং ব্যাগ"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span 
                  className="absolute -top-1 -right-1 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-xs animate-in zoom-in-75"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {totalItems}
                </span>
              )}
            </button>

          </div>
        </div>
      </header>
    </>
  );
}
