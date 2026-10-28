'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { 
  Search, 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Phone, 
  MapPin, 
  Calendar, 
  ArrowLeft, 
  Printer, 
  X, 
  ExternalLink,
  AlertCircle,
  FileText,
  BadgeAlert,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

function TrackOrderContent() {
  const { config } = useSiteConfig();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [matchedOrders, setMatchedOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);

  // ক্লেইম মোডাল স্টেট
  const [claimModalData, setClaimModalData] = useState(null);

  // লোকাল স্টোরেজ থেকে সব অর্ডার লোড করা
  useEffect(() => {
    try {
      const stored = localStorage.getItem('flamingo_orders');
      if (stored) {
        const parsed = JSON.parse(stored);
        setAllOrders(parsed);

        // URL কুয়েরি প্যারাম থেকে সার্চ হ্যান্ডেল করা (যেমন ?orderId=FLM-XXXXXX বা ?q=017...)
        const initialQuery = searchParams.get('orderId') || searchParams.get('id') || searchParams.get('q') || searchParams.get('phone');
        if (initialQuery) {
          setSearchQuery(initialQuery);
          executeSearch(initialQuery, parsed);
        }
      }
    } catch (err) {
      console.error('Failed to load orders from localStorage:', err);
    }
  }, [searchParams]);

  const executeSearch = (query, ordersList = allOrders) => {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      setMatchedOrders([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);
    const results = ordersList.filter((ord) => {
      const orderId = (ord.orderId || ord.id || '').toLowerCase();
      const phone = (ord.customer?.phone || '').toLowerCase();
      const name = (ord.customer?.name || ord.customer?.customerName || '').toLowerCase();

      // আইডি বা ফোন নম্বরের সাথে মিল পাওয়া
      return orderId.includes(q) || phone.includes(q) || name.includes(q);
    });

    setMatchedOrders(results);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  // স্ট্যাটাস অনুসারে ব্যাজ ও প্রগ্রেস
  const getStatusInfo = (status = '') => {
    if (status.includes('Delivered') || status.includes('সম্পন্ন')) {
      return {
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
        step: 4,
        text: 'ডেলিভারি সম্পন্ন (Delivered)',
      };
    }
    if (status.includes('Shipped') || status.includes('পাঠানো হয়েছে')) {
      return {
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: <Truck className="w-4 h-4 text-purple-600" />,
        step: 3,
        text: 'ডেলিভারিতে পাঠানো হয়েছে (Shipped)',
      };
    }
    if (status.includes('Processing') || status.includes('প্রসেসিং')) {
      return {
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <Clock className="w-4 h-4 text-blue-600" />,
        step: 2,
        text: 'প্রসেসিং চলছে (Processing)',
      };
    }
    if (status.includes('Cancelled') || status.includes('বাতিল')) {
      return {
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: <XCircle className="w-4 h-4 text-rose-600" />,
        step: 0,
        text: 'বাতিল করা হয়েছে (Cancelled)',
      };
    }
    return {
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <AlertCircle className="w-4 h-4 text-amber-600" />,
      step: 1,
      text: 'নতুন অর্ডার (Pending)',
    };
  };

  // ক্লেইম স্লিপ প্রিন্ট করা
  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="min-h-screen py-10 px-4 sm:px-8 transition-colors duration-300"
      style={{ backgroundColor: config.accentBgColor || '#FFF5F6' }}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* টপ ন্যাভবার ও ব্যাক বাটন */}
        <div className="flex items-center justify-between pb-4 border-b border-pink-100">
          <Link 
            href="/collections" 
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-pink-600 transition"
          >
            <ArrowLeft className="w-4 h-4" /> শপে ফিরে যান
          </Link>
          <span 
            className="text-xs sm:text-sm font-serif font-bold tracking-wider uppercase" 
            style={{ color: config.primaryColor || '#DB2777' }}
          >
            {config.brandName || 'FLAMINGO'} অর্ডার ও ওয়ারেন্টি ট্র্যাকার
          </span>
        </div>

        {/* সার্চ হেডার কার্ড */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-pink-100 shadow-sm text-center space-y-4">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-sm"
            style={{ backgroundColor: '#FDF2F8', color: config.primaryColor || '#DB2777' }}
          >
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900">
              আপনার অর্ডার ও লাইভ ওয়ারেন্টি ট্র্যাক করুন
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-lg mx-auto">
              অর্ডারের সময় পাওয়া অর্ডার আইডি (যেমন: <code>FLM-XXXXXX</code>) অথবা আপনার ১১ ডিজিটের মোবাইল নম্বর দিন।
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="অর্ডার আইডি (FLM-...) অথবা মোবাইল নম্বর"
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-pink-200 text-xs sm:text-sm focus:outline-pink-500 bg-pink-50/20"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:opacity-95 transition active:scale-95 flex items-center gap-1.5 flex-shrink-0"
              style={{ backgroundColor: config.primaryColor || '#DB2777' }}
            >
              <Search className="w-4 h-4" /> ট্র্যাক করুন
            </button>
          </form>
        </div>

        {/* সার্চ ফলাফল */}
        {hasSearched && (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-base font-serif font-bold text-gray-900">
                সার্চ ফলাফল ({matchedOrders.length})
              </h2>
              {matchedOrders.length > 0 && (
                <span className="text-xs text-gray-500">
                  সর্বশেষ আপডেট: রিয়েল-টাইম
                </span>
              )}
            </div>

            {matchedOrders.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl border border-pink-100 text-center space-y-3 shadow-sm">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-serif font-bold text-gray-800">কোনো অর্ডার খুঁজে পাওয়া যায়নি</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  দুঃখিত, <strong>"{searchQuery}"</strong> দিয়ে কোনো অর্ডার মেলেনি। অনুগ্রহ করে সঠিক অর্ডার আইডি বা মোবাইল নম্বর দিয়ে পুনরায় চেষ্টা করুন।
                </p>
              </div>
            ) : (
              matchedOrders.map((order) => {
                const orderId = order.orderId || order.id;
                const customer = order.customer || {};
                const customerName = customer.name || customer.customerName || 'কাস্টমার';
                const customerPhone = customer.phone || 'N/A';
                const customerAddress = customer.address || '';
                const customerArea = customer.area || customer.district || '';
                const statusInfo = getStatusInfo(order.status);
                const items = order.items || [];

                return (
                  <div 
                    key={orderId}
                    className="bg-white rounded-3xl border border-pink-100 shadow-sm p-6 sm:p-8 space-y-6 transition hover:shadow-md"
                  >
                    {/* অর্ডার হেডলাইন ও স্ট্যাটাস */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-pink-100 gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-xl border border-pink-100">
                            {orderId}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" /> {order.date}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          প্রাপক: <strong className="text-gray-900">{customerName}</strong> ({customerPhone})
                        </p>
                      </div>

                      <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-semibold text-xs ${statusInfo.badge}`}>
                        {statusInfo.icon}
                        <span>{statusInfo.text}</span>
                      </div>
                    </div>

                    {/* ডেলিভারি স্ট্যাটাস প্রগ্রেস বার */}
                    {statusInfo.step > 0 && (
                      <div className="bg-pink-50/40 p-4 sm:p-5 rounded-2xl border border-pink-100/80">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          ডেলিভারি ট্র্যাকিং ধাপসমূহ
                        </p>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className={`p-2 rounded-xl transition ${statusInfo.step >= 1 ? 'bg-pink-600 text-white font-bold shadow-xs' : 'bg-gray-100 text-gray-400'}`}>
                            ১. অর্ডার গ্রহণ
                          </div>
                          <div className={`p-2 rounded-xl transition ${statusInfo.step >= 2 ? 'bg-pink-600 text-white font-bold shadow-xs' : 'bg-gray-100 text-gray-400'}`}>
                            ২. প্রসেসিং
                          </div>
                          <div className={`p-2 rounded-xl transition ${statusInfo.step >= 3 ? 'bg-pink-600 text-white font-bold shadow-xs' : 'bg-gray-100 text-gray-400'}`}>
                            ৩. কুরিয়ারে হস্তান্তর
                          </div>
                          <div className={`p-2 rounded-xl transition ${statusInfo.step >= 4 ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'bg-gray-100 text-gray-400'}`}>
                            ৪. ডেলিভারি সম্পন্ন
                          </div>
                        </div>
                      </div>
                    )}

                    {/* প্রোডাক্ট আইটেম ও লাইভ ওয়ারেন্টি ক্যালকুলেশন */}
                    <div className="space-y-3">
                      <h3 className="font-serif font-bold text-sm text-gray-900 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-pink-600" /> অর্ডারকৃত গহনা ও লাইভ ওয়ারেন্টি স্ট্যাটাস
                      </h3>

                      <div className="space-y-3">
                        {items.map((item, idx) => {
                          const hasWarranty = Boolean(item.hasWarranty);
                          const expiryTimestamp = item.expiryTimestamp || (item.warrantyDays > 0 && order.orderTimestamp ? order.orderTimestamp + item.warrantyDays * 86400000 : null);
                          
                          // লাইভ রিমেইনিং ডেজ ক্যালকুলেশন
                          const remainingDays = expiryTimestamp 
                            ? Math.ceil((expiryTimestamp - Date.now()) / (1000 * 60 * 60 * 24)) 
                            : null;
                          
                          const isWarrantyActive = hasWarranty && remainingDays !== null && remainingDays > 0;
                          const isExpired = hasWarranty && remainingDays !== null && remainingDays <= 0;

                          return (
                            <div 
                              key={idx}
                              className="p-4 rounded-2xl border border-pink-100/80 bg-white hover:bg-pink-50/20 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3.5 min-w-0">
                                <img
                                  src={item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'}
                                  alt={item.name}
                                  className="w-14 h-14 object-cover rounded-xl border border-pink-100 bg-pink-50 flex-shrink-0"
                                />
                                <div className="min-w-0 space-y-1">
                                  <h4 className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                                    {item.name}
                                  </h4>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>পরিমাণ: <strong>{item.quantity} টি</strong></span>
                                    <span>•</span>
                                    <span className="font-bold text-gray-900 font-mono">৳ {item.price * item.quantity}</span>
                                  </div>

                                  {/* লাইভ ওয়ারেন্টি স্ট্যাটাস ব্যাজ */}
                                  <div>
                                    {isWarrantyActive && (
                                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                                        <span>ওয়ারেন্টি সক্রিয়: আর {remainingDays} দিন বাকি</span>
                                      </span>
                                    )}
                                    {isExpired && (
                                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-lg">
                                        <BadgeAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                                        <span>মেয়াদ উত্তীর্ণ ({item.expiryDateFormatted || 'সময়সীমা সমাপ্ত'})</span>
                                      </span>
                                    )}
                                    {!hasWarranty && (
                                      <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-lg">
                                        ওয়ারেন্টি প্রযোজ্য নয়
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* ক্লেইম বাটন */}
                              <div className="w-full sm:w-auto flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
                                {isWarrantyActive ? (
                                  <button
                                    onClick={() => setClaimModalData({ order, item, remainingDays })}
                                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition flex items-center justify-center gap-1.5"
                                  >
                                    <ShieldCheck className="w-3.5 h-3.5" /> Claim Warranty / ক্লেইম করুন
                                  </button>
                                ) : (
                                  <button
                                    disabled
                                    className="w-full sm:w-auto px-4 py-2 bg-gray-100 text-gray-400 cursor-not-allowed rounded-xl text-xs font-semibold"
                                  >
                                    Claim Unavailable
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* কাস্টমার ও ডেলিভারি বিবরণ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-pink-100 text-xs">
                      <div className="space-y-1.5 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                        <span className="font-semibold text-gray-800 block">ডেলিভারি ঠিকানা:</span>
                        <p className="text-gray-600 flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-pink-600 mt-0.5 flex-shrink-0" />
                          <span>{customerAddress} {customerArea && `(${customerArea})`}</span>
                        </p>
                        {customer.note && (
                          <p className="text-gray-500 italic pt-1">
                            <strong>নোট:</strong> {customer.note}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5 bg-gray-50/70 p-3.5 rounded-2xl border border-gray-100">
                        <div className="flex justify-between text-gray-600">
                          <span>প্রোডাক্ট সাবটোটাল:</span>
                          <span>৳ {order.subtotal || order.cartTotal || 0}</span>
                        </div>
                        {(order.appliedCouponCode || order.discountAmount > 0) && (
                          <div className="flex justify-between text-emerald-700 font-semibold bg-emerald-50/80 px-2 py-1 rounded-lg border border-emerald-100">
                            <span>কুপন ছাড় ({order.appliedCouponCode || 'ডিসকাউন্ট'}):</span>
                            <span>-৳ {order.discountAmount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-gray-600">
                          <span>ডেলিভারি চার্জ:</span>
                          <span>৳ {order.deliveryCharge || order.shippingCost || 0}</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm text-gray-900 pt-1 border-t border-gray-200">
                          <span>সর্বমোট (ক্যাশ অন ডেলিভারি):</span>
                          <span className="text-pink-600 font-mono text-base">৳ {order.grandTotal}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ওয়ারেন্টি ক্লেইম ইনভয়েস / সার্ভিস স্লিপ মোডাল */}
        {claimModalData && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-lg w-full rounded-3xl shadow-2xl border border-pink-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
              
              {/* মোডাল হেডার বাটনসমূহ (প্রিন্ট ছাড়া বাকি সময় দৃশ্যমান) */}
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between print:hidden">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-pink-600" /> অফিসিয়াল ওয়ারেন্টি সার্ভিস স্লিপ
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" /> প্রিন্ট / ডাউনলোড মেমো
                  </button>
                  <button
                    onClick={() => setClaimModalData(null)}
                    className="p-1.5 rounded-xl hover:bg-gray-200 text-gray-500 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* প্রিন্টযোগ্য স্লিপ কনটেন্ট */}
              <div id="printable-warranty-slip" className="p-6 sm:p-8 space-y-5 bg-white text-gray-900 text-xs">
                {/* স্লিপ হেডার */}
                <div className="text-center pb-4 border-b-2 border-pink-100 space-y-1">
                  <h2 className="text-2xl font-serif font-black tracking-wider uppercase" style={{ color: config.primaryColor || '#DB2777' }}>
                    {config.brandName || 'FLAMINGO'}
                  </h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                    {config.tagline || 'Elegance That Endures'}
                  </p>
                  <div className="inline-block mt-2 bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-xs font-bold border border-pink-200">
                    ওয়ারেন্টি সার্ভিস ও রিটার্ন স্লিপ (Warranty Claim Memo)
                  </div>
                </div>

                {/* ক্লেইম ও অর্ডার পরিচিতি */}
                <div className="grid grid-cols-2 gap-3 bg-pink-50/30 p-3.5 rounded-2xl border border-pink-100">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">অর্ডার আইডি</p>
                    <p className="font-mono font-bold text-gray-900">{claimModalData.order.orderId || claimModalData.order.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">ক্লেইম আইডি</p>
                    <p className="font-mono font-bold text-pink-600">
                      CLM-{String(claimModalData.order.orderId || claimModalData.order.id).replace('FLM-', '')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">ক্লেইমের তারিখ</p>
                    <p className="font-medium text-gray-800">
                      {new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase">ওয়ারেন্টি মেয়াদ শেষ</p>
                    <p className="font-medium text-emerald-700">
                      {claimModalData.item.expiryDateFormatted || 'সক্রিয়'}
                    </p>
                  </div>
                </div>

                {/* কাস্টমার তথ্য */}
                <div className="space-y-1 border-b border-gray-100 pb-3">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-pink-600">কাস্টমার তথ্য:</h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <p><strong>নাম:</strong> {claimModalData.order.customer?.name || claimModalData.order.customer?.customerName}</p>
                    <p><strong>ফোন:</strong> {claimModalData.order.customer?.phone}</p>
                    <p className="col-span-2"><strong>ঠিকানা:</strong> {claimModalData.order.customer?.address} ({claimModalData.order.customer?.area || claimModalData.order.customer?.district})</p>
                  </div>
                </div>

                {/* ক্লেইমকৃত প্রোডাক্ট বিবরণ */}
                <div className="space-y-2 border-b border-gray-100 pb-3">
                  <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider text-pink-600">প্রোডাক্ট ও সেবা বিবরণ:</h4>
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div>
                      <p className="font-bold text-gray-900">{claimModalData.item.name}</p>
                      <p className="text-[10px] text-gray-500">পরিমাণ: {claimModalData.item.quantity} টি | {claimModalData.item.warrantyText}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">অবশিষ্ট ওয়ারেন্টি: {claimModalData.remainingDays} দিন</p>
                    </div>
                    <span className="font-mono font-bold text-gray-900">৳ {claimModalData.item.price * claimModalData.item.quantity}</span>
                  </div>
                </div>

                {/* রিটার্ন প্যাকেজিং ও সার্ভিস নির্দেশনা */}
                <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-[11px] text-emerald-900 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>রিটার্ন ও ফ্রি সার্ভিসিং প্যাকেজিং নির্দেশিকা:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-[10.5px] leading-relaxed">
                    <li>গহনাটি মূল বাবল র‍্যাপ বা বক্সে সাবধানে প্যাক করুন যাতে ট্রানজিটে বাঁকা না হয়।</li>
                    <li>এই সার্ভিস স্লিপটি প্রিন্ট করে পার্সেলের ভেতরে যুক্ত করুন (অথবা অর্ডার আইডি লিখুন)।</li>
                    <li>আমাদের সাপোর্ট টিমে <strong>{claimModalData.order.customer?.phone}</strong> থেকে মেসেজ দিয়ে পার্সেল পিকআপ বুক করুন।</li>
                    <li>পার্সেল পৌঁছানোর ৩-৫ কার্যদিবসের মধ্যে পলিশিং/রিপ্লেসমেন্ট সম্পন্ন করে ফেরত পাঠানো হবে।</li>
                  </ol>
                </div>

                <div className="pt-2 text-center text-[10px] text-gray-400">
                  FLAMINGO Official Silver Care • Helpline: 01700-000000 • ঢাকা, বাংলাদেশ
                </div>
              </div>

              {/* ফুটার বাটনসমূহ */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 print:hidden">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-pink-600/25"
                >
                  <Printer className="w-4 h-4" /> প্রিন্ট / সেভ করুন
                </button>
                <button
                  onClick={() => setClaimModalData(null)}
                  className="px-5 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-semibold transition"
                >
                  বন্ধ করুন
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* প্রিন্ট সিএসএস স্টাইল */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-warranty-slip,
          #printable-warranty-slip * {
            visibility: visible;
          }
          #printable-warranty-slip {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFF5F6] flex items-center justify-center text-sm text-gray-500">লোড হচ্ছে...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}
