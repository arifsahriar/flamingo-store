'use client';

import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Heart, X, ChevronUp, Sparkles, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSiteConfig } from '@/context/SiteConfigContext';

export default function SwipeCard({ product, onSwipeLeft, onSwipeRight }) {
  const [showDetails, setShowDetails] = useState(false);
  const { addToCart } = useCart();
  const { config } = useSiteConfig();
  
  // ড্র্যাগিং মোশন ভ্যালু
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-150, 0, 150], [0.6, 1, 0.6]);

  const handleDragEnd = (event, info) => {
    if (info.offset.x > 100) {
      onSwipeRight(product); // ডানে টানলে ব্যাগে যোগ
    } else if (info.offset.x < -100) {
      onSwipeLeft(product); // বামে টানলে স্কিপ
    }
  };

  const handleAddToCartDirect = () => {
    addToCart(product, 1);
    setShowDetails(false);
  };

  return (
    <div className="relative w-full max-w-sm h-[580px] select-none mx-auto">
      {/* ১. মেইন সোয়াইপ কার্ড */}
      <motion.div
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl bg-white border border-pink-100 cursor-grab active:cursor-grabbing"
      >
        <img
          src={product.images ? product.images[0] : product.image}
          alt={product.name}
          className="w-full h-full object-cover pointer-events-none"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

        {/* কার্ডের টেক্সট */}
        <div className="absolute bottom-12 left-0 right-0 px-6 text-white pointer-events-none">
          <span 
            className="text-white text-[11px] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-1 shadow-sm mb-2"
            style={{ backgroundColor: config.primaryColor }}
          >
            <Sparkles className="w-3 h-3" /> ৯২৫ স্টার্লিং সিলভার
          </span>
          <h3 className="text-2xl font-serif font-bold text-white tracking-wide">
            {product.name}
          </h3>
          <p className="text-xl font-bold text-pink-300 mt-1">৳ {product.price}</p>
        </div>

        {/* উপরে টানার হ্যান্ডেল (Swipe Up / Click) */}
        <div 
          onClick={() => setShowDetails(true)}
          className="absolute bottom-2 left-0 right-0 flex flex-col items-center justify-center cursor-pointer py-1 text-white/80 hover:text-white"
        >
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ChevronUp className="w-5 h-5 text-pink-300" />
          </motion.div>
          <span className="text-[11px] tracking-wider uppercase font-medium">বিস্তারিত দেখতে উপরে টানুন</span>
        </div>
      </motion.div>

      {/* ২. অ্যাকশন বাটনসমূহ (বামে/ডানে ক্লিক) */}
      <div className="absolute -bottom-20 left-0 right-0 flex justify-center items-center gap-6">
        <button
          onClick={() => onSwipeLeft(product)}
          title="স্কিপ করুন"
          className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-gray-500 shadow-lg border border-pink-100 hover:bg-gray-50 hover:text-red-500 active:scale-95 transition"
        >
          <X className="w-6 h-6" />
        </button>
        <button
          onClick={() => onSwipeRight(product)}
          title="ব্যাগে যোগ করুন"
          className="w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition"
          style={{ backgroundColor: config.primaryColor }}
        >
          <Heart className="w-7 h-7 fill-current" />
        </button>
      </div>

      {/* ৩. সোয়াইপ-আপ ডিটেইলস বটম-শীট */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: showDetails ? '0%' : '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="absolute inset-0 bg-white rounded-3xl z-20 flex flex-col justify-between p-6 shadow-2xl border border-pink-100"
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
              <span>১০০% খাঁটি ৯২৫ সিলভার হলমার্ক নিশ্চয়তা</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>রোডিয়াম ফিনিশ (কালো হবে না ও অ্যান্টি-টার্নিশ)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-700">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>অ্যালার্জি-মুক্ত ও সংবেদনশীল ত্বকের জন্য নিরাপদ</span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-1">প্রোডাক্ট বিবরণ</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>

        <div className="space-y-2 pt-3 border-t border-gray-100">
          <button
            onClick={handleAddToCartDirect}
            className="w-full py-3.5 text-white rounded-xl font-medium shadow-md active:scale-[0.98] transition text-sm"
            style={{ backgroundColor: config.primaryColor }}
          >
            ব্যাগে যোগ করুন (Add to Cart)
          </button>
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