'use client';

import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useProducts } from '@/context/ProductsContext';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  ArrowRight, 
  Flame,
  RotateCcw
} from 'lucide-react';

export default function HomePage() {
  const { config } = useSiteConfig();
  const { products } = useProducts();

  const featuredProducts = products.slice(0, 6);

  return (
    <div 
      className="min-h-screen text-gray-900 transition-colors duration-300"
      style={{ backgroundColor: config.accentBgColor }}
    >
      {/* হেডার ন্যাভবার ও অ্যানাউন্সমেন্ট */}
      <Header />

      {/* হিরো ব্যানার সেকশন */}
      <section className="py-16 sm:py-24 px-4 text-center max-w-4xl mx-auto">
        <span 
          className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-1.5 rounded-full mb-5 shadow-sm bg-white"
          style={{ color: config.primaryColor }}
        >
          <Sparkles className="w-4 h-4" /> আন্তর্জাতিক ৯২৫ সিলভার ও এক্সক্লুসিভ ফ্যাব্রিক নিশ্চয়তা
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
            <Flame className="w-4 h-4 text-rose-500" /> সোয়াইপ শর্টলিস্ট করুন
          </Link>
        </div>
      </section>

      {/* ট্রাস্ট বার */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-6 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/90 backdrop-blur-sm p-6 rounded-3xl border border-pink-100 shadow-sm text-center">
          <div className="flex flex-col items-center p-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mb-2" />
            <h4 className="font-serif font-bold text-sm text-gray-900">১০০% খাঁটি ৯২৫ সিলভার ও ফাইন ফেব্রিক</h4>
            <p className="text-xs text-gray-500 mt-1">প্রতিটি পণ্যে রয়েছে হলমার্ক স্ট্যাম্প ও প্রিমিয়াম কারিগরি নিশ্চয়তা</p>
          </div>
          <div className="flex flex-col items-center p-3 border-y md:border-y-0 md:border-x border-pink-100">
            <Sparkles className="w-8 h-8 text-pink-600 mb-2" />
            <h4 className="font-serif font-bold text-sm text-gray-900">অ্যান্টি-টার্নিশ ও নিখুঁত ফিনিশিং</h4>
            <p className="text-xs text-gray-500 mt-1">রোডিয়াম কোটিং ও বিশেষ প্রটেকশন যা পণ্যকে দীর্ঘদিন নতুনের মতো রাখে</p>
          </div>
          <div className="flex flex-col items-center p-3">
            <Truck className="w-8 h-8 text-pink-600 mb-2" />
            <h4 className="font-serif font-bold text-sm text-gray-900">ক্যাশ অন ডেলিভারি</h4>
            <p className="text-xs text-gray-500 mt-1">সারা দেশে ডেলিভারির সময় পার্সেল খুলে চেক করে নেওয়ার সুবিধা</p>
          </div>
        </div>
      </section>

      {/* ফিচার্ড প্রোডাক্ট সেকশন */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
              জনপ্রিয় ডিজাইনসমূহ
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              আমাদের সবচেয়ে প্রশংসিত প্রিমিয়াম ৯২৫ সিলভার ও হস্তশিল্প কালেকশন
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
