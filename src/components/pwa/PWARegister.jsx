'use client';

import { useEffect } from 'react';

/**
 * Service Worker Registration Component
 * Mounts in layout and registers /sw.js
 */
export default function PWARegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        });

        // Check for updates periodically
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New content is available
                // console.log('[PWA] New version ready');
              }
            });
          }
        });
      } catch (err) {
        console.warn('[PWA] Service worker registration failed:', err);
      }
    };

    // Register after page has fully loaded to prioritize initial paint
    if (document.readyState === 'complete') {
      registerSW();
    } else {
      window.addEventListener('load', registerSW);
      return () => window.removeEventListener('load', registerSW);
    }
  }, []);

  return null;
}
