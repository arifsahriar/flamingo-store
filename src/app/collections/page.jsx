'use client';

import React from 'react';
import Link from 'next/link';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductsContext';
import { useAuth } from '@/context/AuthContext';
import { ShoppingBag, Sparkles, ShieldCheck, Heart, Truck, User } from 'lucide-react';

export default function CollectionsPage() {
  const { config } = useSiteConfig();
  const { addToCart, totalItems, setIsCartOpen } = useCart();
  const { products } = useProducts();
  const { currentUser } = useAuth();

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
              href="/swipe"
              className="text-xs font-semibold px-3.5 py-2 rounded-xl border border-pink-200 text-pink-700 bg-pink-50 hover:bg-pink-100 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" /> সোয়াইপ মোড
            </Link>

            {currentUser ? (
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl text-pink-700 bg-pink-50 border border-pink-100 hover:bg-pink-100/70 transition"
                title="আমার অ্যাকাউন্ট"
              >
                <User className="w-3.5 h-3.5 text-pink-600" />
                <span className="hidden sm:inline">{currentUser.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 sm:px-3 py-2 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50/70 transition"
              >
                <User className="w-3.5 h-3.5 text-gray-500" />
                <span>লগইন</span>
              </Link>
            )}

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
          {products.map((product) => (
            <div
              key={product.id}
              className="group bg-white rounded-2xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                <img
                  src={product.images ? product.images[0] : (product.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop')}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-0.5 rounded-md text-gray-700 shadow-xs">
                  925 Silver
                </span>
                {!product.inStock && (
                  <span className="absolute top-2 right-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                    স্টক আউট
                  </span>
                )}
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

                  {product.inStock ? (
                    <button
                      onClick={() => addToCart(product, 1)}
                      className="p-2 rounded-xl text-white shadow-md active:scale-95 transition"
                      style={{ backgroundColor: config.primaryColor }}
                      title="ব্যাগে যোগ করুন"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">
                      স্টক শেষ
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
