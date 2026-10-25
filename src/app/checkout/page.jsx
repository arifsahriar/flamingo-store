'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShieldCheck, Truck, CheckCircle2, ShoppingBag } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, subtotal, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'inside_dhaka', // inside_dhaka অথবা outside_dhaka
    notes: '',
  });

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const shippingCost = formData.city === 'inside_dhaka' ? 70 : 130;
  const grandTotal = subtotal + (cart.length > 0 ? shippingCost : 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert('আপনার ব্যাগে কোনো প্রোডাক্ট নেই!');
      return;
    }

    // একটি ডামি অর্ডার আইডি তৈরি
    const newOrderId = 'FLM-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(newOrderId);
    setOrderPlaced(true);
    clearCart(); // অর্ডার হয়ে গেলে কার্ট ক্লিয়ার
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#FFF5F6] py-16 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center border border-pink-100">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-gray-900">অর্ডার সফল হয়েছে!</h2>
          <p className="text-sm text-gray-600 mt-2">
            ধন্যবাদ <strong>{formData.name}</strong>, আপনার অর্ডারটি গ্রহণ করা হয়েছে।
          </p>
          <div className="my-6 p-4 bg-pink-50/60 rounded-2xl border border-pink-100 text-left space-y-1.5 text-xs text-gray-700">
            <p><strong>অর্ডার আইডি:</strong> {orderId}</p>
            <p><strong>মোবাইল নম্বর:</strong> {formData.phone}</p>
            <p><strong>ডেলিভারি ঠিকানা:</strong> {formData.address}</p>
            <p><strong>মোট প্রদেয় টাকা (ক্যাশ অন ডেলিভারি):</strong> ৳ {grandTotal}</p>
          </div>
          <p className="text-xs text-gray-500 mb-6">
            আমাদের কাস্টমার কেয়ার টিম শীঘ্রই ফোন করে অর্ডারটি কনফার্ম করবে। পার্সেল পাওয়ার পর চেক করে পেমেন্ট করার সুযোগ রয়েছে।
          </p>
          <Link
            href="/collections"
            className="inline-block w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-sm font-semibold transition"
          >
            আরও শপিং করুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF5F6] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-gray-900 text-center mb-8">
          ক্যাশ অন ডেলিভারি চেকআউট
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* চেকআউট ফর্ম */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-pink-100">
            <h2 className="text-lg font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-pink-600" /> ডেলিভারির তথ্য দিন
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">আপনার পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: ফারিয়া ইসলাম"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-pink-200 text-sm focus:outline-none focus:border-pink-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">মোবাইল নম্বর (১১ ডিজিট) *</label>
                <input
                  type="tel"
                  required
                  placeholder="017XXXXXXXX"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-pink-200 text-sm focus:outline-none focus:border-pink-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">ডেলিভারি এরিয়া সিলেক্ট করুন *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, city: 'inside_dhaka' })}
                    className={`py-3 px-4 rounded-xl border text-xs font-medium text-left transition ${
                      formData.city === 'inside_dhaka'
                        ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    ঢাকার ভেতরে (৳৭০)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, city: 'outside_dhaka' })}
                    className={`py-3 px-4 rounded-xl border text-xs font-medium text-left transition ${
                      formData.city === 'outside_dhaka'
                        ? 'border-pink-600 bg-pink-50 text-pink-700 font-bold'
                        : 'border-gray-200 text-gray-700'
                    }`}
                  >
                    ঢাকার বাইরে (৳১৩০)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">সম্পূর্ণ ঠিকানা (বাসা/রোড/এলাকা/জেলা) *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="যেমন: বাসা নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-pink-200 text-sm focus:outline-none focus:border-pink-600"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-pink-600/30 transition active:scale-[0.99]"
                >
                  অর্ডার কনফার্ম করুন (৳ {grandTotal})
                </button>
              </div>
            </form>
          </div>

          {/* অর্ডার সামারি */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-pink-100">
              <h3 className="font-serif font-bold text-gray-900 mb-4 pb-3 border-b border-pink-50 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-pink-600" /> অর্ডার সামারি ({cart.length})
              </h3>

              <div className="max-h-60 overflow-y-auto space-y-3 mb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs text-gray-700">
                    <span className="line-clamp-1 flex-1 pr-2">{item.name || item.title} × {item.quantity}</span>
                    <span className="font-semibold">৳ {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-pink-50 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>সাবটোটাল</span>
                  <span>৳ {subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>ডেলিভারি চার্জ</span>
                  <span>৳ {shippingCost}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-pink-50">
                  <span>সর্বমোট</span>
                  <span className="text-pink-600">৳ {grandTotal}</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-600 flex-shrink-0" />
              <p className="text-xs text-emerald-800 leading-relaxed">
                ১০০% খাঁটি ৯২৫ সিলভার সার্টিফিকেট সহ ডেলিভারি এবং পার্সেল খুলে চেক করে টাকা দেওয়ার সুযোগ।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}