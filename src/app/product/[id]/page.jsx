'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useProducts } from '@/context/ProductsContext';
import { useCart } from '@/context/CartContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useAuth } from '@/context/AuthContext';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  ShoppingBag, 
  ArrowLeft,
  User,
  Shield,
  AlertCircle
} from 'lucide-react';

function ProductDetailContent() {
  const { addToCart, setIsCartOpen, totalItems } = useCart();
  const { getProductById } = useProducts();
  const { config } = useSiteConfig();
  const { currentUser, currentAdmin } = useAuth();
  const params = useParams();
  const product = getProductById(params?.id);
  const [selectedImg, setSelectedImg] = useState(product?.images?.[0] || product?.image);

  useEffect(() => {
    if (product) {
      setSelectedImg(product.images?.[0] || product.image);
    }
  }, [product]);

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

  return (
    <div className="min-h-screen bg-[#FFF5F6] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* টপ ন্যাভবার */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-pink-100 gap-3">
          <Link 
            href="/collections" 
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-pink-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> কালেকশনে ফিরে যান
          </Link>

          <Link href="/" className="flex items-center gap-2">
            {config.logoUrl && (
              <img 
                src={config.logoUrl} 
                alt={config.brandName} 
                style={{ height: `${Math.min(config.logoHeight || 36, 36)}px` }}
                className="w-auto object-contain"
              />
            )}
            <span 
              className="text-base sm:text-lg font-serif font-black tracking-wider uppercase" 
              style={{ color: config.primaryColor || '#DB2777' }}
            >
              {config.brandName || 'FLAMINGO'}
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/track-order"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl text-gray-700 hover:text-pink-600 hover:bg-pink-50 transition"
            >
              <Truck className="w-3.5 h-3.5 text-pink-600" />
              <span>ট্র্যাক</span>
            </Link>

            {currentAdmin ? (
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-pink-700 bg-pink-50 border border-pink-200 hover:bg-pink-100 transition shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-pink-600" />
                <span>অ্যাডমিন</span>
              </Link>
            ) : currentUser ? (
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-pink-700 bg-pink-50 border border-pink-200 hover:bg-pink-100 transition shadow-xs"
              >
                <User className="w-3.5 h-3.5 text-pink-600" />
                <span>{currentUser.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-pink-700 bg-pink-50 border border-pink-200 hover:bg-pink-100 shadow-xs transition"
              >
                <User className="w-3.5 h-3.5 text-pink-600" />
                <span>লগইন / একাউন্ট</span>
              </Link>
            )}

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl bg-white border border-pink-100 shadow-xs text-gray-700 hover:text-pink-600 transition"
              title="শপিং ব্যাগ"
            >
              <ShoppingBag className="w-4 h-4" />
              {totalItems > 0 && (
                <span 
                  className="absolute -top-1 -right-1 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                  style={{ backgroundColor: config.primaryColor || '#DB2777' }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* প্রোডাক্ট কার্ড */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-pink-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            
            <div className="space-y-4">
              <div className="aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-pink-100">
                <img
                  src={selectedImg}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {product.images && product.images.length > 1 && (
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
                  {(product.warrantyText || product.warranty_text) && (
                    <div className="flex items-center gap-2.5 text-xs text-emerald-800 bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-semibold">{product.warrantyText || product.warranty_text}</span>
                    </div>
                  )}
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
                    <span>
                      {(product.returnPolicyType === 'RETURNABLE' || product.return_policy_type === 'RETURNABLE') && (Number(product.returnDays || product.return_days) > 0)
                        ? `${product.returnDays || product.return_days} দিনের সহজ রিটার্ন পলিসি`
                        : 'ডেলিভারি গ্রহণের সময় চেক করে রিসিভ করুন'}
                    </span>
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

                {/* ডাইনামিক রিটার্ন পলিসি ও ট্রাস্ট ব্যাজ */}
                <div className="mt-4 space-y-2">
                  {(product.returnPolicyType === 'RETURNABLE' || product.return_policy_type === 'RETURNABLE') && (Number(product.returnDays || product.return_days) > 0) ? (
                    <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-start gap-2.5 text-xs text-blue-900 shadow-2xs">
                      <RotateCcw className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs block">
                          {product.returnDays || product.return_days} দিনের রিটার্ন পলিসি
                        </span>
                        <p className="text-[11px] text-blue-700 mt-0.5">
                          {product.returnDays || product.return_days} দিনের রিটার্ন পলিসি (পণ্য রিটার্ন কুরিয়ার চার্জ গ্রাহককে বহন করতে হবে)।
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950 shadow-2xs">
                      <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs block">নো-রিটার্ন পলিসি</span>
                        <p className="text-[11px] text-amber-800 mt-0.5">
                          চেক করে রিসিভ করুন, পরবর্তীতে কোনো রিটার্ন প্রযোজ্য নয়।
                        </p>
                      </div>
                    </div>
                  )}

                  {(product.warrantyText || product.warranty_text) && (
                    <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900 shadow-2xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <div>
                        <span className="font-bold">ওয়ারেন্টি সুবিধা: </span>
                        <span className="text-emerald-800">{product.warrantyText || product.warranty_text}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
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
