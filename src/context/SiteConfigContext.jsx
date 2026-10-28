'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// ডিফল্ট টেক্সট, কালার, ডেলিভারি চার্জ ও কুপন
const DEFAULT_CONFIG = {
  logoUrl: '/logo.png',
  logoHeight: 44, // পিক্সেলে লোগোর হাইট

  brandName: 'FLAMINGO',
  tagline: 'Elegance That Endures',
  heroHeadline: 'খাঁটি ৯২৫ স্টার্লিং সিলভার জুয়েলারি',
  heroSubheadline: 'প্রতিটি গহনায় রয়েছে আন্তর্জাতিক সিলভার হলমার্ক নিশ্চয়তা ও অ্যান্টি-টার্নিশ ফিনিশিং',
  announcementText: '✨ সারা বাংলাদেশে ক্যাশ অন ডেলিভারি ও পার্সেল চেক করে নেওয়ার সুবিধা!',
  primaryColor: '#db2777', // ফ্ল্যামিঙ্গো পিংক
  accentBgColor: '#fff5f6', // সফট প্যাস্টেল ব্যাকগ্রাউন্ড
  fontFamily: 'serif',

  // ডেলিভারি চার্জ সেটিংস
  deliveryChargeInsideDhaka: 80,
  deliveryChargeOutsideDhaka: 130,

  // সক্রিয় কুপন ও রেফারেল কোড
  coupons: [
    { code: 'FLAMINGO10', type: 'percentage', discount: 10, note: '১০% ওয়েলকাম ডিসকাউন্ট' },
    { code: 'REFER50', type: 'flat', discount: 50, note: 'রেফারেল ৫০ টাকা ছাড়' },
  ],
};

const SiteConfigContext = createContext();

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('flamingo_site_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          deliveryChargeInsideDhaka: parsed.deliveryChargeInsideDhaka ?? DEFAULT_CONFIG.deliveryChargeInsideDhaka,
          deliveryChargeOutsideDhaka: parsed.deliveryChargeOutsideDhaka ?? DEFAULT_CONFIG.deliveryChargeOutsideDhaka,
          coupons: Array.isArray(parsed.coupons) ? parsed.coupons : DEFAULT_CONFIG.coupons,
        });
      }
    } catch (e) {
      console.error('Failed to parse flamingo_site_config:', e);
    }
  }, []);

  const updateConfig = (newConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('flamingo_site_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error('Failed to save flamingo_site_config:', e);
    }
  };

  const resetToDefault = () => {
    setConfig(DEFAULT_CONFIG);
    try {
      localStorage.removeItem('flamingo_site_config');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SiteConfigContext.Provider value={{ config, updateConfig, resetToDefault, DEFAULT_CONFIG }}>
      <div 
        style={{
          fontFamily: config.fontFamily === 'serif' ? 'serif' : 'sans-serif',
        }}
      >
        {children}
      </div>
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  const context = useContext(SiteConfigContext);
  if (!context) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
}
