'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { useAuth } from '@/context/AuthContext';
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
  ShoppingBag,
  User,
  Shield
} from 'lucide-react';

function TrackOrderContent() {
  const { config } = useSiteConfig();
  const { currentUser, currentAdmin } = useAuth();
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
      className="min-h-screen py-10 px-4 sm:px-8 transition-colors duration-300 print:p-0 print:m-0 print:bg-white"
      style={{ backgroundColor: config.accentBgColor || '#FFF5F6' }}
    >
      <div className="no-print max-w-4xl mx-auto space-y-8">
        
        {/* টপ ন্যাভবার ও ব্যাক বাটন */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b border-pink-100 gap-3">
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
          <div className="flex items-center gap-2">
            {currentAdmin ? (
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-pink-700 bg-pink-50 border border-pink-200 hover:bg-pink-100 transition shadow-xs"
              >
                <Shield className="w-3.5 h-3.5 text-pink-600" />
                <span>অ্যাডমিন</span>
              </Link>
            ) : currentUser ? (
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-pink-700 bg-pink-50 border border-pink-200 hover:bg-pink-100 transition shadow-xs"
              >
                <User className="w-3.5 h-3.5 text-pink-600" />
                <span>{currentUser.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl text-pink-700 bg-pink-50 border border-pink-200 hover:bg-pink-100 shadow-xs transition"
              >
                <User className="w-3.5 h-3.5 text-pink-600" />
                <span>লগইন / একাউন্ট</span>
              </Link>
            )}
          </div>
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

      </div> {/* closes .no-print max-w-4xl */}

      {/* ওয়ারেন্টি ক্লেইম ইনভয়েস / সার্ভিস স্লিপ মোডাল */}
      {claimModalData && (() => {
        const order = claimModalData.order || {};
        const item = claimModalData.item || {};
        const customer = order.customer || {};
        const customerName = customer.name || customer.customerName || 'সম্মানিত গ্রাহক';
        const customerPhone = customer.phone || 'N/A';
        const customerAddress = customer.address || 'ঠিকানা দেওয়া হয়নি';
        const customerArea = customer.area || customer.district || '';
        const orderId = order.orderId || order.id || 'N/A';
        const cleanId = String(orderId).replace('FLM-', '');
        const claimId = `CLM-${cleanId}`;
        const claimDate = new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' });
        const remainingDays = claimModalData.remainingDays;
        const warrantyText = item.warrantyText || (item.warrantyDays ? `${item.warrantyDays} দিনের ওয়ারেন্টি` : 'অফিসিয়াল সিলভার ওয়ারেন্টি');
        const expiryDate = item.expiryDateFormatted || (item.expiryTimestamp ? new Date(item.expiryTimestamp).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : 'সক্রিয়');
        const itemQty = item.quantity || 1;
        const itemPrice = item.price || 0;
        const itemTotal = itemPrice * itemQty;

        // কুরিয়ার রিটার্ন ও হাব ঠিকানা (কনফিগ বা ডিফল্ট ফলব্যাক)
        const returnRecipient = config.returnRecipient || `${config.brandName || 'FLAMINGO'} Silver Care Hub`;
        const returnAddress = config.returnAddress || 'বাড়ি নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা - ১২০৫';
        const returnPhone = config.returnPhone || config.hotline || config.phone || '01700-000000';

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:static print:bg-white print:backdrop-none print:overflow-visible">
            <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-pink-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200 print:max-w-none print:w-full print:shadow-none print:border-none print:rounded-none">
              
              {/* মোডাল হেডার বাটনসমূহ (নো-প্রিন্ট) */}
              <div className="no-print p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-pink-600" /> অফিসিয়াল ওয়ারেন্টি সার্ভিস স্লিপ
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" /> প্রিন্ট / সেভ PDF
                  </button>
                  <button
                    onClick={() => setClaimModalData(null)}
                    className="p-1.5 rounded-xl hover:bg-gray-200 text-gray-500 transition"
                    title="বন্ধ করুন"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* প্রিন্টযোগ্য স্লিপ কনটেন্ট (#warranty-print-area) */}
              <div 
                id="warranty-print-area" 
                className="p-6 sm:p-8 space-y-5 bg-white text-gray-900 text-xs print:p-4 print:space-y-4 print:text-black"
              >
                {/* ১. স্লিপ ব্র্যান্ডিং ও শিরোনাম */}
                <div className="text-center pb-4 border-b-2 border-pink-100 print:border-black space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-wider uppercase" style={{ color: config.primaryColor || '#DB2777' }}>
                    {config.brandName || 'FLAMINGO'}
                  </h2>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest font-medium print:text-black">
                    {config.tagline || 'Elegance That Endures'} • 925 Sterling Silver Care
                  </p>
                  <div className="inline-block mt-2 bg-pink-50 text-pink-800 print:bg-white print:text-black px-4 py-1 rounded-full text-xs font-bold border border-pink-200 print:border-black">
                    ওয়ারেন্টি সার্ভিস ও রিটার্ন স্লিপ (Warranty Claim Memo)
                  </div>
                </div>

                {/* ২. ক্লেইম ও অর্ডার পরিচিতি গ্রিড */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-pink-50/40 print:bg-white p-3.5 rounded-2xl border border-pink-100 print:border-black">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 print:text-black uppercase block">অর্ডার আইডি:</span>
                    <p className="font-mono font-bold text-gray-900 print:text-black text-xs sm:text-sm">{orderId}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 print:text-black uppercase block">ক্লেইম আইডি:</span>
                    <p className="font-mono font-bold text-pink-600 print:text-black text-xs sm:text-sm">{claimId}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 print:text-black uppercase block">ক্লেইমের তারিখ:</span>
                    <p className="font-semibold text-gray-800 print:text-black text-xs">{claimDate}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-500 print:text-black uppercase block">ওয়ারেন্টি স্ট্যাটাস:</span>
                    <p className="font-bold text-emerald-700 print:text-black text-xs">
                      সক্রিয় (আর {remainingDays} দিন)
                    </p>
                  </div>
                </div>

                {/* ৩. কাস্টমার ডেলিভারি তথ্য */}
                <div className="p-3.5 rounded-2xl border border-gray-200 print:border-black bg-gray-50/40 print:bg-white space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 print:text-black text-xs uppercase tracking-wide border-b border-gray-200 print:border-black pb-1">
                    <Phone className="w-3.5 h-3.5 text-pink-600 print:text-black" />
                    <span>কাস্টমার ও ডেলিভারি বিবরণ:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-0.5">
                    <div>
                      <span className="text-[10px] text-gray-500 print:text-black block">গ্রাহকের নাম:</span>
                      <strong className="text-gray-900 print:text-black">{customerName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 print:text-black block">মোবাইল নম্বর:</span>
                      <strong className="text-gray-900 print:text-black font-mono">{customerPhone}</strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-[10px] text-gray-500 print:text-black block">ডেলিভারি ঠিকানা:</span>
                      <p className="text-gray-800 print:text-black font-medium">
                        {customerAddress} {customerArea && `(${customerArea})`}
                      </p>
                    </div>
                    {customer.note && (
                      <div className="sm:col-span-2 pt-1 border-t border-gray-200 print:border-black text-[11px] text-gray-600 print:text-black italic">
                        <strong>অর্ডার নোট:</strong> {customer.note}
                      </div>
                    )}
                  </div>
                </div>

                {/* ৪. ক্লেইমকৃত প্রোডাক্ট ও সেবা বিবরণ */}
                <div className="p-3.5 rounded-2xl border border-gray-200 print:border-black bg-gray-50/40 print:bg-white space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 print:text-black text-xs uppercase tracking-wide border-b border-gray-200 print:border-black pb-1">
                    <Sparkles className="w-3.5 h-3.5 text-pink-600 print:text-black" />
                    <span>সার্ভিসিং ও পলিশিংয়ের জন্য নির্ধারিত গহনা:</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white print:bg-white p-3 rounded-xl border border-gray-200 print:border-black">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-gray-900 print:text-black text-xs sm:text-sm">{item.name}</h4>
                      <p className="text-[11px] text-gray-600 print:text-black">
                        পরিমাণ: <strong>{itemQty} টি</strong> • রেগুলার মূল্য: <strong>৳ {itemPrice}</strong> • মোট: <strong>৳ {itemTotal}</strong>
                      </p>
                      <div className="flex items-center gap-2 pt-0.5 text-[11px]">
                        <span className="font-semibold text-pink-700 print:text-black">
                          {warrantyText}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-emerald-700 print:text-black">
                          অবশিষ্ট মেয়াদ: আর {remainingDays} দিন (মেয়াদ শেষ: {expiryDate})
                        </span>
                      </div>
                    </div>
                    <div className="text-right sm:border-l border-gray-200 print:border-black sm:pl-4">
                      <span className="text-[10px] text-gray-500 print:text-black block">সার্ভিস ফি:</span>
                      <span className="font-bold text-emerald-600 print:text-black text-xs sm:text-sm">৳ ০ (ফ্রি ওয়ারেন্টি)</span>
                    </div>
                  </div>
                </div>

                {/* ৫. কুরিয়ার রিটার্ন ও হাব ঠিকানা (Return Courier Address) */}
                <div className="p-4 rounded-2xl border-2 border-dashed border-gray-900 print:border-black bg-gray-50/90 print:bg-white space-y-2.5">
                  <div className="flex items-center justify-between border-b border-gray-300 print:border-black pb-1.5">
                    <div className="flex items-center gap-2 font-bold text-gray-900 print:text-black text-xs uppercase tracking-wide">
                      <Truck className="w-4 h-4 text-pink-600 print:text-black flex-shrink-0" />
                      <span>গহনা পাঠানোর ঠিকানা (Return Courier Address):</span>
                    </div>
                    <span className="text-[10px] font-bold bg-pink-100 text-pink-900 print:bg-white print:text-black px-2.5 py-0.5 rounded-full border border-pink-200 print:border-black">
                      Silver Care Hub
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs leading-relaxed">
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 print:text-black uppercase block">প্রাপক / Care Hub:</span>
                      <strong className="text-sm font-bold text-gray-900 print:text-black font-serif">
                        {returnRecipient}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-500 print:text-black uppercase block">হেল্পলাইন / হোয়াটসঅ্যাপ:</span>
                      <strong className="text-sm font-bold text-gray-900 print:text-black font-mono">
                        {returnPhone}
                      </strong>
                    </div>
                    <div className="sm:col-span-2 pt-1 border-t border-gray-200 print:border-black">
                      <span className="text-[10px] font-bold text-gray-500 print:text-black uppercase block">সম্পূর্ণ ঠিকানা:</span>
                      <p className="font-semibold text-gray-900 print:text-black text-xs sm:text-sm">
                        {returnAddress}
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-600 print:text-black italic pt-1 border-t border-gray-200 print:border-black">
                    * কুরিয়ার সার্ভিসে (যেমন: Steadfast / RedX / Sundarban / eCourier) পার্সেল বুক করার সময় প্রাপক ও ঠিকানার স্থানে ওপরের তথ্যটি সঠিকভাবে লিখুন।
                  </p>
                </div>

                {/* ৬. রিটার্ন ও ফ্রি সার্ভিসিং প্যাকেজিং নির্দেশিকা চেকলিস্ট */}
                <div className="p-4 rounded-2xl border border-gray-300 print:border-black bg-gray-50/70 print:bg-white space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-gray-900 print:text-black text-xs uppercase tracking-wide border-b border-gray-200 print:border-black pb-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 print:text-black flex-shrink-0" />
                    <span>রিটার্ন ও ফ্রি সার্ভিসিং প্যাকেজিং নির্দেশিকা চেকলিস্ট:</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] leading-relaxed text-gray-800 print:text-black">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700 print:text-black flex-shrink-0 mt-0.5">[✓]</span>
                      <p>
                        <strong>সুরক্ষিত মোড়ক:</strong> গহনাটি মূল বাবল র‍্যাপ বা শক্ত জুয়েলারি বক্সে সাবধানে প্যাক করুন যাতে কুরিয়ার ট্রানজিটে কোনো চাপ বা ক্ষতি না হয়।
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700 print:text-black flex-shrink-0 mt-0.5">[✓]</span>
                      <p>
                        <strong>সার্ভিস মেমো সংযুক্তি:</strong> এই মুদ্রিত সার্ভিস স্লিপটি ভাঁজ করে পার্সেলের ভেতরে দিন (অথবা প্যাকেটের গায়ে স্পষ্ট করে <strong>অর্ডার আইডি: {orderId}</strong> ও <strong>ক্লেইম আইডি: {claimId}</strong> লিখে দিন)।
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700 print:text-black flex-shrink-0 mt-0.5">[✓]</span>
                      <p>
                        <strong>কুরিয়ার ট্র্যাকিং মেসেজ:</strong> পার্সেল কুরিয়ারে পাঠানোর পর আমাদের হেল্পলাইন / WhatsApp নম্বরে (<strong>{returnPhone}</strong>) ট্র্যাকিং নম্বরটি মেসেজ করুন।
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-emerald-700 print:text-black flex-shrink-0 mt-0.5">[✓]</span>
                      <p>
                        <strong>ডেলিভারি নিশ্চয়তা:</strong> কেয়ার হাবে পার্সেল পৌঁছানোর ৩-৫ কার্যদিবসের মধ্যে ফ্রি পলিশিং/রিপ্লেসমেন্ট সম্পন্ন করে আপনার ঠিকানায় পুনরায় ডেলিভারি দেওয়া হবে।
                      </p>
                    </div>
                  </div>
                </div>

                {/* ৭. অফিসিয়াল সিগনেচার ও সিল */}
                <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs">
                  <div>
                    <div className="border-t border-gray-400 print:border-black pt-1.5 font-bold text-gray-800 print:text-black">
                      গ্রাহকের স্বাক্ষর (Customer Signature)
                    </div>
                    <span className="text-[10px] text-gray-500 print:text-black">তারিখসহ গ্রাহক স্বাক্ষর করবেন</span>
                  </div>
                  <div>
                    <div className="border-t border-gray-400 print:border-black pt-1.5 font-bold text-gray-800 print:text-black">
                      অথরাইজড সিল ও স্বাক্ষর (FLAMINGO Care Hub)
                    </div>
                    <span className="text-[10px] text-gray-500 print:text-black">অফিসিয়াল সার্ভিস নিশ্চয়তা</span>
                  </div>
                </div>

                {/* ৮. ফুটার লাইন */}
                <div className="pt-3 border-t border-gray-200 print:border-black text-center text-[10px] text-gray-500 print:text-black">
                  {config.brandName || 'FLAMINGO'} Official Silver Care Hub • Helpline: {returnPhone} • ঢাকা, বাংলাদেশ
                </div>
              </div>

              {/* ফুটার অ্যাকশন বাটনসমূহ (নো-প্রিন্ট) */}
              <div className="no-print p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex-1 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-pink-600/25 active:scale-95"
                >
                  <Printer className="w-4 h-4" /> প্রিন্ট / PDF ডাউনলোড করুন
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
        );
      })()}

      {/* ডেডিকেটেড প্রিন্ট ও PDF স্টাইল */}
      <style jsx global>{`
        @media print {
          /* A4 সাইজ ও পরিমিত মার্জিন */
          @page {
            size: A4 portrait;
            margin: 10mm 14mm;
          }

          /* ১. সমস্ত নো-প্রিন্ট এলিমেন্ট সম্পূর্ণ হাইড করা */
          .no-print,
          .no-print * {
            display: none !important;
          }

          /* ২. বডি ও এইচটিএমএল ১০০% হোয়াইট ও ক্লিন করা */
          html, body {
            background: #ffffff !important;
            background-color: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* ৩. ফিক্সড ব্যাকড্রপ ও মোডাল ব্লার ক্লিয়ার করা */
          .fixed,
          .fixed.inset-0,
          .backdrop-blur-sm {
            position: static !important;
            background: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            display: block !important;
            overflow: visible !important;
          }

          /* ৪. ডিফল্টভাবে বডির বাকি অংশ হাইড */
          body * {
            visibility: hidden;
          }

          /* ৫. শুধুমাত্র #warranty-print-area ও এর ভেতরের কনটেন্ট দৃশ্যমান */
          #warranty-print-area,
          #warranty-print-area * {
            visibility: visible !important;
          }

          #warranty-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #000000 !important;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
          }

          /* ৬. ১০০% হাই-কনট্রাস্ট ব্ল্যাক টেক্সট (#000000) নিশ্চিতকরণ */
          #warranty-print-area,
          #warranty-print-area p,
          #warranty-print-area span,
          #warranty-print-area div,
          #warranty-print-area h1,
          #warranty-print-area h2,
          #warranty-print-area h3,
          #warranty-print-area h4,
          #warranty-print-area strong,
          #warranty-print-area b,
          #warranty-print-area li,
          #warranty-print-area td,
          #warranty-print-area th {
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* ৭. বর্ডার ও লাইনসমূহ প্রিন্টে স্পষ্ট ও গাঢ় কালো */
          #warranty-print-area .border,
          #warranty-print-area .border-t,
          #warranty-print-area .border-b,
          #warranty-print-area .border-2 {
            border-color: #000000 !important;
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
