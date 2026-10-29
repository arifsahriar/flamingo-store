'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { 
  Users, 
  Search, 
  Download, 
  Phone, 
  Mail, 
  ShoppingBag, 
  Calendar, 
  ShieldCheck, 
  LayoutTemplate, 
  Package, 
  Sparkles, 
  ExternalLink,
  LogOut,
  UserCheck,
  UserPlus,
  DollarSign,
  Gift,
  X
} from 'lucide-react';

export default function AdminCustomersPage() {
  const router = useRouter();
  const { currentAdmin, isAuthLoaded, logoutAdmin, issueVoucherToCustomer } = useAuth();

  const [customers, setCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'REGISTERED' | 'GUEST'

  // কাস্টম ভাউচার মোডাল স্টেট
  const [targetCustomer, setTargetCustomer] = useState(null);
  const [crmVoucherForm, setCrmVoucherForm] = useState({
    code: '',
    type: 'flat',
    discount: '150',
    days: '30',
    note: '',
  });

  // রুট গার্ড: অ্যাডমিন লগইন না থাকলে /admin/login এ রিডাইরেক্ট
  useEffect(() => {
    if (isAuthLoaded && !currentAdmin) {
      router.push('/admin/login');
    }
  }, [currentAdmin, isAuthLoaded, router]);

  // গ্রাহক ডাটা কনসলিডেশন (flamingo_users + flamingo_orders)
  useEffect(() => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('flamingo_users') || '[]');
      const orders = JSON.parse(localStorage.getItem('flamingo_orders') || '[]');

      // ফোন বা ইমেইল দিয়ে ম্যাপ তৈরি
      const customerMap = new Map();

      // ১. প্রথমে রেজিস্টার্ড ইউজারদের যুক্ত করা
      registeredUsers.forEach((user) => {
        const key = user.phone || user.email || user.id;
        customerMap.set(key, {
          id: user.id,
          name: user.name,
          phone: user.phone || 'N/A',
          email: user.email || 'N/A',
          isRegistered: true,
          totalOrders: 0,
          totalSpent: 0,
          lastOrderDate: 'কোনো অর্ডার নেই',
          registeredDate: user.createdAt || 'N/A',
        });
      });

      // ২. অর্ডার থেকে ডাটা সিঙ্ক ও কনসলিডেট করা
      orders.forEach((ord) => {
        const cust = ord.customer || {};
        const key = cust.phone || cust.email || cust.name;
        if (!key) return;

        const grandTotal = Number(ord.grandTotal) || 0;

        if (customerMap.has(key)) {
          const existing = customerMap.get(key);
          existing.totalOrders += 1;
          existing.totalSpent += grandTotal;
          if (existing.lastOrderDate === 'কোনো অর্ডার নেই') {
            existing.lastOrderDate = ord.date;
          }
        } else {
          // গেস্ট কাস্টমার হিসেবে যুক্ত করা
          customerMap.set(key, {
            id: 'guest_' + Math.random().toString(36).substr(2, 9),
            name: cust.name || cust.customerName || 'গেস্ট কাস্টমার',
            phone: cust.phone || 'N/A',
            email: cust.email || 'N/A',
            isRegistered: false,
            totalOrders: 1,
            totalSpent: grandTotal,
            lastOrderDate: ord.date || 'N/A',
            registeredDate: 'গেস্ট অর্ডার',
          });
        }
      });

      setCustomers(Array.from(customerMap.values()));
    } catch (e) {
      console.error('Error consolidating customer CRM data:', e);
    }
  }, []);

  if (!isAuthLoaded || !currentAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-xs text-gray-400">
        স্টাফ অথেনটিকেশন যাচাই হচ্ছে...
      </div>
    );
  }

  // ফিল্টার ও সার্চ
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    const matchesFilter = filterType === 'ALL' || (filterType === 'REGISTERED' && c.isRegistered) || (filterType === 'GUEST' && !c.isRegistered);
    return matchesSearch && matchesFilter;
  });

  // CSV এক্সপোর্ট জেনারেটর
  const handleExportCSV = () => {
    if (customers.length === 0) {
      alert('এক্সপোর্ট করার মতো কোনো কাস্টমার ডাটা নেই।');
      return;
    }

    // CSV হেডার
    const headers = ['গ্রাহকের নাম', 'মোবাইল নম্বর', 'ইমেইল', 'মোট অর্ডার', 'মোট খরচ (টাকা)', 'সর্বশেষ অর্ডার তারিখ', 'গ্রাহকের ধরন'];

    // CSV রো
    const rows = filteredCustomers.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      c.totalOrders,
      c.totalSpent,
      `"${c.lastOrderDate}"`,
      `"${c.isRegistered ? 'রেজিস্টার্ড মেম্বার' : 'গেস্ট ক্রেতা'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `flamingo_customers_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // কাস্টমার ভাউচার মোডাল ওপেন
  const handleOpenVoucherModal = (cust) => {
    setTargetCustomer(cust);
    setCrmVoucherForm({
      code: `VIP-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'flat',
      discount: '150',
      days: '30',
      note: `সম্মানিত গ্রাহক ${cust.name}-এর জন্য বিশেষ এক্সক্লুসিভ ভাউচার`,
    });
  };

  // কাস্টমার ভাউচার ইস্যু কনফার্মেশন
  const handleConfirmIssueVoucher = (e) => {
    e.preventDefault();
    if (!targetCustomer) return;

    const res = issueVoucherToCustomer({
      customerId: targetCustomer.id?.startsWith('usr_') ? targetCustomer.id : null,
      customerPhone: targetCustomer.phone,
      voucher: {
        code: crmVoucherForm.code.trim().toUpperCase(),
        discount: Number(crmVoucherForm.discount),
        type: crmVoucherForm.type,
        days: Number(crmVoucherForm.days),
        note: crmVoucherForm.note || 'CRM এক্সক্লুসিভ কাস্টমার ভাউচার',
      },
    });

    if (res.success) {
      alert(`সফলভাবে গ্রাহক "${targetCustomer.name}"-এর জন্য ভাউচার "${crmVoucherForm.code}" ইস্যু করা হয়েছে!`);
      setTargetCustomer(null);
    } else {
      alert(res.error || 'ভাউচার ইস্যু করা সম্ভব হয়নি।');
    }
  };

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const registeredCount = customers.filter((c) => c.isRegistered).length;
  const repeatCount = customers.filter((c) => c.totalOrders > 1).length;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* হেডার ও অ্যাডমিন ন্যাভবার */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-gray-200 gap-4">
          <div>
            {/* অ্যাডমিন লিংক বার */}
            <div className="flex items-center gap-3 mb-2 text-xs font-semibold">
              {currentAdmin.role === 'superadmin' ? (
                <Link 
                  href="/admin/settings" 
                  className="text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
                >
                  <LayoutTemplate className="w-3.5 h-3.5" /> থিম সেটিংস
                </Link>
              ) : (
                <span className="text-gray-400 cursor-not-allowed flex items-center gap-1" title="শুধুমাত্র সুপারঅ্যাডমিন অ্যাক্সেস">
                  <LayoutTemplate className="w-3.5 h-3.5" /> থিম সেটিংস (লক)
                </span>
              )}
              <span className="text-gray-300">|</span>
              <Link 
                href="/admin/orders" 
                className="text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
              >
                <Package className="w-3.5 h-3.5" /> অর্ডার ম্যানেজমেন্ট
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/admin/products" 
                className="text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
              >
                <Sparkles className="w-3.5 h-3.5" /> প্রোডাক্ট ক্যাটালগ
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> কাস্টমার CRM
              </span>
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
              <Users className="w-7 h-7 text-pink-600" /> FLAMINGO কাস্টমার CRM ও মার্কেটিং এক্সপোর্ট
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              সকল রেজিস্টার্ড মেম্বার ও গেস্ট ক্রেতাদের সমন্বিত তালিকা, ব্যয় হিসাব ও মার্কেটিং এক্সপোর্ট।
            </p>
          </div>

          {/* লগইন অ্যাডমিন প্রোফাইল ব্যাজ ও লগআউট */}
          <div className="flex items-center gap-2.5 bg-white p-2 sm:px-3 rounded-2xl border border-gray-200 shadow-xs text-xs">
            <div className="text-right">
              <div className="font-bold text-gray-900 leading-tight">{currentAdmin.name}</div>
              <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-md ${
                currentAdmin.role === 'superadmin' 
                  ? 'bg-pink-50 text-pink-700' 
                  : 'bg-blue-50 text-blue-700'
              }`}>
                {currentAdmin.role === 'superadmin' ? 'Super Admin' : 'Order Moderator'}
              </span>
            </div>
            <button
              onClick={() => {
                logoutAdmin();
                router.push('/admin/login');
              }}
              className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* CRM মেট্রিক কার্ডস */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 text-xs mb-1">
              <span>মোট গ্রাহক সংখ্যা</span>
              <Users className="w-4 h-4 text-pink-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-gray-900">{customers.length}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600 text-xs mb-1">
              <span>রেজিস্টার্ড মেম্বার</span>
              <UserCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-emerald-600">{registeredCount}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-blue-600 text-xs mb-1">
              <span>পুনরাবৃত্ত ক্রেতা (Repeat)</span>
              <ShoppingBag className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-blue-600">{repeatCount}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-pink-600 text-xs mb-1">
              <span>মোট গ্রাহক ব্যয়</span>
              <DollarSign className="w-4 h-4 text-pink-500" />
            </div>
            <p className="text-2xl font-bold font-mono text-pink-600">৳ {totalRevenue.toLocaleString('en-US')}</p>
          </div>
        </div>

        {/* সার্চ, ফিল্টার ও এক্সপোর্ট অ্যাকশন বার */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="গ্রাহকের নাম, মোবাইল বা ইমেইল..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-gray-50/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto text-xs">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterType === 'ALL' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                সবাই ({customers.length})
              </button>
              <button
                onClick={() => setFilterType('REGISTERED')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterType === 'REGISTERED' ? 'bg-white text-emerald-700 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                রেজিস্টার্ড ({registeredCount})
              </button>
              <button
                onClick={() => setFilterType('GUEST')}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  filterType === 'GUEST' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                গেস্ট ({customers.length - registeredCount})
              </button>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition active:scale-95 flex items-center gap-1.5 ml-auto md:ml-0"
              title="SMS বা ইমেইল মার্কেটিংয়ের জন্য CSV তালিকা ডাউনলোড করুন"
            >
              <Download className="w-4 h-4" /> CSV / Excel ডাউনলোড করুন
            </button>
          </div>
        </div>

        {/* কাস্টমার তালিকা টেবিল */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-md mx-auto shadow-sm">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-gray-800 text-base">কোনো গ্রাহক পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-500 mt-1">
              {customers.length === 0 
                ? 'এখনো কোনো কাস্টমার অ্যাকাউন্ট তৈরি হয়নি বা অর্ডার আসেনি।'
                : 'আপনার সার্চ বা ফিল্টারের সাথে মিলে এমন কোনো গ্রাহক নেই।'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-700 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">গ্রাহকের নাম ও ধরন</th>
                    <th className="py-3.5 px-4">মোবাইল নম্বর</th>
                    <th className="py-3.5 px-4">ইমেইল</th>
                    <th className="py-3.5 px-4 text-center">মোট অর্ডার</th>
                    <th className="py-3.5 px-4">মোট কেনাকাটা</th>
                    <th className="py-3.5 px-4">সর্বশেষ অর্ডার</th>
                    <th className="py-3.5 px-4 text-center">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-pink-50/20 transition">
                      
                      {/* নাম ও মেম্বারশিপ ট্যাগ */}
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-gray-900 text-xs">{cust.name}</p>
                          <span className={`inline-block text-[10px] font-semibold px-2 py-0.2 rounded-md mt-0.5 ${
                            cust.isRegistered 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-gray-100 text-gray-500'
                          }`}>
                            {cust.isRegistered ? 'রেজিস্টার্ড মেম্বার' : 'গেস্ট ক্রেতা'}
                          </span>
                        </div>
                      </td>

                      {/* মোবাইল নম্বর */}
                      <td className="py-3.5 px-4">
                        <a 
                          href={`tel:${cust.phone}`} 
                          className="font-mono text-pink-600 hover:underline font-semibold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3 text-pink-400" />
                          <span>{cust.phone}</span>
                        </a>
                      </td>

                      {/* ইমেইল */}
                      <td className="py-3.5 px-4">
                        {cust.email !== 'N/A' ? (
                          <span className="text-gray-700">{cust.email}</span>
                        ) : (
                          <span className="text-gray-400 italic">প্রযোজ্য নয়</span>
                        )}
                      </td>

                      {/* মোট অর্ডার */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-mono font-bold bg-pink-50 text-pink-700 px-2.5 py-0.5 rounded-lg border border-pink-100">
                          {cust.totalOrders} টি
                        </span>
                      </td>

                      {/* মোট কেনাকাটা */}
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                        ৳ {cust.totalSpent.toLocaleString('en-US')}
                      </td>

                      {/* সর্বশেষ অর্ডারের তারিখ */}
                      <td className="py-3.5 px-4 text-[11px] text-gray-500">
                        {cust.lastOrderDate}
                      </td>

                      {/* অ্যাকশন বাটন */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenVoucherModal(cust)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl text-[11px] font-bold border border-pink-200 transition active:scale-95 shadow-xs"
                          title="এই গ্রাহকের জন্য এক্সক্লুসিভ ভাউচার বরাদ্দ করুন"
                        >
                          <Gift className="w-3.5 h-3.5 text-pink-600" />
                          <span>ভাউচার দিন</span>
                        </button>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* কাস্টমার এক্সক্লুসিভ ভাউচার ইস্যু মোডাল */}
        {targetCustomer && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-pink-100 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm">গ্রাহককে এক্সক্লুসিভ ভাউচার বরাদ্দ</h3>
                    <p className="text-[10px] text-gray-500">শুধুমাত্র এই নির্দিষ্ট গ্রাহক চেকআউটে ব্যবহার করতে পারবেন</p>
                  </div>
                </div>
                <button
                  onClick={() => setTargetCustomer(null)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* টার্গেট গ্রাহক পরিচিতি */}
              <div className="p-3 bg-pink-50/50 rounded-2xl border border-pink-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-500">গ্রাহকের নাম:</span>
                  <strong className="text-gray-900">{targetCustomer.name}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">মোবাইল নম্বর:</span>
                  <strong className="font-mono text-gray-900">{targetCustomer.phone}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">গ্রাহকের স্ট্যাটাস:</span>
                  <span className="text-emerald-700 font-semibold">{targetCustomer.isRegistered ? 'রেজিস্টার্ড মেম্বার' : 'গেস্ট ক্রেতা'}</span>
                </div>
              </div>

              <form onSubmit={handleConfirmIssueVoucher} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">ভাউচার কোড *</label>
                  <input
                    type="text"
                    required
                    value={crmVoucherForm.code}
                    onChange={(e) => setCrmVoucherForm({ ...crmVoucherForm, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 border rounded-xl font-mono uppercase font-bold focus:outline-pink-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">ডিসকাউন্ট টাইপ</label>
                    <select
                      value={crmVoucherForm.type}
                      onChange={(e) => setCrmVoucherForm({ ...crmVoucherForm, type: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl focus:outline-pink-500 bg-white"
                    >
                      <option value="flat">ফ্ল্যাট টাকা (৳)</option>
                      <option value="percentage">শতাংশ (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">
                      {crmVoucherForm.type === 'percentage' ? 'ডিসকাউন্ট (%)' : 'ডিসকাউন্ট (৳)'} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={crmVoucherForm.discount}
                      onChange={(e) => setCrmVoucherForm({ ...crmVoucherForm, discount: e.target.value })}
                      className="w-full px-3 py-2 border rounded-xl font-bold focus:outline-pink-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">মেয়াদ (দিন)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={crmVoucherForm.days}
                    onChange={(e) => setCrmVoucherForm({ ...crmVoucherForm, days: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-pink-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">ভাউচার নোট / শিরোনাম</label>
                  <input
                    type="text"
                    value={crmVoucherForm.note}
                    onChange={(e) => setCrmVoucherForm({ ...crmVoucherForm, note: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:outline-pink-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-md transition active:scale-95"
                  >
                    ভাউচার বরাদ্দ করুন
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetCustomer(null)}
                    className="px-4 py-2.5 border rounded-xl text-gray-600 hover:bg-gray-100"
                  >
                    বাতিল
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
