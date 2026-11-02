import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const DEFAULT_SITE_SETTINGS = {
  id: 1,
  about_text: 'খাঁটি ৯২৫ স্টার্লিং সিলভারের লাক্সারি ও মার্জিত ডিজাইনের বিশ্বস্ত ঠিকানা। সংবেদনশীল ত্বকের জন্য শতভাগ অ্যালার্জি-মুক্ত রোডিয়াম কোটিং ও সার্টিফাইড বিশুদ্ধতার অনন্য মেলবন্ধন।',
  support_phone: '01700-000000 (সকাল ১০টা - রাত ১০টা)',
  support_whatsapp: '01700-000000',
  address: 'বনানী, ঢাকা-১২১৩, বাংলাদেশ',
  facebook_url: 'https://facebook.com',
  instagram_url: 'https://instagram.com',
  copyright_text: '© 2026 FLAMINGO. সর্বস্বত্ব সংরক্ষিত। খাঁটি ৯২৫ স্টার্লিং সিলভার জুয়েলারি।',
  trust_badges: [
    { title: '১০০% খাঁটি ৯২৫ সিলভার', subtitle: 'আন্তর্জাতিক হলমার্ক সার্টিফাইড' },
    { title: 'ক্যাশ অন ডেলিভারি', subtitle: 'পার্সেল চেক করে পেমেন্ট করার সুযোগ' },
    { title: 'লাইভ ওয়ারেন্টি সাপোর্ট', subtitle: 'ফ্রি পলিশিং ও অ্যান্টি-টার্নিশ কেয়ার' },
    { title: '৭ দিনের সহজ এক্সচেঞ্জ', subtitle: 'ঝামেলাবিহীন সাইজ ও মডেল পরিবর্তন' }
  ],
  policy_delivery: `• ঢাকা সিটির ভেতরে ডেলিভারি চার্জ ৳৮০ (২-৩ কার্যদিবস)।
• ঢাকা সিটির বাইরে ও সমগ্র বাংলাদেশে ডেলিভারি চার্জ ৳১৫০ (৩-৫ কার্যদিবস)।
• ক্যাশ অন ডেলিভারি প্রযোজ্য। পার্সেল হাতে পেয়ে ডেলিভারিম্যানের সামনে চেক করে মূল্য পরিশোধের শতভাগ নিশ্চয়তা রয়েছে।`,
  policy_warranty: `• প্রতিটি ৯২৫ সিলভার গহনার সাথে আন্তর্জাতিক হলমার্ক সার্টিফিকেট প্রদান করা হয়।
• নির্দিষ্ট মেয়াদের (৬ মাস/১ বছর) ফ্রি রিপলিশিং ও অ্যান্টি-টার্নিশ কেয়ার সাপোর্ট।
• 'অর্ডার ট্র্যাক' পেজে গিয়ে অর্ডার আইডি বা মোবাইল নম্বর দিয়ে যেকোনো সময় ওয়ারেন্টি ক্লেইম মেমো ডাউনলোড করতে পারবেন।`,
  policy_exchange: `• পার্সেল গ্রহণের ৭ দিনের মধ্যে যেকোনো সাইজ বা মডেল পরিবর্তনের সুযোগ।
• গহনা অব্যবহৃত ও মূল গিফট বক্সে থাকতে হবে।
• কাস্টমার সাপোর্টে কল বা হোয়াটসঅ্যাপে মেসেজ দিয়ে সহজে রিটার্ন পিকআপ বুক করতে পারবেন।`,
};

const STORAGE_KEY = 'flamingo_site_settings';

/**
 * Format phone number string into a clean tel: href
 */
export function formatPhoneForHref(phone) {
  if (!phone) return '01700000000';
  const match = phone.match(/[\+0-9\-]{7,}/);
  if (match) {
    return match[0].replace(/[^0-9+]/g, '');
  }
  return phone.replace(/[^0-9+]/g, '') || '01700000000';
}

/**
 * Format WhatsApp number string into https://wa.me/... link
 */
