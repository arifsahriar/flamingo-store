'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SwipeCard from '@/components/SwipeCard';
import { useCart } from '@/context/CartContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useProducts } from '@/context/ProductsContext';
import { ArrowLeft, RefreshCw, ShoppingBag, Sparkles } from 'lucide-react';

export default function SwipePage() {
  const { products } = useProducts();
  const [deck, setDeck] = useState(products);
  const { addToCart, totalItems, setIsCartOpen } = useCart();
  const { config } = useSiteConfig();

  // যখনই প্রোডাক্ট তালিকা আপডেট হবে, ডেকে সিঙ্ক করা
  useEffect(() => {
    setDeck(products);
  }, [products]);

  const handleSwipeLeft = (swipedProduct) => {
    // বামে দিলে কার্ড স্কিপ (Next Card)
    setDeck((prev) => prev.filter((item) => item.id !== swipedProduct.id));
  };

  const handleSwipeRight = (swipedProduct) => {
    // ডানে দিলে সরাসরি কার্টে যুক্ত হবে
    addToCart(swipedProduct, 1);
    setDeck((prev) => prev.filter((item) => item.id !== swipedProduct.id));
  };

  const handleReset = () => {
    setDeck(products);
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-between py-6 px-4 transition-colors duration-300"
      style={{ backgroundColor: config.accentBgColor }}
    >
      {/* টপ ন্যাভবার */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link 
          href="/collections"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-pink-600 bg-white/80 backdrop-blur px-3.5 py-2 rounded-xl border border-pink-100 shadow-sm transition"
        >
          <ArrowLeft className="w-4 h-4" /> সাধারণ শপ
        </Link>

        <div className="flex items-center gap-2">
          {config.logoUrl && (
            <img 
              src={config.logoUrl} 
              alt={config.brandName} 
              style={{ height: `${Math.min(config.logoHeight || 36, 36)}px` }}
              className="w-auto object-contain"
            />
          )}
          <h1 
            className="text-lg font-serif font-black tracking-wider uppercase"
            style={{ color: config.primaryColor }}
          >
            {config.brandName}
          </h1>
        </div>

        <button
          onClick={() => setIsCartOpen(true)}
          className="relative p-2.5 rounded-xl bg-white border border-pink-100 shadow-sm text-gray-700 hover:text-pink-600 transition"
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

      {/* সোয়াইপ এরিয়া */}
      <div className="w-full flex-1 flex items-center justify-center my-6">
        {deck.length > 0 ? (
          <div className="relative w-full max-w-sm">
            <SwipeCard
              key={deck[0].id}
              product={deck[0]}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-xl border border-pink-100">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-pink-50"
              style={{ color: config.primaryColor }}
            >
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900">সব ডিজাইন দেখা শেষ!</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              আপনি সব জুয়েলারি দেখে ফেলেছেন। ব্যাগে রাখা প্রোডাক্টগুলোর অর্ডার কনফার্ম করতে চেকআউট পেজে যেতে পারেন।
            </p>
            <div className="mt-6 space-y-2">
              <button
                onClick={handleReset}
                className="w-full py-3.5 text-white rounded-xl text-xs font-semibold shadow-md transition flex items-center justify-center gap-1.5"
                style={{ backgroundColor: config.primaryColor }}
              >
                <RefreshCw className="w-4 h-4" /> আবার শুরু থেকে দেখুন
              </button>
              <Link
                href="/checkout"
                className="block w-full py-3 bg-pink-50 text-pink-700 rounded-xl text-xs font-semibold hover:bg-pink-100 transition"
              >
                চেকআউট পেজে যান
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* হেল্পার টেক্সট */}
      <div className="text-center pb-2">
        <p className="text-[11px] text-gray-500">
          👉 ডানে টানলে <strong>পছন্দ/ব্যাগে যোগ</strong> • 👈 বামে টানলে <strong>স্কিপ</strong> • 👆 উপরে টানলে <strong>বিস্তারিত</strong>
        </p>
      </div>
    </div>
  );
}
