'use client';

import React, { useState, useRef } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  Camera, 
  ShoppingBag, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSiteConfig } from '@/context/SiteConfigContext';

export default function VirtualTryOnModal({
  isOpen,
  onClose,
  product,
  onAddToCart,
  onDirectBuy,
}) {
  if (!isOpen || !product) return null;

  return (
    <VirtualTryOnContent
      onClose={onClose}
      product={product}
      onAddToCart={onAddToCart}
      onDirectBuy={onDirectBuy}
    />
  );
}

function VirtualTryOnContent({
  onClose,
  product,
  onAddToCart,
  onDirectBuy,
}) {
  const { currentUser, updateUserProfile, recordTryOnUsage } = useAuth();
  const { config } = useSiteConfig();

  // Input states initialized directly from user profile
  const [humanImageUrl, setHumanImageUrl] = useState(currentUser?.user_photo_url || '');
  const [photoInputMode, setPhotoInputMode] = useState(currentUser?.user_photo_url ? 'URL' : 'FILE');
  const [heightCm, setHeightCm] = useState(currentUser?.height_cm ? String(currentUser.height_cm) : '');
  const [weightKg, setWeightKg] = useState(currentUser?.weight_kg ? String(currentUser.weight_kg) : '');
  const [gender, setGender] = useState(currentUser?.gender || 'female');
  const [saveToProfile, setSaveToProfile] = useState(true);

  // Generation states
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [generatedResult, setGeneratedResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [standbyMode, setStandbyMode] = useState(false);

  const fileInputRef = useRef(null);

  const garmentImageUrl = product?.image || product?.images?.[0] || '';
  const garmentDescription = product?.name ? `${product.name} - ${product.category || 'Fashion'}` : 'Garment';

  const dailyLimit = config?.vton_daily_limit ?? 3;
  const today = new Date().toISOString().slice(0, 10);
  const dailyUsed = (currentUser?.last_tryon_date === today) ? (currentUser?.daily_tryon_used || 0) : 0;
  const remainingCredits = Math.max(0, dailyLimit - dailyUsed);

  // Handle local image file upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('অনুগ্রহ করে শুধুমাত্র ছবি ফাইল (JPG, PNG, WebP) আপলোড করুন।');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setErrorMessage('ছবির সাইজ সর্বোচ্চ ৮ মেগাবাইট হতে হবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setHumanImageUrl(reader.result);
      setErrorMessage('');
    };
    reader.readAsDataURL(file);
  };

  // Submit to Try-On API
  const handleGenerateTryOn = async () => {
    if (!humanImageUrl.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার একটি স্পষ্ট ফুল-বডি বা স্ট্যান্ডিং ছবি আপলোড করুন অথবা লিংক দিন।');
      return;
    }

    if (remainingCredits <= 0) {
      setErrorMessage(`আপনার আজকের দৈনিক ট্রাই-অন লিমিট (${dailyLimit}/${dailyLimit}) পূর্ণ হয়েছে। অনুগ্রহ করে আগামীকাল চেষ্টা করুন।`);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setStandbyMode(false);
    setLoadingStep('AI মডেল লোড হচ্ছে ও শারীরিক মাপকাঠির সাথে মিলিয়ে নিচ্ছে...');

    // Save profile preferences if checked and logged in
    if (currentUser && saveToProfile && updateUserProfile) {
      updateUserProfile({
        user_photo_url: humanImageUrl.startsWith('http') ? humanImageUrl : currentUser.user_photo_url,
        height_cm: heightCm ? Number(heightCm) : null,
        weight_kg: weightKg ? Number(weightKg) : null,
        gender,
      });
    }

    // Realistic progress animation
    const stepTimer1 = setTimeout(() => {
      setLoadingStep('পোশাক ফিটিং হচ্ছে... ৩-৫ সেকেন্ড অপেক্ষা করুন');
    }, 2500);

    const stepTimer2 = setTimeout(() => {
      setLoadingStep('ফাইনাল ফিনিশিং ও টেক্সচার ম্যাচিং হচ্ছে...');
    }, 6000);

    try {
      const response = await fetch('/api/tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          human_image_url: humanImageUrl,
          garment_image_url: garmentImageUrl,
          garment_description: garmentDescription,
          daily_tryon_used: dailyUsed,
          vton_daily_limit: dailyLimit,
          customerId: currentUser?.id,
        }),
      });

      const data = await response.json();

      if (data.success && data.result_image_url) {
        setGeneratedResult(data.result_image_url);
        if (recordTryOnUsage) {
          await recordTryOnUsage();
        }
      } else if (data.standby) {
        setStandbyMode(true);
        setErrorMessage(data.error || 'AI Engine currently configured in standby mode.');
      } else {
        setErrorMessage(data.error || 'ট্রাই-অন সম্পন্ন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
    } catch (err) {
      console.error('Try-On request error:', err);
      setErrorMessage('সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি। আপনার ইন্টারনেট চেক করে পুনরায় চেষ্টা করুন।');
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-purple-200/80 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* টপ হেডার বার */}
        <div className="px-5 py-4 bg-gradient-to-r from-purple-700 via-pink-600 to-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-serif font-bold tracking-wide flex items-center gap-2">
                <span>AI ভার্চুয়াল ড্রেসিং রুম (Virtual Try-On)</span>
              </h2>
              <p className="text-[10px] text-pink-100">
                আপনার নিজের ছবিতে পছন্দের পোশাকটি কেমন মানাবে লাইভ দেখুন
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* দৈনিক লিমিট কাউন্টার */}
            <span className="text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
              আজকের বাকি: {remainingCredits} / {dailyLimit} বার
            </span>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition active:scale-90"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* এরর / স্ট্যান্ডবাই ব্যানার */}
        {errorMessage && (
          <div className={`px-5 py-2.5 text-xs flex items-center justify-between gap-2 border-b ${
            standbyMode 
              ? 'bg-amber-50 text-amber-900 border-amber-200' 
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <div className="flex items-center gap-2">
              {standbyMode ? <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" /> : <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />}
              <span>{errorMessage}</span>
            </div>
            {standbyMode && (
              <span className="text-[10px] bg-amber-200/70 text-amber-900 font-bold px-2 py-0.5 rounded">
                Standby Mode
              </span>
            )}
          </div>
        )}

        {/* মেইন বডি এরিয়া (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-xs text-gray-700">
          
          {/* যদি জেনারেট সম্পন্ন হয়ে থাকে */}
          {generatedResult ? (
            <div className="space-y-5 animate-in zoom-in-95 duration-300">
              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ট্রাই-অন সফল হয়েছে! আপনার নতুন লুক নিচে প্রদর্শিত হচ্ছে:
                </span>
              </div>

              {/* সাইড-বাই-সাইড তুলনা */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block text-center">
                    নির্বাচিত পোশাক (Garment)
                  </span>
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img 
                      src={garmentImageUrl} 
                      alt="Garment" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-2 inset-x-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium p-1.5 rounded-lg text-center truncate">
                      {product.name}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block text-center flex items-center justify-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI ট্রাই-অন রেজাল্ট
                  </span>
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-black border-2 border-purple-500 shadow-xl">
                    <img 
                      src={generatedResult} 
                      alt="AI Virtual Try-On Result" 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute top-2 right-2 bg-purple-600/90 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> AI Generated
                    </div>
                  </div>
                </div>
              </div>

              {/* অ্যাকশন বাটনস */}
              <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setGeneratedResult(null)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 border border-gray-200 hover:bg-gray-50 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> পুনরায় ছবি পরিবর্তন করুন
                </button>

                <div className="w-full sm:w-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onAddToCart) onAddToCart(product);
                      onClose();
                    }}
                    className="flex-1 sm:flex-initial px-5 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-md active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" /> ব্যাগে যোগ করুন
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onDirectBuy) onDirectBuy(product);
                      onClose();
                    }}
                    className="flex-1 sm:flex-initial px-5 py-3 bg-gray-900 hover:bg-black text-white rounded-xl font-bold shadow-md active:scale-95 transition flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400" /> সরাসরি অর্ডার করুন
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ইনপুট ও কনফিগারেশন মোড */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* কলাম ১: কাস্টমারের ছবি ইনপুট */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-purple-600" />
                      <span>১. আপনার স্ট্যান্ডিং ছবি দিন (Your Full Photo):</span>
                    </label>

                    {/* ইনপুট মোড টগল (URL vs File) */}
                    <div className="flex bg-gray-100 p-0.5 rounded-lg border text-[10px] font-semibold">
                      <button
                        type="button"
                        onClick={() => setPhotoInputMode('URL')}
                        className={`px-2 py-0.5 rounded-md transition ${photoInputMode === 'URL' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-500'}`}
                      >
                        ফটো URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoInputMode('FILE')}
                        className={`px-2 py-0.5 rounded-md transition ${photoInputMode === 'FILE' ? 'bg-white text-purple-700 shadow-xs' : 'text-gray-500'}`}
                      >
                        ডিভাইস আপলোড
                      </button>
                    </div>
                  </div>

                  {photoInputMode === 'URL' ? (
                    <div>
                      <input
                        type="url"
                        placeholder="আপনার ছবির ওয়েব লিংক (https://...jpg)"
                        value={humanImageUrl}
                        onChange={(e) => setHumanImageUrl(e.target.value)}
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-purple-500 bg-gray-50/50"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        টিপ: সোজা দাঁড়িয়ে তোলা ফুল-বডি বা আপার-বডি স্পষ্ট ছবি দিন।
                      </span>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-4 px-4 border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-2xl bg-purple-50/30 text-purple-800 flex flex-col items-center justify-center gap-1.5 transition active:scale-[0.99]"
                      >
                        <Upload className="w-5 h-5 text-purple-600" />
                        <span className="font-bold text-xs">গ্যালারি বা ক্যামেরা থেকে ছবি আপলোড করুন</span>
                        <span className="text-[10px] text-gray-500">JPG, PNG বা WebP (সর্বোচ্চ ৮ MB)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* কাস্টমার ছবির থাম্বনেইল প্রিভিউ */}
                {humanImageUrl && (
                  <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-center gap-3">
                    <div className="w-16 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0 relative border border-purple-200 shadow-xs">
                      <img 
                        src={humanImageUrl} 
                        alt="Your Preview" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mb-1">
                        ✓ ছবি সংযুক্ত হয়েছে
                      </span>
                      <p className="text-[11px] text-gray-600 line-clamp-2">
                        এই ছবির ওপর পণ্যটি এআই দ্বারা নিখুঁতভাবে বসানো হবে।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setHumanImageUrl('')}
                      className="p-1 text-gray-400 hover:text-rose-600 transition"
                      title="মুছুন"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* ঐচ্ছিক শারীরিক মাপকাঠি (Fitment parameters) */}
                <div className="p-3.5 bg-gray-50/80 rounded-2xl border border-gray-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-gray-500" />
                      <span>শারীরিক বিবরণ (ঐচ্ছিক ফিটিং সহায়তা):</span>
                    </span>
                    <span className="text-[10px] text-gray-400">বেটার ফিটিং এর জন্য</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">জেন্ডার (Gender)</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white focus:outline-purple-500"
                      >
                        <option value="female">মহিলা (Female)</option>
                        <option value="male">পুরুষ (Male)</option>
                        <option value="other">অন্যান্য (Other)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">উচ্চতা (Height cm)</label>
                      <input
                        type="number"
                        placeholder="যেমন: 160"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white focus:outline-purple-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 block mb-0.5">ওজন (Weight kg)</label>
                      <input
                        type="number"
                        placeholder="যেমন: 55"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white focus:outline-purple-500 font-mono"
                      />
                    </div>
                  </div>

                  {currentUser && (
                    <label className="flex items-center gap-2 pt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveToProfile}
                        onChange={(e) => setSaveToProfile(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-[10px] text-gray-600">
                        পরবর্তী ব্যবহারের জন্য এই ছবি ও মাপ আমার প্রোফাইলে সংরক্ষণ করুন
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* কলাম ২: পোশাকের তথ্য ও ট্রাই-অন অ্যাকশন */}
              <div className="md:col-span-5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-800 block mb-2">
                    ২. ট্রাই-অন এর জন্য নির্বাচিত পণ্য:
                  </label>
                  <div className="p-3 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border border-pink-100 flex gap-3 items-center">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white flex-shrink-0 border border-pink-200">
                      <img 
                        src={garmentImageUrl} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-bold uppercase text-pink-600 tracking-wider">
                        {product.category || 'Jewelry'}
                      </span>
                      <h4 className="font-serif font-bold text-xs text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs font-bold text-pink-700 font-mono mt-0.5">
                        ৳ {product.price}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ট্রাই করুন বাটন */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleGenerateTryOn}
                    disabled={isLoading || !humanImageUrl.trim() || remainingCredits <= 0}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 text-white rounded-2xl font-bold text-sm shadow-xl shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-98 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-yellow-300" />
                        <span>ফিটিং হচ্ছে... অপেক্ষা করুন</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                        <span>পোশাকটি ট্রাই করুন (Try On Now)</span>
                      </>
                    )}
                  </button>

                  {/* লোডিং লাইভ স্টেট মেসেজ */}
                  {isLoading && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-xl border border-purple-200 text-center space-y-1.5 animate-pulse">
                      <p className="text-xs font-bold text-purple-900">
                        {loadingStep}
                      </p>
                      <div className="w-full bg-purple-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-600 h-full rounded-full animate-[storyFill_6s_linear_infinite]" />
                      </div>
                    </div>
                  )}

                  <p className="text-[10px] text-gray-400 text-center mt-2.5 leading-relaxed">
                    এআই জেনারেশনে সাধারণত ৩ থেকে ১০ সেকেন্ড সময় লাগতে পারে। দৈনিক সর্বোচ্চ {dailyLimit} বার ট্রাই করা যাবে।
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
