'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, ChevronUp, Sparkles, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { useSiteConfig } from '@/context/SiteConfigContext';
import ProductMediaCarousel from '@/components/ProductMediaCarousel';

export default function SwipeCard({ product, onSwipeLeft, onSwipeRight, onDirectAddToCart }) {
  const [showDetails, setShowDetails] = useState(false);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite, addToFavorites } = useFavorites();
  const { config } = useSiteConfig();

  const favorited = isFavorite(product?.id);
  
  // ড্র্যাগিং মোশন ভ্যালু
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-180, 0, 180], [0.65, 1, 0.65]);

  // ডানে ড্র্যাগ করলে লাভ ব্যাজ অপাসিটি
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  // বামে ড্র্যাগ করলে স্কিপ ব্যাজ অপাসিটি
  const skipOpacity = useTransform(x, [-20, -100], [0, 1]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      onSwipeRight(product); // ডানে টানলে ফেভারিট / পছন্দের তালিকায় যোগ
    } else if (info.offset.x < -100) {
      onSwipeLeft(product); // বামে টানলে স্কিপ
    }
  };

  const handleAddToCartDirect = () => {
    if (onDirectAddToCart) {
      onDirectAddToCart(product);
    } else {
      addToCart(product, 1);
    }
    setShowDetails(false);
  };

  return (
    <div className="relative w-full max-w-sm h-[600px] select-none mx-auto">
      
      {/* ১. মেইন সোয়াইপ কার্ড */}
      <motion.div
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl bg-white border border-pink-100 cursor-grab active:cursor-grabbing flex flex-col justify-between"
      >
        {/* অটোলুপিং মাল্টিমিডিয়া ক্যারোসেল */}
        <div className="absolute inset-0">
          <ProductMediaCarousel
            product={product}
            aspectRatio="h-full"
            autoPlay={true}
            showStoryBars={true}
            showControls={true}
            className="w-full h-full"
          />
        </div>

        {/* ড্র্যাগিং ভিজ্যুয়াল ব্যাজ: পছন্দ হয়েছে! ❤️ (ডানে ড্র্যাগ) */}
        <motion.div
          style={{ opacity: likeOpacity }}
          className="absolute top-12 right-6 z-30 pointer-events-none transform rotate-12 border-4 border-pink-500 bg-pink-500/90 backdrop-blur-md text-white font-black text-sm px-4 py-2 rounded-2xl shadow-xl flex items-center gap-1.5"
        >
          <Heart className="w-5 h-5 fill-current" />
          <span>পছন্দ হয়েছে! ❤️</span>
        </motion.div>

        {/* ড্র্যাগিং ভিজ্যুয়াল ব্যাজ: স্কিপ / পরবর্তী ✖ (বামে ড্র্যাগ) */}
        <motion.div
          style={{ opacity: skipOpacity }}
          className="absolute top-12 left-6 z-30 pointer-events-none transform -rotate-12 border-4 border-rose-500 bg-rose-600/90 backdrop-blur-md text-white font-black text-sm px-4 py-2 rounded-2xl shadow-xl flex items-center gap-1.5"
        >
          <X className="w-5 h-5 stroke-[3]" />
          <span>পরবর্তী পণ্য</span>
        </motion.div>

        {/* ডার্ক গ্রেডিয়েন্ট টেক্সট ব্যাকগ্রাউন্ড */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-10" />

        {/* কার্ডের তথ্য */}
        <div className="absolute bottom-12 left-0 right-0 px-6 text-white pointer-events-none z-10">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="text-white text-[11px] px-2.5 py-0.5 rounded-full font-bold inline-flex items-center gap-1 shadow-sm"
              style={{ backgroundColor: config.primaryColor }}
            >
              <Sparkles className="w-3 h-3" />
              {product.category === 'Clothing' ? 'Artisan Attire' : '৯২৫ স্টার্লিং সিলভার'}
            </span>
            <span className="text-[10px] bg-white/20 backdrop-blur-md text-white px-2 py-0.5 rounded-full font-medium">
              {product.category}
            </span>
          </div>

          <h3 className="text-2xl font-serif font-bold text-white tracking-wide line-clamp-1 drop-shadow-sm">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-extrabold text-pink-300 drop-shadow-sm">
              ৳ {product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-white/60 line-through">
                ৳ {product.originalPrice}
              </span>
            )}
          </div>
        </div>

        {/* উপরে টানার হ্যান্ডেল (Swipe Up / Click) */}
        <div 
          onClick={() => setShowDetails(true)}
          className="absolute bottom-1 left-0 right-0 z-20 flex flex-col items-center justify-center cursor-pointer py-1.5 text-white/90 hover:text-white"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronUp className="w-5 h-5 text-pink-300" />
          </motion.div>
          <span className="text-[10px] tracking-wider uppercase font-semibold">বিস্তারিত দেখতে উপরে টানুন</span>
        </div>
      </motion.div>

      {/* ২. অ্যাকশন বার (কার্ডের নিচে) */}
      <div className="absolute -bottom-24 left-0 right-0 flex justify-center items-center gap-3 z-10 px-2">
        {/* স্কিপ বাটন */}
        <button
          type="button"
          onClick={() => onSwipeLeft(product)}
          title="পরবর্তী পণ্য (স্কিপ)"
          className="flex-1 max-w-[100px] py-3 bg-white rounded-2xl flex flex-col items-center justify-center text-gray-500 shadow-md border border-gray-100 hover:bg-gray-50 hover:text-rose-600 active:scale-95 transition"
        >
          <X className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold">স্কিপ</span>
        </button>

        {/* ❤️ ফেভারিটে রাখুন বাটন */}
        <button
          type="button"
          onClick={() => onSwipeRight(product)}
          title="পছন্দের তালিকায় রাখুন"
          className="flex-[1.4] py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-pink-500/25 active:scale-95 transition"
        >
          <Heart className="w-5 h-5 fill-current" />
          <span className="text-xs font-bold">ফেভারিটে রাখুন</span>
        </button>

        {/* 🛒 সরাসরি কার্টে নিন বাটন */}
        <button
          type="button"
          onClick={() => handleAddToCartDirect()}
          title="সরাসরি কার্টে যোগ করুন"
          className="flex-1 max-w-[110px] py-3 bg-white text-gray-800 rounded-2xl flex flex-col items-center justify-center border border-pink-200 shadow-md hover:bg-pink-50 text-pink-700 active:scale-95 transition"
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold">কার্টে নিন</span>
        </button>
      </div>

      {/* ৩. সোয়াইপ-আপ ডিটেইলস বটম-শীট */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: showDetails ? '0%' : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="absolute inset-0 bg-white rounded-3xl z-40 flex flex-col justify-between p-6 shadow-2xl border border-pink-100"
      >
        <div className="overflow-y-auto pr-1">
          <div 
            onClick={() => setShowDetails(false)}
            className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4 cursor-pointer hover:bg-gray-400 transition"
          />

          <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: config.primaryColor }}>
            {config.brandName} Signature
          </span>
          <h3 className="text-2xl font-serif font-bold text-gray-900 mt-1">{product.name}</h3>
          <p className="text-2xl font-bold mt-1" style={{ color: config.primaryColor }}>৳ {product.price}</p>

          <div className="mt-4 border-t border-b border-pink-50 py-3 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>১০০% খাঁটি যাচাইকৃত প্রিমিয়াম কোয়ালিটি নিশ্চয়তা</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>অ্যালার্জি-মুক্ত ও সংবেদনশীল ত্বকের জন্য শতভাগ নিরাপদ</span>
            </div>
            {product.warrantyText && (
              <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 p-2 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{product.warrantyText}</span>
              </div>
            )}
          </div>

          <div className="mt-4">
            <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">প্রোডাক্ট বিবরণ</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                addToFavorites(product);
                setShowDetails(false);
              }}
              className="py-3 px-3 bg-pink-50 text-pink-700 border border-pink-200 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition"
            >
              <Heart className="w-4 h-4 fill-current text-pink-600" />
              <span>ফেভারিটে রাখুন</span>
            </button>
            <button
              onClick={handleAddToCartDirect}
              className="py-3 px-3 text-white rounded-xl font-bold text-xs shadow-md active:scale-95 transition flex items-center justify-center gap-1.5"
              style={{ backgroundColor: config.primaryColor }}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>কার্টে নিন</span>
            </button>
          </div>

          <button
            onClick={() => setShowDetails(false)}
            className="w-full py-1 text-xs text-gray-500 hover:text-gray-800"
          >
            কার্ডে ফিরে যান
          </button>
        </div>
      </motion.div>

    </div>
  );
}
