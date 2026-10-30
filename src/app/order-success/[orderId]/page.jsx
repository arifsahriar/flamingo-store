'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  CheckCircle, 
  Truck, 
  ShoppingBag, 
  Package, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  User, 
  Clock, 
  Tag, 
  Wallet,
  Sparkles
} from 'lucide-react';

function OrderSuccessContent() {
  const params = useParams();
  const router = useRouter();
  const { config } = useSiteConfig();
  const { currentUser } = useAuth();
  const orderId = params?.orderId || '';

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    // ১. লোকাল স্টোরেজ থেকে অর্ডার লোড
    let foundOrder = null;
    try {
      const stored = localStorage.getItem('flamingo_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        foundOrder = parsed.find((o) => (o.orderId || o.id) === orderId);
      }
    } catch (e) {
      console.error('Error loading order from localStorage:', e);
    }

    if (foundOrder) {
      setOrder(foundOrder);
      setIsLoading(false);
      return;
    }

    // ২. যদি লোকাল স্টোরেজে না পাওয়া যায়, সুপাবেজ থেকে ফেচ করা
    if (isSupabaseConfigured()) {
      supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle()
        .then(({ data, error }) => {
          if (!error && data) {
            setOrder({
              id: data.id,
              orderId: data.id,
              date: data.created_at ? new Date(data.created_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleDateString('bn-BD'),
              customer: {
                name: data.customer_name,
                phone: data.customer_phone,
                address: data.customer_address,
                area: data.delivery_city,
              },
              items: Array.isArray(data.items) ? data.items : [],
              subtotal: Math.max(0, (Number(data.total_amount) || 0) - (Number(data.delivery_fee) || 0) + (Number(data.discount_amount) || 0)),
              discountAmount: Number(data.discount_amount) || 0,
              appliedCouponCode: data.coupon_code || null,
              walletUsedAmount: Number(data.wallet_used_amount) || 0,
              deliveryCharge: Number(data.delivery_fee) || 80,
              grandTotal: Number(data.total_amount) || 0,
              dueOnDelivery: Math.max(0, (Number(data.total_amount) || 0) - (Number(data.wallet_used_amount) || 0)),
              payment_method: data.payment_method || 'COD',
              paymentMethodName: data.payment_method === 'COD' ? 'ক্যাশ অন ডেলিভারি (Cash on Delivery)' : data.payment_method,
              status: data.status || 'নতুন অর্ডার (Pending)',
            });
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF5F6] flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center max-w-sm w-full space-y-4">
          <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center mx-auto animate-spin">
            <Clock className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-gray-700">অর্ডার নিশ্চিতকরণ লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#FFF5F6] flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 max-w-md w-full space-y-4">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h2 className="text-lg font-serif font-bold text-gray-800">অর্ডারটি খুঁজে পাওয়া যায়নি</h2>
          <p className="text-xs text-gray-500">
            অর্ডার আইডি: <strong className="font-mono text-pink-600">{orderId}</strong>
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href={`/track-order?orderId=${orderId}`}
              className="w-full py-2.5 bg-pink-600 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              ট্র্যাক অর্ডার পেজে খুঁজুন
            </Link>
            <Link
              href="/collections"
              className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200"
            >
              কালেকশন দেখুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const customer = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const dueAmount = order.dueOnDelivery ?? order.netPayableCod ?? Math.max(0, (order.grandTotal || 0) - (order.walletUsedAmount || 0));

  return (
    <div 
      className="min-h-screen py-10 px-4 sm:px-6 flex items-center justify-center transition-colors"
      style={{ backgroundColor: config.accentBgColor || '#FFF5F6' }}
    >
      <div className="bg-white max-w-2xl w-full p-6 sm:p-10 rounded-3xl shadow-xl border border-pink-100 space-y-6 text-center animate-in fade-in">
        
        {/* সাকসেস ব্যাজ ও হেডার */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div>
          <span className="text-xs font-semibold tracking-wider uppercase text-pink-600 bg-pink-50 px-3.5 py-1 rounded-full border border-pink-100 inline-block">
            অর্ডার সফলভাবে গ্রহণ করা হয়েছে
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mt-2.5">
            ধন্যবাদ, {customer.name || customer.customerName || 'সম্মানিত গ্রাহক'}!
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            আপনার ক্যাশ অন ডেলিভারি অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।
          </p>
        </div>

        {/* অর্ডার রসিদ সামারি কার্ড */}
        <div className="bg-pink-50/40 p-5 sm:p-6 rounded-3xl border border-pink-100 text-left text-xs space-y-3.5">
          <div className="flex justify-between items-center pb-2.5 border-b border-pink-100">
            <span className="text-gray-600">অর্ডার আইডি:</span>
            <span className="font-mono font-black text-pink-600 text-sm">{order.id || order.orderId}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-700">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-pink-500" />
              <span>তারিখ: {order.date}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-pink-500" />
              <span className="font-mono font-semibold">{customer.phone}</span>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-gray-700 pt-1">
            <MapPin className="w-3.5 h-3.5 text-pink-500 flex-shrink-0 mt-0.5" />
            <span className="font-medium">
              ঠিকানা: {customer.address} {customer.area && `(${customer.area})`}
            </span>
          </div>

          {customer.note && (
            <div className="bg-white/80 p-2.5 rounded-xl border border-pink-100 text-gray-600 text-[11px]">
              <strong className="text-gray-800">নোট:</strong> {customer.note}
            </div>
          )}

          {/* আইটেম তালিকা */}
          <div className="pt-2 border-t border-pink-100 space-y-2">
            <span className="font-semibold text-gray-800 block mb-1">অর্ডারকৃত আইটেম ({items.length} টি):</span>
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white p-2.5 rounded-2xl border border-pink-100/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'}
                    alt={item.name || item.title}
                    className="w-10 h-10 object-cover rounded-xl border border-pink-100 bg-gray-50 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-xs">{item.name || item.title}</p>
                    <p className="text-[10px] text-gray-500">পরিমাণ: {item.quantity} টি × ৳ {item.price}</p>
                    {item.warrantyText && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-100 mt-0.5">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        <span>{item.warrantyText}</span>
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-bold text-gray-900 font-mono text-xs whitespace-nowrap pl-2">
                  ৳ {item.price * item.quantity}
                </span>
              </div>
            ))}
          </div>

          {/* আর্থিক হিসাব */}
          <div className="pt-2 border-t border-pink-100 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>প্রোডাক্ট সাবটোটাল:</span>
              <span className="font-mono">৳ {order.subtotal || order.cartTotal || 0}</span>
            </div>

            {Number(order.discountAmount) > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>কুপন ছাড় ({order.appliedCouponCode}):</span>
                <span className="font-mono">-৳ {order.discountAmount}</span>
              </div>
            )}

            {Number(order.walletUsedAmount) > 0 && (
              <div className="flex justify-between text-purple-700 font-semibold">
                <span>ওয়ালেট ব্যালেন্স পরিশোধ:</span>
                <span className="font-mono">-৳ {order.walletUsedAmount}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>ডেলিভারি চার্জ:</span>
              <span className="font-mono">৳ {order.deliveryCharge || order.shippingCost || 0}</span>
            </div>

            <div className="flex justify-between text-gray-700 font-semibold pt-1">
              <span>পেমেন্ট মাধ্যম:</span>
              <span className="font-bold text-pink-600">{order.paymentMethodName || 'ক্যাশ অন ডেলিভারি (COD)'}</span>
            </div>

            <div className="flex justify-between items-center font-bold text-sm text-gray-900 pt-2 border-t border-pink-200 bg-pink-100/50 p-3 rounded-2xl">
              <div>
                <span className="block text-gray-900">ডেলিভারির সময় ক্যাশ প্রদেয় (Cash Due):</span>
                <span className="text-[10px] text-gray-500 font-normal">পার্সেল রিসিভ করার সময় ক্যাশে পরিশোধ করবেন</span>
              </div>
              <span className="text-xl font-mono text-pink-600 font-black">
                ৳ {dueAmount}
              </span>
            </div>
          </div>
        </div>

        {/* আশ্বস্তকরণ বার্তা */}
        <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 flex items-center gap-2.5 text-left text-xs text-emerald-800">
          <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>পার্সেল পাওয়ার পর খুলে দেখে নিশ্চিত হয়ে ক্যাশ অন ডেলিভারিতে সম্পূর্ণ টাকা পরিশোধ করুন। কোনো অগ্রিম ফি নেই।</span>
        </div>

        {/* অ্যাকশন বাটনসমূহ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            href={`/track-order?orderId=${order.id || order.orderId}`}
            className="w-full py-3.5 text-white rounded-2xl text-xs font-bold shadow-md transition text-center flex items-center justify-center gap-1.5 active:scale-95"
            style={{ backgroundColor: config.primaryColor || '#DB2777' }}
          >
            <Truck className="w-4 h-4" />
            <span>অর্ডার ও লাইভ সার্ভিস ট্র্যাক করুন</span>
          </Link>
          <Link
            href={currentUser ? '/account' : '/collections'}
            className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-2xl text-xs font-bold transition text-center active:scale-95"
          >
            {currentUser ? 'আমার অ্যাকাউন্ট (My Account)' : 'আরও কেনাকাটা করুন (Shop More)'}
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FFF5F6] flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-pink-100 text-center max-w-sm w-full space-y-4">
            <Clock className="w-8 h-8 animate-spin text-pink-600 mx-auto" />
            <p className="text-sm text-gray-600">অর্ডার নিশ্চিতকরণ লোড হচ্ছে...</p>
          </div>
        </div>
      }
    >
      <OrderSuccessContent />
    </Suspense>
  );
}
