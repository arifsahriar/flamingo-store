'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  DEFAULT_PRICING_SETTINGS, 
  fetchPricingSettings, 
  savePricingSettings, 
  getCachedPricingSettings 
} from '@/lib/pricingEngine';

// ডিফল্ট টেক্সট, কালার, ডেলিভারি চার্জ ও কুপন
const DEFAULT_CONFIG = {
  logoUrl: '/logo.png',
  logoHeight: 44, // পিক্সেলে লোগোর হাইট

  brandName: 'FLAMINGO',
  tagline: 'Elegance That Endures',
  heroHeadline: 'প্রিমিয়াম কোয়ালিটি লাইফস্টাইল ও জুয়েলারি',
  heroSubheadline: 'আন্তর্জাতিক স্ট্যান্ডার্ড নিশ্চয়তা, টেকসই স্থায়িত্ব ও প্রিমিয়াম ফিনিশিং',
  announcementText: '✨ সারা বাংলাদেশে অগ্রিম সিকিউরিটি ভেরিফিকেশন ও দ্রুততম ডেলিভারি সুবিধা!',
  primaryColor: '#db2777', // ফ্ল্যামিঙ্গো পিংক
  accentBgColor: '#fff5f6', // সফট প্যাস্টেল ব্যাকগ্রাউন্ড
  fontFamily: 'serif',

  // ডেলিভারি চার্জ সেটিংস
  deliveryChargeInsideDhaka: 80,
  deliveryChargeOutsideDhaka: 150,

  // ডায়নামিক প্রাইসিং ও মার্জিন ইঞ্জিন সেটিংস (মডিউল ১)
  pricingSettings: DEFAULT_PRICING_SETTINGS,

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
      const cachedPricing = getCachedPricingSettings();
      if (saved) {
        const parsed = JSON.parse(saved);
        setConfig({
          ...DEFAULT_CONFIG,
          ...parsed,
          deliveryChargeInsideDhaka: parsed.deliveryChargeInsideDhaka ?? cachedPricing.advance_delivery_inside_city ?? DEFAULT_CONFIG.deliveryChargeInsideDhaka,
          deliveryChargeOutsideDhaka: parsed.deliveryChargeOutsideDhaka ?? cachedPricing.advance_delivery_outside_city ?? DEFAULT_CONFIG.deliveryChargeOutsideDhaka,
          pricingSettings: parsed.pricingSettings ? { ...DEFAULT_PRICING_SETTINGS, ...parsed.pricingSettings } : cachedPricing,
          coupons: Array.isArray(parsed.coupons) ? parsed.coupons : DEFAULT_CONFIG.coupons,
        });
      } else {
        setConfig((prev) => ({
          ...prev,
          pricingSettings: cachedPricing,
          deliveryChargeInsideDhaka: cachedPricing.advance_delivery_inside_city ?? 80,
          deliveryChargeOutsideDhaka: cachedPricing.advance_delivery_outside_city ?? 150,
        }));
      }
    } catch (e) {
      console.error('Failed to parse flamingo_site_config:', e);
    }

    // ব্যাকগ্রাউন্ডে সুপাবেজ প্রাইসিং সেটিংস ফেচ
    fetchPricingSettings().then((remotePricing) => {
      if (remotePricing) {
        setConfig((prev) => ({
          ...prev,
          pricingSettings: remotePricing,
          deliveryChargeInsideDhaka: remotePricing.advance_delivery_inside_city ?? prev.deliveryChargeInsideDhaka,
          deliveryChargeOutsideDhaka: remotePricing.advance_delivery_outside_city ?? prev.deliveryChargeOutsideDhaka,
        }));
      }
    });
  }, []);

  const updateConfig = (newConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('flamingo_site_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error('Failed to save flamingo_site_config:', e);
    }
  };

  const updatePricing = async (newPricing, adminRole) => {
    const res = await savePricingSettings(newPricing, adminRole);
    if (res.success) {
      setConfig((prev) => {
        const updated = {
          ...prev,
          pricingSettings: res.settings,
          deliveryChargeInsideDhaka: res.settings.advance_delivery_inside_city,
          deliveryChargeOutsideDhaka: res.settings.advance_delivery_outside_city,
        };
        try {
          localStorage.setItem('flamingo_site_config', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
    return res;
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
    <SiteConfigContext.Provider value={{ config, updateConfig, updatePricing, resetToDefault, DEFAULT_CONFIG }}>
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
