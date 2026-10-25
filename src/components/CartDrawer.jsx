'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* ব্যাকড্রপ ওভারলে */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-pink-100">
          
          {/* হেডার */}
          <div className="p-5 border-b border-pink-100 flex items-center justify-between bg-[#FFF9FA]">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-pink-600" />
              <h2 className="text-lg font-serif font-bold text-gray-900">
                আপনার শপিং ব্যাগ ({totalItems})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-pink-100/60 text-gray-500 hover:text-gray-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* আইটেম লিস্ট */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4 text-pink-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="text-gray-600 font-medium">আপনার ব্যাগ খালি!</p>
                <p className="text-xs text-gray-400 mt-1">পছন্দের ৯২৫ সিলভার জুয়েলারি ব্যাগে যুক্ত করুন</p>
                <Link
                  href="/collections"
                  onClick={() => setIsCartOpen(false)}
                  className="inline-block mt-5 px-6 py-2.5 bg-pink-600 text-white rounded-xl text-xs font-semibold hover:bg-pink-700 transition"
                >
                  কালেকশন দেখুন
                </Link>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-3 bg-pink-50/40 rounded-2xl border border-pink-100/60">
                  <img
                    src={item.images?.[0] || item.image}
                    alt={item.name || item.title}
                    className="w-20 h-20 object-cover rounded-xl bg-white border border-pink-100 flex-shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif font-semibold text-sm text-gray-900 line-clamp-1">
                          {item.name || item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition ml-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-pink-600 font-bold mt-1">৳ {item.price}</p>
                    </div>

                    {/* কোয়ান্টিটি বাটন */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-pink-200 rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1 hover:text-pink-600 transition"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-gray-800">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1 hover:text-pink-600 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ফুটার ও চেকআউট বাটন */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-pink-100 bg-[#FFF9FA] space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">সাবটোটাল</span>
                <span className="text-lg font-bold text-gray-900">৳ {subtotal}</span>
              </div>
              <p className="text-[11px] text-gray-500">ডেলিভারি চার্জ চেকআউট পেজে যুক্ত হবে। সারা দেশে ক্যাশ অন ডেলিভারি প্রযোজ্য।</p>
              
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 transition"
              >
                চেকআউট করুন (ক্যাশ অন ডেলিভারি) <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}