// =================================================================
// FLAMINGO E-COMMERCE PLATFORM
// Modular Multi-Payment Gateway Architecture
// =================================================================

/**
 * Available Payment Providers
 *
 * Plug-and-play architecture for Bangladeshi payment gateways.
 * To activate any digital gateway in the future:
 * 1. Set `isActive: true` on the provider below.
 * 2. Supply merchant credentials in `.env.local` / environment variables.
 * 3. The checkout UI will automatically render the gateway as an option
 *    without altering any checkout UI code.
 */
export const PAYMENT_METHODS = [
  {
    id: 'COD',
    name: 'ক্যাশ অন ডেলিভারি (Cash on Delivery)',
    shortName: 'Cash on Delivery',
    subtitle: 'পার্সেল হাতে পেয়ে পণ্য চেক করে মূল্য ও ডেলিভারি চার্জ ক্যাশে পরিশোধ করুন। কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই।',
    badge: 'ডিফল্ট ও ক্যাশ পেমেন্ট',
    isActive: true,
    isDefault: true,
    isReady: true,
    readyForApiKeys: false,
    type: 'offline', // 'offline' | 'digital'
    brandColor: '#DB2777', // Flamingo Pink
    instructions: 'ডেলিভারিম্যানের কাছে পণ্য যাচাই করে মোট প্রদেয় মূল্য পরিশোধ করবেন।',
    /**
     * Offline COD execution handler
     */
    executePayment: async ({ orderId, totalAmount, customer }) => {
      return {
        success: true,
        method: 'COD',
        orderId,
        redirectUrl: null,
        paymentStatus: 'unpaid',
      };
    },
  },
  {
    id: 'BKASH',
    name: 'bKash (বিকাশ অনলাইন গেটওয়ে)',
    shortName: 'bKash Direct',
    subtitle: 'বিকাশ অনলাইন গেটওয়ের মাধ্যমে তাৎক্ষণিক ডিজিটাল পেমেন্ট।',
    badge: 'বিকাশ অনলাইন',
    isActive: false, // Ready for API keys
    isDefault: false,
    isReady: true,
    readyForApiKeys: true,
    type: 'digital',
    brandColor: '#E2136E', // bKash Pink
    gatewayConfig: {
      merchantNumber: process.env.NEXT_PUBLIC_BKASH_MERCHANT_NO || '01700-000000',
      apiEndpoint: process.env.NEXT_PUBLIC_BKASH_ENDPOINT || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
      appKey: process.env.BKASH_APP_KEY || '',
      appSecret: process.env.BKASH_APP_SECRET || '',
      username: process.env.BKASH_USERNAME || '',
      password: process.env.BKASH_PASSWORD || '',
    },
    /**
     * bKash Tokenized Checkout execution adapter hook
     */
    executePayment: async ({ orderId, totalAmount, customer }) => {
      // Future integration point: Call `/api/payment/bkash/create`
      return {
        success: false,
        error: 'bKash সরাসরি পেমেন্ট গেটওয়ে শীঘ্রই লাইভ হচ্ছে। অনুগ্রহ করে ক্যাশ অন ডেলিভারি সিলেক্ট করুন।',
      };
    },
  },
  {
    id: 'NAGAD',
    name: 'Nagad (নগদ অনলাইন গেটওয়ে)',
    shortName: 'Nagad Direct',
    subtitle: 'নগদ অনলাইন পেমেন্ট গেটওয়ের মাধ্যমে সুরক্ষিত লেনদেন।',
    badge: 'নগদ অনলাইন',
    isActive: false, // Ready for API keys
    isDefault: false,
    isReady: true,
    readyForApiKeys: true,
    type: 'digital',
    brandColor: '#F7941D', // Nagad Orange
    gatewayConfig: {
      merchantId: process.env.NAGAD_MERCHANT_ID || '',
      publicKey: process.env.NAGAD_PUBLIC_KEY || '',
      privateKey: process.env.NAGAD_PRIVATE_KEY || '',
      apiEndpoint: process.env.NEXT_PUBLIC_NAGAD_ENDPOINT || 'https://sandbox.mynagad.com',
    },
    executePayment: async ({ orderId, totalAmount, customer }) => {
      // Future integration point: Call `/api/payment/nagad/initialize`
      return {
        success: false,
        error: 'নগদ পেমেন্ট গেটওয়ে সক্রিয়করণ প্রক্রিয়ায় রয়েছে। অনুগ্রহ করে ক্যাশ অন ডেলিভারি সিলেক্ট করুন।',
      };
    },
  },
  {
    id: 'ROCKET',
    name: 'Rocket (রকেট ডিবিবিএল)',
    shortName: 'Rocket DBBL',
    subtitle: 'ডাচ-বাংলা ব্যাংক রকেট মোবাইল ব্যাংকিং গেটওয়ে।',
    badge: 'ডিবিবিএল রকেট',
    isActive: false, // Ready for API keys
    isDefault: false,
    isReady: true,
    readyForApiKeys: true,
    type: 'digital',
    brandColor: '#8C3494', // Rocket Purple
    executePayment: async () => ({
      success: false,
      error: 'রকেট পেমেন্ট গেটওয়ে প্রস্তুতি চলছে।',
    }),
  },
  {
    id: 'UPAY',
    name: 'Upay (ইউসিবি উপায়)',
    shortName: 'Upay Wallet',
    subtitle: 'ইউনাইটেড কমার্শিয়াল ব্যাংক উপায় ডিজিটাল ওয়ালেট।',
    badge: 'ইউসিবি উপায়',
    isActive: false, // Ready for API keys
    isDefault: false,
    isReady: true,
    readyForApiKeys: true,
    type: 'digital',
    brandColor: '#0058A8', // Upay Blue
    executePayment: async () => ({
      success: false,
      error: 'উপায় পেমেন্ট গেটওয়ে প্রস্তুতি চলছে।',
    }),
  },
  {
    id: 'SSLCOMMERZ',
    name: 'SSLCommerz (কার্ড / ভিসা / মাস্টারকার্ড / নেট ব্যাংকিং)',
    shortName: 'SSLCommerz',
    subtitle: 'ভিসা, মাস্টারকার্ড, অ্যামেক্স ও সকল বাংলাদেশি ইন্টারনেট ব্যাংকিং গেটওয়ে।',
    badge: 'অল-ইন-ওয়ান গেটওয়ে',
    isActive: false, // Ready for API keys
    isDefault: false,
    isReady: true,
    readyForApiKeys: true,
    type: 'digital',
    brandColor: '#2B3990', // SSLCommerz Blue
    gatewayConfig: {
      storeId: process.env.SSLCOMMERZ_STORE_ID || '',
      storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || '',
      isSandbox: process.env.NODE_ENV !== 'production',
    },
    executePayment: async () => ({
      success: false,
      error: 'SSLCommerz গেটওয়ে শীঘ্রই যুক্ত হবে।',
    }),
  },
];

/**
 * Returns all payment providers that are currently active
 */
export function getActivePaymentMethods() {
  const active = PAYMENT_METHODS.filter((m) => m.isActive);
  if (active.length === 0) {
    // Guaranteed fallback: COD is always available
    return [PAYMENT_METHODS[0]];
  }
  return active;
}

/**
 * Returns the default payment provider (COD by default)
 */
export function getDefaultPaymentMethod() {
  const active = getActivePaymentMethods();
  const defaultMethod = active.find((m) => m.isDefault);
  return defaultMethod || active[0];
}

/**
 * Look up a payment provider by ID (e.g. 'COD', 'BKASH')
 */
export function getPaymentMethodById(id) {
  if (!id) return getDefaultPaymentMethod();
  return (
    PAYMENT_METHODS.find((m) => m.id.toUpperCase() === String(id).toUpperCase()) ||
    getDefaultPaymentMethod()
  );
}
