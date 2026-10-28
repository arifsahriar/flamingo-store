'use client';

import React from 'react';
import Link from 'next/link';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductsContext';
import { 
  Sparkles, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  Flame 
} from 'lucide-react';

export default function HomePage() {
  const { config } = useSiteConfig();
  const { addToCart, totalItems, setIsCartOpen } = useCart();
  const { products } = useProducts();

  const featuredProducts = products.slice(0, 4);

  return (
    <div 
      className="min-h-screen text-gray-900 transition-colors duration-300"
      style={{ backgroundColor: config.accentBgColor }}
    >
      {/* ১. টপ অ্যানাউন্সমেন্ট বার */}
      <div 
        className="py-2.5 px-4 text-center text-xs font-medium text-white transition-colors duration-300 shadow-sm"
        style={{ backgroundColor: config.primaryColor }}
      >
        {config.announcementText}
      </div>

      {/* ২. হেডার ন্যাভবার (ডায়নামিক লোগো ও সাইজসহ) */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-pink-100/60 px-4 sm:px-8 py-4 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {config.logoUrl && (
              <img 
                src={config.logoUrl} 
                alt={config.brandName} 
                style={{ height: `${config.logoHeight || 44}px` }}
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

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/track-order"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50/70 transition"
              title="অর্ডার ও লাইভ ওয়ারেন্টি ট্র্যাক করুন"
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

            <Link
              href="/swipe"
              className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-pink-200 text-pink-700 bg-pink-50 hover:bg-pink-100 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> সোয়াইপ মোড
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-white border border-pink-100 text-gray-700 hover:text-pink-600 transition shadow-sm"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span 
                  className="absolute -top-1 -right-1 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ৩. হিরো ব্যানার সেকশন */}
      <section className="py-16 sm:py-24 px-4 text-center max-w-4xl mx-auto">
        <span 
          className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full mb-5 shadow-sm bg-white"
          style={{ color: config.primaryColor }}
        >
          <Sparkles className="w-4 h-4" /> আন্তর্জাতিক ৯২৫ সিলভার হলমার্ক নিশ্চয়তা
        </span>
        <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-gray-900 leading-tight">
          {config.heroHeadline}
        </h1>
        <p className="mt-4 text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          {config.heroSubheadline}
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/collections"
            className="px-8 py-3.5 text-white rounded-2xl font-bold text-sm shadow-lg shadow-pink-600/25 flex items-center gap-2 transition active:scale-95"
            style={{ backgroundColor: config.primaryColor }}
          >
            কালেকশন দেখুন <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/swipe"
            className="px-8 py-3.5 bg-white text-gray-800 border border-pink-200 rounded-2xl font-bold text-sm shadow-sm hover:bg-pink-50 transition active:scale-95 flex items-center gap-2"
          >
            <Flame className="w-4 h-4 text-rose-500" /> সোয়াইপ মোডে যান
          </Link>
        </div>
      </section>

      {/* ৪. ট্রাস্ট বার */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-pink-100 shadow-sm text-center">
          <div className="flex flex-col items-center p-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mb-2" />
            <h4 className="font-serif font-bold text-sm text-gray-900">১০০% খাঁটি ৯২৫ সিলভার</h4>
            <p className="text-xs text-gray-500 mt-1">প্রতিটি গহনায় রয়েছে হলমার্ক স্ট্যাম্প ও সার্টিফাইড বিশুদ্ধতা</p>
          </div>
          <div className="flex flex-col items-center p-3 border-y md:border-y-0 md:border-x border-pink-100">
            <Sparkles className="w-8 h-8 text-pink-600 mb-2" />
            <h4 className="font-serif font-bold text-sm text-gray-900">রোডিয়াম ও অ্যান্টি-টার্নিশ</h4>
            <p className="text-xs text-gray-500 mt-1">প্রিমিয়াম কোটিং যা সিলভারকে দীর্ঘদিন উজ্জ্বল ও কালো হওয়া থেকে রক্ষা করে</p>
          </div>
          <div className="flex flex-col items-center p-3">
            <Truck className="w-8 h-8 text-pink-600 mb-2" />
            <h4 className="font-serif font-bold text-sm text-gray-900">ক্যাশ অন ডেলিভারি</h4>
            <p className="text-xs text-gray-500 mt-1">সারা দেশে ডেলিভারির সময় পার্সেল খুলে চেক করে নেওয়ার সুবিধা</p>
          </div>
        </div>
      </section>

      {/* ৫. ফিচার্ড প্রোডাক্ট সেকশন */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
              জনপ্রিয় ডিজাইনসমূহ
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              আমাদের সবচেয়ে প্রশংসিত প্রিমিয়াম ৯২৫ সিলভার কালেকশন
            </p>
          </div>
          <Link
            href="/collections"
            className="text-xs sm:text-sm font-semibold flex items-center gap-1 hover:underline"
            style={{ color: config.primaryColor }}
          >
            সব দেখুন <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product: any) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                <img
                  src={product.images ? product.images[0] : product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-md text-gray-700 shadow-xs">
                  925 Silver
                </span>
              </Link>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/product/${product.id}`}>
                    <h3 className="font-serif font-semibold text-sm sm:text-base text-gray-900 group-hover:text-pink-600 line-clamp-1 transition">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{product.shortDescription}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-pink-50 flex items-center justify-between">
                  <div>
                    <span className="text-sm sm:text-base font-bold" style={{ color: config.primaryColor }}>
                      ৳ {product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through ml-1.5">
                        ৳ {product.originalPrice}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(product, 1)}
                    className="p-2 rounded-xl text-white shadow-md active:scale-95 transition"
                    style={{ backgroundColor: config.primaryColor }}
                    title="ব্যাগে যোগ করুন"
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
