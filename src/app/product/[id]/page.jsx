'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ProductMediaCarousel from '@/components/ProductMediaCarousel';
import { useProducts } from '@/context/ProductsContext';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  ShoppingBag, 
  ArrowLeft,
  Heart,
  Zap,
  AlertCircle
} from 'lucide-react';

function ProductDetailContent() {
  const router = useRouter();
  const { addToCart, setIsCartOpen } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { getProductById } = useProducts();
  const { config } = useSiteConfig();
  const params = useParams();
  const product = getProductById(params?.id);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFF5F6] py-16 px-4 text-center space-y-4">
        <h2 className="text-xl font-serif font-bold text-gray-800">প্রোডাক্টটি খুঁজে পাওয়া যায়নি</h2>
        <Link href="/collections" className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" /> কালেকশনে ফিরে যান
        </Link>
      </div>
    );
  }

  const favorited = isFavorite(product.id);

  const handleDirectBuy = () => {
    addToCart(product, 1);
    router.push('/checkout');
  };

  return (
    <div 
      className="min-h-screen transition-colors duration-300 flex flex-col"
      style={{ backgroundColor: config.accentBgColor }}
    >
      <Header />

      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6 flex-1 w-full">
        
        {/* ব্রেডক্রাম্ব */}
        <div className="flex items-center justify-between pb-2">
          <Link 
            href="/collections" 
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-pink-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> কালেকশনে ফিরে যান
          </Link>
          <span className="text-xs text-gray-400">
            হোম / {product.category || 'Jewelry'} / {product.name}
          </span>
        </div>

        {/* প্রোডাক্ট কার্ড */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-pink-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            {/* অটো-লুপিং মাল্টিমিডিয়া ক্যারোসেল */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-gray-900 border border-pink-100 shadow-sm">
                <ProductMediaCarousel
                  product={product}
                  aspectRatio="h-full"
                  autoPlay={true}
                  showStoryBars={true}
                  showControls={true}
                  className="w-full h-full"
                />

                {/* হার্ট টগল বাটন */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(product)}
                  aria-label={favorited ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় রাখুন'}
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white backdrop-blur-md shadow-lg flex items-center justify-center transition active:scale-90"
                  title={favorited ? 'পছন্দের তালিকায় আছে' : 'পছন্দের তালিকায় রাখুন'}
                >
                  <Heart
                    className={`w-5 h-5 transition ${
                      favorited ? 'text-pink-600 fill-pink-600 scale-110' : 'text-gray-600 hover:text-pink-600'
                    }`}
                  />
                </button>
              </div>

              <div className="text-center">
                <p className="text-[11px] text-gray-400">
                  👆 ছবিতে হোভার বা টাচ করে ধরে রাখলে স্লাইড পজ হবে • ভিডিওতে ক্লিক করে সাউন্ড অন করতে পারেন
                </p>
              </div>
            </div>

            {/* প্রোডাক্ট তথ্য ও অ্যাকশনস */}
            <div className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 bg-pink-50 text-pink-600 text-xs font-bold px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5" />
                    {product.category === 'Clothing' ? 'এক্সক্লুসিভ হস্তশিল্প পরিধেয়' : '৯২৫ সিলভার হলমার্ক সার্টিফাইড'}
                  </span>
                  
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {product.category}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-3">
                  {product.name}
                </h1>

                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-black text-pink-600 font-mono">
                    ৳ {product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-base text-gray-400 line-through font-mono">
                      ৳ {product.originalPrice}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ৳ {product.originalPrice - product.price} ছাড়
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm text-gray-600 leading-relaxed">
                  {product.description || product.shortDescription}
                </p>

                {/* ট্রাস্ট ও পলিসি বেনিফিটস */}
                <div className="mt-6 border-t border-b border-pink-50 py-4 space-y-2.5">
                  {(product.warrantyText || product.warranty_text) && (
                    <div className="flex items-center gap-2.5 text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-semibold">{product.warrantyText || product.warranty_text}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2.5 text-xs text-gray-700">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>{product.purity || '১০০% খাঁটি উপাদানের নিশ্চয়তা ও সার্টিফাইড বিশুদ্ধতা'}</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-700">
                    <Truck className="w-4 h-4 text-pink-600 flex-shrink-0" />
                    <span>সারা দেশে ক্যাশ অন ডেলিভারি (পার্সেল খুলে দেখে নেওয়ার সুযোগ)</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-gray-700">
                    <RotateCcw className="w-4 h-4 text-pink-600 flex-shrink-0" />
                    <span>
                      {(product.returnPolicyType === 'RETURNABLE' || product.return_policy_type === 'RETURNABLE') && (Number(product.returnDays || product.return_days) > 0)
                        ? `${product.returnDays || product.return_days} দিনের সহজ রিটার্ন পলিসি`
                        : 'ডেলিভারি গ্রহণের সময় চেক করে রিসিভ করুন'}
                    </span>
                  </div>
                </div>
              </div>

              {/* অ্যাকশন বাটনস */}
              <div className="mt-8 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(product, 1);
                      setIsCartOpen(true);
                    }}
                    className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-pink-600/25 flex items-center justify-center gap-2 transition active:scale-[0.99]"
                  >
                    <ShoppingBag className="w-5 h-5" /> ব্যাগে যোগ করুন
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectBuy}
                    className="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition active:scale-[0.99]"
                  >
                    <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" /> সরাসরি অর্ডার করুন
                  </button>
                </div>

                {/* উইশলিস্ট টগল বাটন */}
                <button
                  type="button"
                  onClick={() => toggleFavorite(product)}
                  className={`w-full py-3 rounded-2xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                    favorited
                      ? 'bg-pink-50 border-pink-300 text-pink-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-pink-50/50 hover:text-pink-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorited ? 'text-pink-600 fill-pink-600' : ''}`} />
                  <span>{favorited ? '❤️ পছন্দের তালিকায় সংরক্ষিত আছে' : 'পছন্দের তালিকায় রাখুন (Save to Favorites)'}</span>
                </button>

                {/* পলিসি ব্যাজ */}
                <div className="pt-2">
                  {(product.returnPolicyType === 'RETURNABLE' || product.return_policy_type === 'RETURNABLE') && (Number(product.returnDays || product.return_days) > 0) ? (
                    <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900">
                      <RotateCcw className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs block">
                          {product.returnDays || product.return_days} দিনের সহজ রিটার্ন পলিসি
                        </span>
                        <p className="text-[11px] text-blue-700 mt-0.5">
                          পণ্য হাতে পাওয়ার পর পছন্দ না হলে বা কোনো সমস্যা থাকলে সহজ রিটার্ন সুবিধা।
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs block">নো-রিটার্ন পলিসি</span>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          ডেলিভারি ম্যানের সামনে চেক করে রিসিভ করুন।
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF5F6] flex items-center justify-center text-sm text-gray-500">লোড হচ্ছে...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}
