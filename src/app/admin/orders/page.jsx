'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, 
  Phone, 
  MapPin, 
  Calendar, 
  Trash2, 
  ArrowLeft, 
  Clock, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  ShieldCheck, 
  AlertCircle,
  Search,
  Filter,
  DollarSign,
  ShoppingBag,
  ExternalLink,
  Tag,
  LayoutTemplate,
  Sparkles
} from 'lucide-react';
import { useSiteConfig } from '@/context/SiteConfigContext';

export const STATUS_OPTIONS = [
  'নতুন অর্ডার (Pending)',
  'প্রসেসিং চলছে (Processing)',
  'ডেলিভারিতে পাঠানো হয়েছে (Shipped)',
  'ডেলিভারি সম্পন্ন (Delivered)',
  'বাতিল করা হয়েছে (Cancelled)',
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { config } = useSiteConfig();

  // লোকাল স্টোরেজ থেকে অর্ডার লোড করা
  useEffect(() => {
    try {
      const saved = localStorage.getItem('flamingo_orders');
      if (saved) {
        setOrders(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading orders from localStorage:', e);
    }
  }, []);

  // স্ট্যাটাস পরিবর্তন করা
  const handleStatusChange = (orderId, newStatus) => {
    const updated = orders.map((ord) => {
      const currentId = ord.orderId || ord.id;
      return currentId === orderId ? { ...ord, status: newStatus } : ord;
    });
    setOrders(updated);
    try {
      localStorage.setItem('flamingo_orders', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving updated status:', e);
    }
  };

  // অর্ডার ডিলিট করা
  const handleDeleteOrder = (orderId) => {
    if (confirm(`আপনি কি নিশ্চিত যে অর্ডার "${orderId}" মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না।`)) {
      const updated = orders.filter((ord) => (ord.orderId || ord.id) !== orderId);
      setOrders(updated);
      try {
        localStorage.setItem('flamingo_orders', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving after delete:', e);
      }
    }
  };

  // স্ট্যাটাস অনুসারে ব্যাজ কালার ও আইকন
  const getStatusBadge = (status) => {
    if (status.includes('Delivered') || status.includes('সম্পন্ন')) {
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      };
    }
    if (status.includes('Shipped') || status.includes('পাঠানো হয়েছে')) {
      return {
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        icon: <Truck className="w-3.5 h-3.5 text-purple-600" />,
      };
    }
    if (status.includes('Processing') || status.includes('প্রসেসিং')) {
      return {
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        icon: <Clock className="w-3.5 h-3.5 text-blue-600" />,
      };
    }
    if (status.includes('Cancelled') || status.includes('বাতিল')) {
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: <XCircle className="w-3.5 h-3.5 text-rose-600" />,
      };
    }
    return {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <AlertCircle className="w-3.5 h-3.5 text-amber-600" />,
    };
  };

  // ফিল্টার ও সার্চ লজিক
  const filteredOrders = orders.filter((order) => {
    const id = (order.orderId || order.id || '').toLowerCase();
    const name = (order.customer?.name || order.customer?.customerName || '').toLowerCase();
    const phone = (order.customer?.phone || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    const matchesSearch = !q || id.includes(q) || name.includes(q) || phone.includes(q);
    const matchesFilter = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesFilter;
  });

  // সামারি পরিসংখ্যান
  const totalRevenue = orders
    .filter((o) => !o.status.includes('Cancelled'))
    .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0);
  const pendingCount = orders.filter((o) => o.status.includes('Pending')).length;
  const deliveredCount = orders.filter((o) => o.status.includes('Delivered')).length;

  return (
    <div className="min-h-screen bg-[#FDF9FA] py-8 sm:py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* টপ হেডার ও নেভিগেশন */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-pink-100 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 text-xs font-semibold">
              <Link 
                href="/admin/settings" 
                className="text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
              >
                <LayoutTemplate className="w-3.5 h-3.5" /> থিম সেটিংস
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Package className="w-3.5 h-3.5" /> অর্ডার ম্যানেজমেন্ট
              </span>
              <span className="text-gray-300">|</span>
              <Link 
                href="/admin/products" 
                className="text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5" /> প্রোডাক্ট ক্যাটালগ
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/collections" 
                target="_blank"
                className="text-gray-400 hover:text-gray-700 flex items-center gap-1"
              >
                <span>স্টোরফ্রন্ট</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 flex items-center gap-2.5">
              <Package className="w-7 h-7 text-pink-600" /> FLAMINGO অর্ডার ম্যানেজমেন্ট
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              ক্যাশ অন ডেলিভারি অর্ডার তালিকা, কাস্টমার ডিটেইলস ও আইটেম-লেভেল ওয়ারেন্টি ট্র্যাকিং।
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold bg-pink-50 text-pink-700 px-3 py-1.5 rounded-xl border border-pink-100">
              মোট অর্ডার: {orders.length} টি
            </span>
          </div>
        </div>

        {/* সামারি মেট্রিক কার্ডসমূহ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
              <span>মোট অর্ডার</span>
              <ShoppingBag className="w-4 h-4 text-pink-500" />
            </div>
            <p className="text-2xl font-bold text-gray-900 font-mono">{orders.length}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm">
            <div className="flex items-center justify-between text-amber-600 text-xs mb-1">
              <span>নতুন (Pending)</span>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600 font-mono">{pendingCount}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600 text-xs mb-1">
              <span>ডেলিভারি সম্পন্ন</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 font-mono">{deliveredCount}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm">
            <div className="flex items-center justify-between text-pink-600 text-xs mb-1">
              <span>মোট রেভিনিউ</span>
              <DollarSign className="w-4 h-4 text-pink-500" />
            </div>
            <p className="text-2xl font-bold text-pink-600 font-mono">৳ {totalRevenue.toLocaleString('en-US')}</p>
          </div>
        </div>

        {/* সার্চ ও ফিল্টার বার */}
        <div className="bg-white p-4 rounded-2xl border border-pink-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="অর্ডার আইডি, কাস্টমার নাম বা ফোন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-gray-50/50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-medium transition flex-shrink-0 ${
                statusFilter === 'ALL'
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              সবগুলো ({orders.length})
            </button>
            {STATUS_OPTIONS.map((opt) => {
              const count = orders.filter((o) => o.status === opt).length;
              return (
                <button
                  key={opt}
                  onClick={() => setStatusFilter(opt)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition flex-shrink-0 whitespace-nowrap ${
                    statusFilter === opt
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.split(' ')[0]} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* অর্ডার তালিকা */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-pink-100 max-w-md mx-auto shadow-sm">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-gray-800 text-base">কোনো অর্ডার পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-500 mt-1 mb-5">
              {orders.length === 0 
                ? 'এখনো কোনো অর্ডার জমা পড়েনি। চেকআউট পেজ থেকে একটি অর্ডার দিয়ে পরীক্ষা করুন।' 
                : 'আপনার সার্চ বা ফিল্টারের সাথে মিলে এমন কোনো অর্ডার নেই।'}
            </p>
            {orders.length === 0 && (
              <Link
                href="/collections"
                className="inline-block px-5 py-2.5 bg-pink-600 text-white text-xs font-semibold rounded-xl shadow-md hover:bg-pink-700 transition"
              >
                চেকআউট পেজে যান
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => {
              const orderId = order.orderId || order.id;
              const customer = order.customer || {};
              const customerName = customer.name || customer.customerName || 'কাস্টমার';
              const customerPhone = customer.phone || 'N/A';
              const customerAddress = customer.address || '';
              const customerArea = customer.area || customer.district || '';
              const customerNote = customer.note || '';
              const items = order.items || [];
              const badge = getStatusBadge(order.status || 'নতুন অর্ডার (Pending)');

              return (
                <div
                  key={orderId}
                  className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden p-5 sm:p-6 transition hover:shadow-md"
                >
                  {/* অর্ডার কার্ড হেডার */}
                  <div className="flex flex-wrap justify-between items-center pb-4 border-b border-gray-100 gap-3">
                    <div className="flex items-center flex-wrap gap-2 sm:gap-3">
                      <span className="text-xs font-mono font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-xl border border-pink-100">
                        {orderId}
                      </span>
                      <span className="text-xs text-gray-500 inline-flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" /> {order.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      {/* স্ট্যাটাস ড্রপডাউন */}
                      <div className="relative">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(orderId, e.target.value)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none transition ${badge.bg}`}
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status} className="bg-white text-gray-900">
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* অর্ডার ডিলিট বাটন */}
                      <button
                        onClick={() => handleDeleteOrder(orderId)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="অর্ডার মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* কার্ড বডি: কাস্টমার তথ্য ও আইটেম লিস্ট */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-5 text-xs">
                    
                    {/* কাস্টমার ও ডেলিভারি বিবরণ */}
                    <div className="md:col-span-5 space-y-2.5 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-serif font-bold text-gray-900 text-sm">{customerName}</h4>
                        <span className="text-[10px] bg-pink-50 text-pink-600 px-2 py-0.5 rounded-md font-semibold">
                          ক্যাশ অন ডেলিভারি
                        </span>
                      </div>

                      <p className="text-gray-700 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-pink-600 flex-shrink-0" />
                        <a 
                          href={`tel:${customerPhone}`} 
                          className="font-mono text-pink-600 hover:underline font-bold"
                          title="কল করতে ক্লিক করুন"
                        >
                          {customerPhone}
                        </a>
                      </p>

                      <p className="text-gray-600 flex items-start gap-2 leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span>
                          {customerAddress} {customerArea && <span className="font-semibold text-gray-800">({customerArea})</span>}
                        </span>
                      </p>

                      {customerNote && (
                        <div className="bg-gray-50 p-2.5 rounded-xl text-gray-600 border border-gray-100 text-[11px]">
                          <strong className="text-gray-800">কাস্টমার নোট:</strong> {customerNote}
                        </div>
                      )}
                    </div>

                    {/* আইটেম লিস্ট ও ওয়ারেন্টি ব্যাজ */}
                    <div className="md:col-span-7 flex flex-col justify-between">
                      <div className="space-y-3">
                        {items.map((item, idx) => {
                          const hasWarranty = Boolean(item.hasWarranty && (item.warrantyDays > 0 || item.expiryTimestamp));
                          const expiryDate = item.expiryDateFormatted || (item.expiryTimestamp ? new Date(item.expiryTimestamp).toLocaleDateString('bn-BD', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          }) : null);
                          const isExpired = item.expiryTimestamp ? Date.now() > item.expiryTimestamp : false;

                          return (
                            <div 
                              key={idx} 
                              className="flex items-center justify-between p-2.5 bg-gray-50/70 rounded-2xl border border-gray-100"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={item.images?.[0] || item.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'}
                                  alt={item.name || item.title}
                                  className="w-12 h-12 object-cover rounded-xl border border-gray-200 bg-white flex-shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 truncate">{item.name || item.title}</p>
                                  <p className="text-gray-500 text-[11px]">
                                    পরিমাণ: <strong className="text-gray-800">{item.quantity} টি</strong> × ৳ {item.price}
                                  </p>

                                  {/* আইটেম-স্পেসিফিক ওয়ারেন্টি ব্যাজ */}
                                  <div className="mt-1">
                                    {hasWarranty ? (
                                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                                        isExpired 
                                          ? 'bg-rose-50 text-rose-700 border-rose-200' 
                                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      }`}>
                                        <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                        <span>
                                          {isExpired 
                                            ? `ওয়ারেন্টি শেষ হয়েছে (${expiryDate})` 
                                            : `ওয়ারেন্টি মেয়াদ: ${expiryDate || `${item.warrantyDays} দিন`}`}
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-md bg-gray-200 text-gray-600 font-medium">
                                        নো ওয়ারেন্টি
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <span className="font-mono font-bold text-gray-900 text-sm whitespace-nowrap pl-2">
                                ৳ {item.price * item.quantity}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* আর্থিক সামারি */}
                      <div className="pt-3 border-t border-gray-100 mt-4 flex flex-wrap justify-between items-center text-xs gap-2">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-gray-500">
                          <span>সাবটোটাল: ৳ {order.subtotal || order.cartTotal || 0}</span>
                          {(order.appliedCouponCode || order.coupon?.code || order.discountAmount > 0) && (
                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-200">
                              <Tag className="w-3 h-3 text-emerald-600" />
                              <span>কুপন ({order.appliedCouponCode || order.coupon?.code}): -৳ {order.discountAmount || order.coupon?.discountAmount || 0}</span>
                            </span>
                          )}
                          <span>ডেলিভারি চার্জ: ৳ {order.deliveryCharge || order.shippingCost || 0}</span>
                        </div>
                        <div className="font-bold text-sm text-gray-900">
                          সর্বমোট: <strong className="text-pink-600 font-mono text-base">৳ {order.grandTotal}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
