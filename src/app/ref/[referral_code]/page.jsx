'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';

function ReferralGatewayContent() {
  const router = useRouter();
  const params = useParams();
  const referralCode = params?.referral_code || '';

  useEffect(() => {
    if (referralCode) {
      const cleanCode = String(referralCode).trim().toUpperCase();
      try {
        localStorage.setItem('flamingo_active_referral', cleanCode);
        document.cookie = `flamingo_ref=${cleanCode}; path=/; max-age=2592000`; // 30 days
      } catch (e) {
        console.error(e);
      }
      // Redirect to registration page with referral parameter
      router.replace(`/register?ref=${cleanCode}`);
    } else {
      router.replace('/collections');
    }
  }, [referralCode, router]);

  return (
    <div className="min-h-screen bg-[#FFF5F6] flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center max-w-sm w-full space-y-4 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center mx-auto shadow-inner">
          <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: '3s' }} />
        </div>
        <h2 className="text-lg font-serif font-bold text-gray-900">
          রেফারেল লিংক লোড হচ্ছে...
        </h2>
        <p className="text-xs text-gray-500">
          কোড: <strong className="font-mono text-pink-600">{referralCode}</strong>
        </p>
        <div className="w-full bg-pink-100 h-1.5 rounded-full overflow-hidden">
          <div className="bg-pink-600 h-full w-2/3 animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function ReferralGatewayPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF5F6] flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center max-w-sm w-full space-y-4">
            <Sparkles className="w-8 h-8 animate-spin text-pink-600 mx-auto" />
            <p className="text-sm text-gray-600">রেফারেল লিংক লোড হচ্ছে...</p>
          </div>
        </div>
      }
    >
      <ReferralGatewayContent />
    </Suspense>
  );
}