export function formatWhatsAppForHref(whatsapp, message = 'Hello FLAMINGO') {
  if (!whatsapp) return `https://wa.me/8801700000000?text=${encodeURIComponent(message)}`;
  let digits = whatsapp.replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) {
    digits = '88' + digits;
  } else if (!digits.startsWith('880') && digits.length === 10) {
    digits = '880' + digits;
  }
  return `https://wa.me/${digits || '8801700000000'}?text=${encodeURIComponent(message)}`;
}

/**
 * Get synchronously cached site settings from localStorage
 */
export function getCachedSiteSettings() {
  if (typeof window === 'undefined') return DEFAULT_SITE_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...DEFAULT_SITE_SETTINGS,
        ...parsed,
        trust_badges: Array.isArray(parsed.trust_badges) && parsed.trust_badges.length === 4
          ? parsed.trust_badges
          : DEFAULT_SITE_SETTINGS.trust_badges,
      };
    }
  } catch (e) {
    console.error('Error reading cached site settings:', e);
  }
  return DEFAULT_SITE_SETTINGS;
}

/**
 * Fetch site settings from Supabase (row id = 1) with localStorage cache & default fallback
 */
export async function fetchSiteSettings() {
  let settings = getCachedSiteSettings();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data) {
        settings = {
          ...DEFAULT_SITE_SETTINGS,
          ...data,
          // Guarantee 4 trust badges even if partial
          trust_badges: Array.isArray(data.trust_badges) && data.trust_badges.length === 4
            ? data.trust_badges.map((b, i) => ({
                title: b?.title || DEFAULT_SITE_SETTINGS.trust_badges[i].title,
                subtitle: b?.subtitle || DEFAULT_SITE_SETTINGS.trust_badges[i].subtitle,
              }))
            : DEFAULT_SITE_SETTINGS.trust_badges,
          // Fall back to default policies if null in database
          policy_delivery: data.policy_delivery || DEFAULT_SITE_SETTINGS.policy_delivery,
          policy_warranty: data.policy_warranty || DEFAULT_SITE_SETTINGS.policy_warranty,
          policy_exchange: data.policy_exchange || DEFAULT_SITE_SETTINGS.policy_exchange,
          facebook_url: data.facebook_url || DEFAULT_SITE_SETTINGS.facebook_url,
          instagram_url: data.instagram_url || DEFAULT_SITE_SETTINGS.instagram_url,
          copyright_text: data.copyright_text || DEFAULT_SITE_SETTINGS.copyright_text,
          about_text: data.about_text || DEFAULT_SITE_SETTINGS.about_text,
          support_phone: data.support_phone || DEFAULT_SITE_SETTINGS.support_phone,
          support_whatsapp: data.support_whatsapp || DEFAULT_SITE_SETTINGS.support_whatsapp,
          address: data.address || DEFAULT_SITE_SETTINGS.address,
        };

        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn('Failed to fetch site_settings from Supabase, using local cache:', err);
    }
  }

  return settings;
}

/**
 * Save site settings to Supabase and sync local cache
 */
export async function saveSiteSettings(newSettings) {
  const payload = {
    ...DEFAULT_SITE_SETTINGS,
    ...newSettings,
    id: 1,
    updated_at: new Date().toISOString(),
  };

  // 1. Immediately cache to localStorage for instant local reactivity
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {}
  }

  // 2. Persist to Supabase
  let dbSuccess = false;
  let dbError = null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .update({
          about_text: payload.about_text,
          support_phone: payload.support_phone,
          support_whatsapp: payload.support_whatsapp,
          address: payload.address,
          facebook_url: payload.facebook_url,
          instagram_url: payload.instagram_url,
          copyright_text: payload.copyright_text,
          trust_badges: payload.trust_badges,
          policy_delivery: payload.policy_delivery,
          policy_warranty: payload.policy_warranty,
          policy_exchange: payload.policy_exchange,
          updated_at: payload.updated_at,
        })
        .eq('id', 1)
        .select();

      if (error) {
        dbError = error.message;
        console.warn('Supabase site_settings update error:', error.message);
      } else {
        dbSuccess = true;
      }
    } catch (dbErr) {
      dbError = dbErr?.message || 'Database connection error';
      console.warn('Supabase site_settings offline fallback:', dbErr);
    }
  }

  return {
    success: true,
    dbSynced: dbSuccess,
    dbError,
    settings: payload,
  };
}
