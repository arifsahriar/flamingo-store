'use client';

import React from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/data/products';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Sparkles, ShieldCheck, Heart } from 'lucide-react';

export default function CollectionsPage() {
  const { config } = useSiteConfig();
  const { addToCart, totalItems, setIsCartOpen } = useCart();

  return (
    <div 
      className="min-h-screen text-gray-900 transition-colors duration-300"
      style={{ backgroundColor: config.accentBgColor }}
    >
      {/* ১. টপ অ্যানাউন্সমেন্ট বার */}
      <div 
        className="py-2 px-4 text-center text-xs font-medium text-white transition-colors duration-300 shadow-sm"
        style={{ backgroundColor: config.primaryColor }}
      >
        {config.announcementText}
      </div>

      {/* ২. হেডার ন্যাভবার */}
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
          <div className="flex items-center gap-3">
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

      {/* ৩. ব্যানার সেকশন */}
      <section className="py-12 px-4 text-center max-w-3xl mx-auto">
        <span 
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full mb-3 shadow-sm bg-white"
          style={{ color: config.primaryColor }}
        >
          <ShieldCheck className="w-4 h-4" /> আন্তর্জাতিক ৯২৫ হলমার্ক
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-gray-900 leading-tight">
          {config.heroHeadline}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
          {config.heroSubheadline}
        </p>
      </section>

      {/* ৪. প্রোডাক্ট গ্রিড */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {PRODUCTS.map((product) => (
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
      </main>
    </div>
  );
}