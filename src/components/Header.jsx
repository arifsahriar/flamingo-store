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
          className="py-1.5 sm:py-2 px-3 sm:px-4 text-center text-[11px] sm:text-xs font-medium text-white transition-colors duration-300 shadow-sm"
          style={{ backgroundColor: config.primaryColor }}
        >
          {config.announcementText}
        </div>
      )}

      {/* ২. হেডার ন্যাভবার */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-pink-100/60 px-2.5 sm:px-6 py-2 sm:py-3 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between w-full">
          
          {/* লোগো ও ব্র্যান্ড নাম */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 min-w-0">
            {config.logoUrl && (
              <img 
                src={config.logoUrl} 
                alt={config.brandName} 
                style={{ height: `${Math.min(config.logoHeight || 34, 34)}px` }}
                className="w-auto h-6 sm:h-8 object-contain flex-shrink-0"
              />
            )}
            <div className="flex-shrink-0">
              <span 
                className="text-base sm:text-xl font-serif font-black tracking-wider uppercase block leading-tight truncate" 
                style={{ color: config.primaryColor }}
              >
                {config.brandName}
              </span>
              <span className="hidden sm:block text-[9px] sm:text-[10px] text-gray-500 tracking-widest uppercase leading-none">
                {config.tagline}
              </span>
            </div>
          </Link>

          {/* ন্যাভিগেশন লিংক ও অ্যাকশনসমূহ */}
          <div className="flex items-center gap-1 sm:gap-2.5 flex-shrink-0">
            
            {/* বড় স্ক্রিনে অর্ডার ট্র্যাক ও কালেকশন লিংক */}
            <Link
              href="/track-order"
              className="hidden lg:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50/70 transition"
              title="অর্ডার ও লাইভ ট্র্যাক করুন"
            >
              <Truck className="w-3.5 h-3.5 text-pink-600" />
              <span>অর্ডার ট্র্যাক</span>
            </Link>

            <Link
              href="/collections"
              className="hidden md:inline-block text-xs font-semibold px-2.5 py-1.5 text-gray-700 hover:text-pink-600 transition"
            >
              কালেকশন
            </Link>

            {/* 🔥 সোয়াইপ মোড বাটন (পূর্ণ টেক্সট সহ অপ্টিমাইজড বাটন) */}
            <Link
              href="/swipe"
              className="text-[11px] sm:text-xs font-medium px-2 py-1 sm:px-3 sm:py-1.5 whitespace-nowrap flex-shrink-0 rounded-full border border-pink-300 bg-pink-50 text-pink-600 hover:bg-pink-100 transition shadow-2xs active:scale-95"
            >
              🔥 সোয়াইপ মোড
            </Link>

            {/* অ্যাডমিন / অ্যাকাউন্ট */}
            {currentAdmin ? (
              <Link
                href="/admin/orders"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-pink-700 bg-pink-50 border border-pink-200 hover:bg-pink-100 transition shadow-2xs flex-shrink-0 flex items-center gap-1"
                title="অ্যাডমিন প্যানেল"
              >
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                <span className="hidden xl:inline text-xs font-bold">অ্যাডমিন</span>
              </Link>
            ) : currentUser ? (
              <Link
                href="/account"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-pink-700 bg-pink-50 border border-pink-200 hover:bg-pink-100 transition shadow-2xs flex-shrink-0 flex items-center gap-1"
                title="আমার অ্যাকাউন্ট"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                <span className="hidden xl:inline text-xs font-bold">{currentUser.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg sm:rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 bg-white border border-pink-100 transition shadow-2xs flex-shrink-0 flex items-center gap-1"
                title="লগইন / একাউন্ট"
              >
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-pink-600" />
                <span className="hidden xl:inline text-xs font-bold">লগইন</span>
              </Link>
            )}

            {/* ❤️ উইশলিস্ট / ফেভারিট আইকন বাটন */}
            <Link
              href="/favorites"
              className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white border border-pink-100 text-gray-700 hover:text-pink-600 hover:bg-pink-50/50 transition shadow-2xs flex-shrink-0 flex items-center justify-center"
              title="পছন্দের তালিকা (Favorites)"
            >
              <Heart 
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${
                  favoritesCount > 0 ? 'text-pink-600 fill-pink-50' : 'text-gray-700'
                }`} 
              />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[9px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold shadow-xs">
                  {favoritesCount}
                </span>
              )}
            </Link>

            {/* 🛒 শপিং ব্যাগ / কার্ট বাটন */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white border border-pink-100 text-gray-700 hover:text-pink-600 hover:bg-pink-50/50 transition shadow-2xs flex-shrink-0 flex items-center justify-center"
              title="শপিং ব্যাগ"
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
              {totalItems > 0 && (
                <span 
                  className="absolute -top-1 -right-1 text-white text-[9px] sm:text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center font-bold shadow-xs"
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
