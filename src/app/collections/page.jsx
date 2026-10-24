'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { PRODUCTS } from '@/data/products';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function CollectionsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Necklace', 'Ring', 'Bracelet'];

  const filteredProducts = selectedCategory === 'All'
    ? PRODUCTS
    : PRODUCTS.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[#FFF5F6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-widest text-pink-600 font-semibold">
            এক্সক্লুসিভ কালেকশন
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mt-2">
            ৯২৫ স্টার্লিং সিলভার জুয়েলারি
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            প্রতিটি গহনায় রয়েছে আন্তর্জাতিক সিলভার হলমার্ক নিশ্চয়তা ও অ্যান্টি-টার্নিশ ফিনিশিং
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-10 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/20'
                  : 'bg-white text-gray-600 hover:bg-pink-50 border border-pink-100'
              }`}
            >
              {cat === 'All' ? 'সব কালেকশন' : cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-pink-100 flex flex-col group"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-50">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-pink-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3 h-3" /> ৯২৫ সিলভার
                </span>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-lg text-gray-900 group-hover:text-pink-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {product.shortDescription}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-pink-50 flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-gray-900">৳ {product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through ml-2">
                        ৳ {product.originalPrice}
                      </span>
                    )}
                  </div>

                  <Link
                    href={`/product/${product.id}`}
                    className="inline-flex items-center gap-1 bg-pink-50 hover:bg-pink-600 text-pink-600 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                  >
                    বিস্তারিত <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}