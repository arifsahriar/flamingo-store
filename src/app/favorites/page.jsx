'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProductMediaCarousel from '@/components/ProductMediaCarousel';
import { useFavorites } from '@/context/FavoritesContext';
import { useCart } from '@/context/CartContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { 
  Heart, 
  Trash2, 
  ShoppingBag, 
  Zap, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  RotateCcw,
  Package
} from 'lucide-react';

export default function FavoritesPage() {
  const router = useRouter();
  const { favorites, favoritesCount, removeFromFavorites, clearFavorites } = useFavorites();
  const { addToCart, setIsCartOpen } = useCart();
  const { config } = useSiteConfig();

  // Move single item to Cart
  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    setIsCartOpen(true);
  };

  // Direct Checkout for ready buyers
  const handleDirectCheckout = (product) => {
    addToCart(product, 1);
    router.push('/checkout');
  };

  // Move All to Cart
  const handleMoveAllToCart = () => {
    favorites.forEach((product) => {
      addToCart(product, 1);
    });
    setIsCartOpen(true);
  };

  return (
    <div 
      className="min-h-screen text-gray-900 transition-colors duration-300 flex flex-col"
      style={{ backgroundColor: config.accentBgColor }}
    >
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full">
        
        {/* হেডার ও ব্রেডক্রাম্ব */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-pink-100 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link 
                href="/collections" 
                className="text-xs font-semibold text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> শপে ফিরে যান
              </Link>
              <span className="text-gray-300">•</span>
              <Link 
                href="/swipe" 
                className="text-xs font-semibold text-pink-600 hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> সোয়াইপ মোড
              </Link>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-serif font-black text-gray-900 tracking-tight flex items-center gap-3">
              <span>পছন্দের তালিকা</span>
              <span className="text-sm sm:text-base font-sans font-bold bg-pink-100/70 text-pink-700 px-3 py-1 rounded-full border border-pink-200">
                {favoritesCount} টি আইটেম
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              লার্জ-কার্ড ভিউ — ফেব্রিক, এমব্রয়ডারি ও সূক্ষ্ম কারুকাজ পরিষ্কারভাবে দেখে নিন
            </p>
          </div>

          {/* বালক অ্যাকশনস */}
          {favoritesCount > 0 && (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleMoveAllToCart}
                className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/20 active:scale-95 transition flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> সবগুলো ব্যাগে নিন
              </button>
              <button
                type="button"
                onClick={clearFavorites}
                className="px-3.5 py-2.5 bg-white border border-gray-200 hover:border-rose-200 text-gray-500 hover:text-rose-600 rounded-xl text-xs font-semibold transition active:scale-95 flex items-center gap-1.5"
                title="তালিকা খালি করুন"
              >
                <Trash2 className="w-3.5 h-3.5" /> খালি করুন
              </button>
            </div>
          )}
        </div>

        {/* এম্পটি স্টেট */}
        {favoritesCount === 0 ? (
          <div className="py-20 text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-pink-100/60 border border-pink-200 flex items-center justify-center mx-auto mb-5 text-pink-500 shadow-inner">
              <Heart className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-gray-900">
              আপনার পছন্দের তালিকা খালি!
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
              আপনি এখনও কোনো পণ্য পছন্দের তালিকায় রাখেননি। সোয়াইপ মোডে ডানদিকে টেনে অথবা শপ থেকে হার্ট আইকনে ক্লিক করে সহজেই পছন্দের তালিকা তৈরি করুন।
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/swipe"
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <Sparkles className="w-4 h-4" /> সোয়াইপ মোড শুরু করুন
              </Link>
              <Link
                href="/collections"
                className="w-full sm:w-auto px-6 py-3.5 bg-white border border-pink-200 text-gray-800 rounded-2xl text-xs font-bold hover:bg-pink-50 flex items-center justify-center gap-2 active:scale-95 transition"
              >
                কালেকশন দেখুন
              </Link>
            </div>
          </div>
        ) : (
          /* লার্জ কার্ড শোকেস গ্রিড: ১ কলাম মোবাইল, ২ বিশাল কলাম ডেস্কটপ */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 mt-8">
            {favorites.map((product) => (
              <div
                key={product.id}
                className="group bg-white rounded-3xl overflow-hidden border border-pink-100/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                {/* ১. হাই-ইমপ্যাক্ট লার্জ মাল্টিমিডিয়া ক্যারোসেল */}
                <div className="relative aspect-[4/3] sm:aspect-[16/10] bg-gray-900 overflow-hidden">
                  <ProductMediaCarousel
                    product={product}
                    aspectRatio="h-full"
                    autoPlay={true}
                    showStoryBars={true}
                    showControls={true}
                    className="w-full h-full"
                  />

                  {/* ব্যাজসমূহ */}
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 pointer-events-none">
                    <span className="bg-white/95 backdrop-blur-md text-[11px] font-bold px-3 py-1 rounded-xl text-gray-900 shadow-md flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                      {product.category === 'Clothing' ? 'Artisan Attire' : '৯২৫ সিলভার'}
                    </span>
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-xl">
                      {product.category}
                    </span>
                  </div>

                  {/* রিমুভ বাটন (Top Right) */}
                  <button
                    type="button"
                    onClick={() => removeFromFavorites(product.id)}
                    aria-label="মুছে ফেলুন"
                    className="absolute top-3 right-3 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white backdrop-blur-md text-gray-400 hover:text-rose-600 shadow-md flex items-center justify-center active:scale-90 transition"
                    title="পছন্দের তালিকা থেকে মুছুন"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* ২. বড় প্রোডাক্ট ডিটেইলস এরিয়া */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <Link href={`/product/${product.id}`}>
                        <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 hover:text-pink-600 transition">
                          {product.name}
                        </h2>
                      </Link>
                      
                      {/* প্রাইস ট্যাগ */}
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-pink-600 font-mono">
                          ৳ {product.price}
                        </span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-400 line-through font-mono">
                            ৳ {product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 mt-2.5 leading-relaxed">
                      {product.shortDescription || product.description}
                    </p>

                    {/* স্পেকস ও ট্রাস্ট ব্যাজ */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-pink-50">
                      <div className="p-2.5 rounded-xl bg-pink-50/50 border border-pink-100/60 text-[11px] text-gray-700 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="truncate">{product.purity || '১০০% খাঁটি পণ্য'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-pink-50/50 border border-pink-100/60 text-[11px] text-gray-700 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-pink-600 flex-shrink-0" />
                        <span className="truncate">{product.coating || 'অ্যান্টি-টার্নিশ ফিনিশ'}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1 p-2.5 rounded-xl bg-pink-50/50 border border-pink-100/60 text-[11px] text-gray-700 flex items-center gap-2">
                        <RotateCcw className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="truncate">
                          {product.returnPolicyType === 'RETURNABLE' 
                            ? `${product.returnDays || 7} দিনের রিটার্ন`
                            : 'চেক করে গ্রহণ'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ৩. অ্যাকশন কন্ট্রোলস */}
                  <div className="mt-6 pt-5 border-t border-gray-100 flex flex-wrap items-center gap-3">
                    
                    {/* Primary CTA: কার্টে যোগ করুন (Move to Cart) */}
                    <button
                      type="button"
                      onClick={() => handleMoveToCart(product)}
                      className="flex-1 py-3.5 px-5 bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-lg shadow-pink-600/20 active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>🛒 কার্টে যোগ করুন</span>
                    </button>

                    {/* Quick Direct Checkout: সরাসরি কিনুন */}
                    <button
                      type="button"
                      onClick={() => handleDirectCheckout(product)}
                      className="py-3.5 px-5 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                    >
                      <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span>⚡ সরাসরি কিনুন</span>
                    </button>

                    {/* Secondary CTA: তালিকা থেকে মুছুন (Remove) */}
                    <button
                      type="button"
                      onClick={() => removeFromFavorites(product.id)}
                      className="p-3.5 bg-gray-50 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-2xl border border-gray-200 hover:border-rose-200 transition active:scale-95"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
