import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default async function manifest() {
  let brandName = 'FLAMINGO';
  let description = 'Elegance That Endures - Premium 925 Sterling Silver Jewelry in Bangladesh';
  const primaryColor = '#db2777'; // Flamingo Pink
  const accentBgColor = '#fff5f6'; // Soft Pastel Background

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (!error && data) {
        if (data.about_text) {
          description = data.about_text;
        }
      }
    } catch (e) {
      console.warn('Error fetching manifest settings from Supabase:', e);
    }
  }

  return {
    name: `${brandName} Store - 925 Sterling Silver Jewelry`,
    short_name: brandName,
    description: description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: accentBgColor,
    theme_color: primaryColor,
    categories: ['shopping', 'lifestyle', 'jewelry'],
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
