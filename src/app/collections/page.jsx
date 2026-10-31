'use client';

import React from 'react';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useProducts } from '@/context/ProductsContext';
import { ShieldCheck } from 'lucide-react';

export default function CollectionsPage() {
  const { config } = useSiteConfig();
  const { products } = useProducts();

  return (
    <div 
      className="min-h-screen text-gray-900 transition-colors duration-300 flex flex-col"
      style={{ backgroundColor: config.accentBgColor }}
    >
      {/* হেডার ন্যাভবার */}
      <Header />

      {/* ব্যানার সেকশন */}
      <section className="py-12 px-4 text-center max-w-3xl mx-auto">
        <span 
          className="inline-flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-3 shadow-xs bg-white text-pink-600 border border-pink-100"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> আন্তর্জাতিক ৯২৫ হলমার্ক ও প্রিমিয়াম ফ্যাব্রিক
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight text-gray-900 leading-tight">
          {config.heroHeadline}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
          {config.heroSubheadline}
        </p>
      </section>

      {/* প্রোডাক্ট গ্রিড */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 flex-1 w-full">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
    </div>
  );
}
