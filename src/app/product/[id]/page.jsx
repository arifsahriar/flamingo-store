'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { PRODUCTS } from '@/data/products';
import { ShieldCheck, Truck, RotateCcw, Sparkles, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const { addToCart } = useCart();
  const params = useParams();
  const product = PRODUCTS.find((p) => p.id === params.id) || PRODUCTS[0];
  const [selectedImg, setSelectedImg] = useState(product.images[0]);

  return (
    <div className="min-h-screen bg-[#FFF5F6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-pink-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          
          <div className="space-y-4">
            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-pink-100">
              <img
                src={selectedImg}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                      selectedImg === img ? 'border-pink-600' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 bg-pink-50 text-pink-600 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5" /> ৯২৫ সিলভার হলমার্ক সার্টিফাইড
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
                {product.name}
              </h1>

              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-bold text-pink-600">৳ {product.price}</span>
                {product.originalPrice && (
                  <span className="text-base text-gray-400 line-through">৳ {product.originalPrice}</span>
                )}
              </div>

              <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                {product.description}
              </p>

              <div className="mt-6 border-t border-b border-pink-50 py-4 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>প্রতিটি পিসের সাথে অরিজিনাল ৯২৫ সিলভার সার্টিফিকেট প্রদান করা হয়</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <Truck className="w-4 h-4 text-pink-600 flex-shrink-0" />
                  <span>সারা দেশে ক্যাশ অন ডেলিভারি (পার্সেল চেক করে নেওয়ার সুযোগ)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-gray-700">
                  <RotateCcw className="w-4 h-4 text-pink-600 flex-shrink-0" />
                  <span>৭ দিনের সহজ রিপ্লেসমেন্ট পলিসি</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => addToCart(product, 1)}
                className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-medium shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 transition active:scale-[0.99]"
              >
                <ShoppingBag className="w-5 h-5" /> ব্যাগে যোগ করুন (Add to Cart)
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}