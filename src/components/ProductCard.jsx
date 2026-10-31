'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import ProductMediaCarousel from '@/components/ProductMediaCarousel';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { config } = useSiteConfig();

  const favorited = isFavorite(product?.id);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(product);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-pink-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
      
      {/* মিডিয়া থাম্বনেইল ক্যারোসেল এরিয়া */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        <Link href={`/product/${product.id}`} className="block w-full h-full">
          <ProductMediaCarousel
            product={product}
            aspectRatio="aspect-square"
            autoPlay={true}
            showStoryBars={true}
            showControls={false}
          />
        </Link>

        {/* টপ লেফট ব্যাজ */}
        <div className="absolute top-2.5 left-2.5 pointer-events-none z-10 flex flex-col gap-1">
          <span className="bg-white/90 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded-lg text-gray-800 shadow-xs flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-pink-600" />
            {product.category === 'Clothing' ? 'Artisan Weave' : '925 Silver'}
          </span>
          {!product.inStock && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              স্টক শেষ
            </span>
          )}
        </div>

        {/* ❤️ ইন্টারঅ্যাক্টিভ হার্ট টগল বাটন (Top Right) */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          aria-label={favorited ? 'পছন্দের তালিকা থেকে সরান' : 'পছন্দের তালিকায় রাখুন'}
          className="absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center transition active:scale-80 hover:bg-white"
        >
          <Heart
            className={`w-4 h-4 transition-all duration-200 ${
              favorited
                ? 'text-pink-600 fill-pink-600 scale-110 drop-shadow-xs'
                : 'text-gray-500 hover:text-pink-600'
            }`}
          />
        </button>
      </div>

      {/* প্রোডাক্ট ইনফো */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-medium tracking-wider text-pink-600 uppercase">
              {product.category || 'Jewelry'}
            </span>
            {product.hasWarranty && (
              <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                ওয়ারেন্টি
              </span>
            )}
          </div>

          <Link href={`/product/${product.id}`} className="block mt-1">
            <h3 className="font-serif font-semibold text-sm sm:text-base text-gray-900 group-hover:text-pink-600 line-clamp-1 transition">
              {product.name}
            </h3>
          </Link>
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 leading-relaxed">
            {product.shortDescription}
          </p>
        </div>

        {/* মূল্য ও কার্ট অ্যাকশন */}
        <div className="mt-4 pt-3 border-t border-pink-50 flex items-center justify-between">
          <div>
            <span className="text-sm sm:text-base font-bold" style={{ color: config.primaryColor }}>
              ৳ {product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through ml-1.5">
                ৳ {product.originalPrice}
              </span>
            )}
          </div>

          {product.inStock ? (
            <button
              onClick={handleAddToCart}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-white shadow-md active:scale-95 transition flex items-center gap-1.5 text-xs font-semibold"
              style={{ backgroundColor: config.primaryColor }}
              title="ব্যাগে যোগ করুন"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">ব্যাগে নিন</span>
            </button>
          ) : (
            <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">
              স্টক শেষ
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
