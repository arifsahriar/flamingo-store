'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SwipeCard from '@/components/SwipeCard';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useProducts } from '@/context/ProductsContext';
import { ArrowLeft, RefreshCw, ShoppingBag, Sparkles, User, Shield, Heart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function SwipePage() {
  const { products } = useProducts();
  const [deck, setDeck] = useState(products);
  const { addToCart, totalItems, setIsCartOpen } = useCart();
  const { favoritesCount, addToFavorites } = useFavorites();
  const { config } = useSiteConfig();
  const { currentUser, currentAdmin } = useAuth();
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    setDeck(products);
  }, [products]);

  // বামে দিলে কার্ড স্কিপ (Next Card)
  const handleSwipeLeft = (swipedProduct) => {
    setDeck((prev) => prev.filter((item) => item.id !== swipedProduct.id));
  };

  // ডানে দিলে উইশলিস্ট / পছন্দের তালিকায় যুক্ত
  const handleSwipeRight = (swipedProduct) => {
    addToFavorites(swipedProduct);
    setToastMessage(`"${swipedProduct.name}" পছন্দের তালিকায় যুক্ত হয়েছে! ❤️`);
    setTimeout(() => setToastMessage(null), 2500);
    setDeck((prev) => prev.filter((item) => item.id !== swipedProduct.id));
  };

  // সরাসরি কার্টে যুক্ত
  const handleDirectAddToCart = (product) => {
    addToCart(product, 1);
    setToastMessage(`"${product.name}" কার্টে যুক্ত হয়েছে! 🛒`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleReset = () => {
    setDeck(products);
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-between py-5 px-4 transition-colors duration-300 relative overflow-x-hidden"
      style={{ backgroundColor: config.accentBgColor }}
    >
      {/* ফ্লোটিং ফিডব্যাক টোস্ট */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-gray-900/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* টপ ন্যাভবার */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link 
          href="/collections"
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-pink-600 bg-white/80 backdrop-blur px-3 py-2 rounded-xl border border-pink-100 shadow-sm transition active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" /> সাধারণ শপ
        </Link>

        <div className="flex items-center gap-2">
          {config.logoUrl && (
            <img 
              src={config.logoUrl} 
              alt={config.brandName} 
              style={{ height: `${Math.min(config.logoHeight || 34, 34)}px` }}
              className="w-auto object-contain"
            />
          )}
          <h1 
            className="text-base sm:text-lg font-serif font-black tracking-wider uppercase"
            style={{ color: config.primaryColor }}
          >
            {config.brandName}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* ❤️ ফেভারিট আইকন ও কাউন্টার */}
          <Link
            href="/favorites"
            className="relative p-2.5 rounded-xl bg-white border border-pink-100 shadow-xs text-gray-700 hover:text-pink-600 transition"
            title="পছন্দের তালিকা"
          >
            <Heart 
              className={`w-5 h-5 ${favoritesCount > 0 ? 'text-pink-600 fill-pink-50' : 'text-gray-700'}`} 
            />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-xs">
                {favoritesCount}
              </span>
            )}
          </Link>

          {/* 🛒 কার্ট বাটন */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-xl bg-white border border-pink-100 shadow-xs text-gray-700 hover:text-pink-600 transition"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span 
                className="absolute -top-1 -right-1 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-xs"
                style={{ backgroundColor: config.primaryColor }}
              >
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* সোয়াইপ এরিয়া */}
      <div className="w-full flex-1 flex items-center justify-center my-6 mb-28">
        {deck.length > 0 ? (
          <div className="relative w-full max-w-sm">
            <SwipeCard
              key={deck[0].id}
              product={deck[0]}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              onDirectAddToCart={handleDirectAddToCart}
            />
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 max-w-sm text-center shadow-xl border border-pink-100 animate-in fade-in zoom-in-95">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-pink-50"
              style={{ color: config.primaryColor }}
            >
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-serif font-bold text-gray-900">সব ডিজাইন দেখা শেষ!</h3>
            <p className="text-xs text-gray-500 mt-2 leading-relaxed">
              আপনি সব প্রোডাক্ট দেখে ফেলেছেন। আপনার পছন্দের তালিকা ({favoritesCount}টি আইটেম) দেখতে পারেন অথবা চেকআউট করতে পারেন।
            </p>
            <div className="mt-6 space-y-2">
              <Link
                href="/favorites"
                className="w-full py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
              >
                <Heart className="w-4 h-4 fill-current" /> পছন্দের তালিকা দেখুন ({favoritesCount})
              </Link>
              <button
                onClick={handleReset}
                className="w-full py-3 bg-pink-50 text-pink-700 rounded-xl text-xs font-semibold hover:bg-pink-100 transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" /> আবার শুরু থেকে দেখুন
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ফ্লোটিং ফেভারিট শর্টকাট ব্যাজ (যখন ফেভারিট আইটেম থাকবে) */}
      {favoritesCount > 0 && (
        <div className="fixed bottom-6 right-6 z-30">
          <Link
            href="/favorites"
            className="flex items-center gap-2 bg-gray-900/90 hover:bg-black text-white text-xs font-bold px-4 py-3 rounded-full shadow-2xl backdrop-blur-md border border-white/20 active:scale-95 transition"
          >
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />
            <span>পছন্দের তালিকা</span>
            <span className="bg-pink-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black">
              {favoritesCount}
            </span>
          </Link>
        </div>
      )}

      {/* হেল্পার টেক্সট */}
      <div className="text-center pb-2">
        <p className="text-[11px] text-gray-500">
          👉 ডানে টানলে <strong>পছন্দের তালিকায় সেভ ❤️</strong> • 👈 বামে টানলে <strong>পরবর্তী পণ্য</strong> • 👆 উপরে টানলে <strong>বিস্তারিত</strong>
        </p>
      </div>
    </div>
  );
}
