'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// ডিফল্ট টেক্সট ও কালার
const DEFAULT_CONFIG = {
  brandName: 'FLAMINGO',
  tagline: 'Elegance That Endures',
  heroHeadline: 'খাঁটি ৯২৫ স্টার্লিং সিলভার জুয়েলারি',
  heroSubheadline: 'প্রতিটি গহনায় রয়েছে আন্তর্জাতিক সিলভার হলমার্ক নিশ্চয়তা ও অ্যান্টি-টার্নিশ ফিনিশিং',
  announcementText: '✨ সারা বাংলাদেশে ক্যাশ অন ডেলিভারি ও পার্সেল চেক করে নেওয়ার সুবিধা!',
  primaryColor: '#db2777', // ফ্ল্যামিঙ্গো পিংক
  accentBgColor: '#fff5f6', // সফট প্যাস্টেল ব্যাকগ্রাউন্ড
  fontFamily: 'serif',
};

const SiteConfigContext = createContext();

export function SiteConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('flamingo_site_config');
      if (saved) {
        setConfig(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const updateConfig = (newConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('flamingo_site_config', JSON.stringify(newConfig));
    } catch (e) {
      console.error(e);
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
    <SiteConfigContext.Provider value={{ config, updateConfig, resetToDefault }}>
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