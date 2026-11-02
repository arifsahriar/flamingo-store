'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { Download, X, Share2, PlusSquare, Sparkles, Smartphone, Check } from 'lucide-react';

const STORAGE_KEY = 'flamingo_pwa_dismissed_until';
const DISMISS_DAYS = 7; // Don't prompt again for 7 days if dismissed

export default function PWAInstallBanner() {
  const pathname = usePathname();
  const { config } = useSiteConfig();
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroidPrompt, setShowAndroidPrompt] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Do not show on admin routes
    if (pathname?.startsWith('/admin')) return;

    // 1. Standalone check (already installed and launched from home screen)
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in window.navigator && Boolean(window.navigator.standalone)) ||
      document.referrer.includes('android-app://');

    setIsStandalone(isInStandaloneMode);
    if (isInStandaloneMode) return;

    // 2. Mobile Device Detection (Desktop Guard)
    const userAgent = window.navigator.userAgent || '';
    const mobileUA = /Android|iPhone|iPad|iPod|IEMobile|BlackBerry|Opera Mini/i.test(userAgent);
    const mobileScreen = window.innerWidth < 768;
    const isMobileDevice = mobileUA || mobileScreen;

    setIsMobile(isMobileDevice);
    if (!isMobileDevice) return; // Completely hide on desktop/laptops

    // 3. Dismissal check from localStorage
    const dismissedUntil = localStorage.getItem(STORAGE_KEY);
    if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
      return;
    }

    // 4. iOS Detection
    const isAppleDevice =
      /iPad|iPhone|iPod/.test(userAgent) ||
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    
    // Check if it's Safari / Webkit on iOS
    const isSafariIOS = isAppleDevice && !userAgent.includes('CriOS') && !userAgent.includes('FxiOS');
    setIsIOS(isAppleDevice);

    if (isAppleDevice) {
      // Delay prompt slightly on iOS so initial page loads smoothly
      const timer = setTimeout(() => {
        setShowIOSPrompt(true);
      }, 3500);
      return () => clearTimeout(timer);
    }

    // 5. Android / Chromium: Intercept native beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowAndroidPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If app gets installed, hide banner
    const handleAppInstalled = () => {
      setShowAndroidPrompt(false);
      setShowIOSPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('flamingo_pwa_installed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const dismissPrompt = (days = DISMISS_DAYS) => {
    setShowAndroidPrompt(false);
    setShowIOSPrompt(false);
    setShowIOSModal(false);
    try {
      const expiry = Date.now() + days * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, expiry.toString());
    } catch (e) {}
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        dismissPrompt(60); // 60 days
      } else {
        dismissPrompt(3); // 3 days if declined
      }
    } catch (err) {
      console.warn('PWA install error:', err);
    } finally {
      setDeferredPrompt(null);
      setShowAndroidPrompt(false);
    }
  };

  // Do not render anything if on desktop, already running in standalone PWA mode, or on admin routes
  if (!isMobile || isStandalone || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* ------------------------------------------------------------- */}
      {/* A. ANDROID / CHROMIUM MOBILE BOTTOM SHEET PROMPT              */}
      {/* ------------------------------------------------------------- */}
      {showAndroidPrompt && (
        <div className="fixed bottom-4 inset-x-3 z-40 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-pink-200/80 ring-1 ring-black/5 flex items-center justify-between gap-3.5">
            {/* অ্যাপ আইকন */}
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200/60 p-2 flex items-center justify-center flex-shrink-0 shadow-xs">
              <img
                src={config.logoUrl || '/logo.png'}
                alt={config.brandName || 'FLAMINGO'}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <Smartphone className="w-6 h-6 text-pink-600 hidden only:block" />
            </div>

            {/* টেক্সট ইনফো */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-serif font-black text-gray-900 text-xs sm:text-sm tracking-tight truncate">
                  {config.brandName || 'FLAMINGO'} অ্যাপ
                </h4>
                <span className="text-[9px] bg-pink-100 text-pink-700 font-bold px-1.5 py-0.2 rounded-full">
                  ফাস্ট শপিং
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                সরাসরি হোম স্ক্রিনে যোগ করুন
              </p>
            </div>

            {/* বাটনসমূহ */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-pink-600/25 active:scale-95 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>ইনস্টল</span>
              </button>
              <button
                type="button"
                onClick={() => dismissPrompt()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"
                title="পরে মনে করিয়ে দিন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* B. iOS / SAFARI COMPACT BAR PROMPT                            */}
      {/* ------------------------------------------------------------- */}
      {showIOSPrompt && !showIOSModal && (
        <div className="fixed bottom-4 inset-x-3 z-40 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 shadow-2xl border border-pink-200/80 ring-1 ring-black/5 flex items-center justify-between gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-50 to-pink-100 border border-pink-200/60 p-2 flex items-center justify-center flex-shrink-0 shadow-xs">
              <img
                src={config.logoUrl || '/logo.png'}
                alt={config.brandName || 'FLAMINGO'}
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h4 className="font-serif font-black text-gray-900 text-xs sm:text-sm tracking-tight truncate">
                  {config.brandName || 'FLAMINGO'} অ্যাপ ইনস্টল
                </h4>
                <span className="text-[9px] bg-pink-100 text-pink-700 font-bold px-1.5 py-0.2 rounded-full">
                  iOS
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate mt-0.5">
                হোম স্ক্রিন থেকে সহজে ব্যবহার করুন
              </p>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowIOSModal(true)}
                className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-pink-600/25 active:scale-95 flex items-center gap-1.5"
              >
                <PlusSquare className="w-3.5 h-3.5" />
                <span>কীভাবে?</span>
              </button>
              <button
                type="button"
                onClick={() => dismissPrompt()}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition"
                title="পরে"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* C. iOS SAFARI 2-STEP VISUAL HELPER POPUP MODAL               */}
      {/* ------------------------------------------------------------- */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-pink-100 space-y-5 animate-in slide-in-from-bottom-6 duration-300">
            
            {/* হেডার */}
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-gray-900 text-sm sm:text-base">
                    হোম স্ক্রিনে অ্যাপ যুক্ত করুন
                  </h3>
                  <p className="text-[11px] text-gray-400">সাফারি ব্রাউজারে ২-টি সহজ ধাপ</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ২-টি নির্দেশিকা ধাপ */}
            <div className="space-y-3.5 text-xs text-gray-700">
              
              {/* ধাপ ১ */}
              <div className="flex items-start gap-3 p-3 bg-pink-50/50 rounded-2xl border border-pink-100/70">
                <div className="w-7 h-7 rounded-xl bg-pink-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                  ১
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    নিচের শেয়ার বাটনটিতে চাপুন
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                    সাফারি ব্রাউজারের নিচের বারে <Share2 className="w-3.5 h-3.5 text-blue-600 inline" /> (Share) আইকনটি চাপুন।
                  </p>
                </div>
              </div>

              {/* ধাপ ২ */}
              <div className="flex items-start gap-3 p-3 bg-pink-50/50 rounded-2xl border border-pink-100/70">
                <div className="w-7 h-7 rounded-xl bg-pink-600 text-white flex items-center justify-center flex-shrink-0 font-bold text-xs mt-0.5">
                  ২
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    &apos;Add to Home Screen&apos; সিলেক্ট করুন
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                    মেনু স্ক্রল করে <PlusSquare className="w-3.5 h-3.5 text-gray-700 inline" /> &quot;Add to Home Screen&quot; বাটনে চাপুন।
                  </p>
                </div>
              </div>

            </div>

            {/* অ্যাকশন বাটন */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => dismissPrompt(14)}
                className="w-full py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-bold text-xs shadow-lg shadow-pink-600/30 transition active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>বুঝতে পেরেছি / বন্ধ করুন</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
