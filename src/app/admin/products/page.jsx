'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useProducts } from '@/context/ProductsContext';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Package, 
  LayoutTemplate, 
  ExternalLink, 
  X, 
  RefreshCw,
  Image as ImageIcon,
  DollarSign,
  Tag,
  AlertCircle,
  Users,
  LogOut
} from 'lucide-react';

const CATEGORIES = ['All', 'Necklace', 'Ring', 'Bracelet', 'Earrings'];

export default function AdminProductsPage() {
  const { currentAdmin, isAuthLoaded, logoutAdmin } = useAuth();
  const router = useRouter();
  const { products, addProduct, updateProduct, toggleStock, deleteProduct, resetToDefault } = useProducts();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Authentication Guard
  useEffect(() => {
    if (isAuthLoaded && !currentAdmin) {
      router.push('/admin/login');
    }
  }, [isAuthLoaded, currentAdmin, router]);

  // ফর্ম স্টেট
  const [formData, setFormData] = useState({
    name: '',
    category: 'Ring',
    price: '',
    originalPrice: '',
    image: '',
    additionalImages: '',
    inStock: true,
    hasWarranty: true,
    warrantyDays: 180,
    warrantyText: '৬ মাসের ফ্রি পলিশিং ওয়ারেন্টি',
    shortDescription: '',
    description: '',
  });

  // ফিল্টার ও সার্চ লজিক
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || prod.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  // মোডাল ওপেন (Add Mode)
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Ring',
      price: '',
      originalPrice: '',
      image: '',
      additionalImages: '',
      inStock: true,
      hasWarranty: true,
      warrantyDays: 180,
      warrantyText: '৬ মাসের ফ্রি পলিশিং ওয়ারেন্টি',
      shortDescription: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  // মোডাল ওপেন (Edit Mode)
  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    const extraImages = (prod.images || []).filter((img) => img !== (prod.image || prod.images?.[0]));
    setFormData({
      name: prod.name || '',
      category: prod.category || 'Ring',
      price: prod.price || '',
      originalPrice: prod.originalPrice || '',
      image: prod.image || prod.images?.[0] || '',
      additionalImages: extraImages.join('\n'),
      inStock: prod.inStock ?? true,
      hasWarranty: prod.hasWarranty ?? false,
      warrantyDays: prod.warrantyDays || 0,
      warrantyText: prod.warrantyText || '',
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
    });
    setIsModalOpen(true);
  };

  // ফর্ম সাবমিট হ্যান্ডলার
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert('প্রোডাক্ট নাম ও মূল্য প্রদান করুন');
      return;
    }

    const mainImg = formData.image.trim() || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop';
    const extras = formData.additionalImages
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const allImages = [mainImg, ...extras.filter((url) => url !== mainImg)];

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      image: mainImg,
      images: allImages,
      inStock: Boolean(formData.inStock),
      hasWarranty: Boolean(formData.hasWarranty),
      warrantyDays: formData.hasWarranty ? Number(formData.warrantyDays) || 0 : 0,
      warrantyText: formData.hasWarranty 
        ? (formData.warrantyText.trim() || `${formData.warrantyDays} দিনের ওয়ারেন্টি`) 
        : 'কোনো ওয়ারেন্টি নেই',
      shortDescription: formData.shortDescription.trim() || 'প্রিমিয়াম ৯২৫ স্টার্লিং সিলভার জুয়েলারি।',
      description: formData.description.trim() || 'আন্তর্জাতিক ৯২৫ হলমার্ক নিশ্চয়তা ও অ্যান্টি-টার্নিশ ফিনিশিং সংবলিত খাঁটি সিলভার জুয়েলারি।',
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
    } else {
      addProduct(payload);
    }

    setIsModalOpen(false);
  };

  // প্রোডাক্ট ডিলিট হ্যান্ডলার
  const handleDelete = (id, name) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${name}" প্রোডাক্টটি ক্যাটালগ থেকে মুছে ফেলতে চান?`)) {
      deleteProduct(id);
    }
  };

  // ডিফল্ট রিসেট
  const handleResetDefaults = () => {
    if (confirm('আপনি কি প্রোডাক্ট ক্যাটালগ ডিফল্ট অবস্থায় ফিরিয়ে নিতে চান? এতে নতুন যুক্ত করা কাস্টম প্রোডাক্ট মুছে যাবে।')) {
      resetToDefault();
    }
  };

  if (!isAuthLoaded || !currentAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-xs text-gray-400">
        অ্যাডমিন প্রমাণীকরণ যাচাই হচ্ছে...
      </div>
    );
  }

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
              <span className="text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> প্রোডাক্ট ক্যাটালগ
              </span>
              <span className="text-gray-300">|</span>
              <Link 
                href="/admin/customers" 
                className="text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
              >
                <Users className="w-3.5 h-3.5" /> কাস্টমার CRM
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
              <Sparkles className="w-7 h-7 text-pink-600" /> FLAMINGO জুয়েলারি প্রোডাক্ট ম্যানেজার
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              স্টোরের সকল ৯২৫ সিলভার গহনা যোগ করুন, স্টক হালনাগাদ করুন ও ওয়ারেন্টি পলিসি ম্যানেজ করুন।
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* অ্যাডমিন প্রোফাইল ব্যাজ ও লগআউট */}
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

            <button
              onClick={handleResetDefaults}
              className="px-3 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              title="ডিফল্ট প্রোডাক্টে রিসেট করুন"
            >
              <RefreshCw className="w-3.5 h-3.5" /> ডিফল্ট রিসেট
            </button>

            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/25 transition active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add New Jewelry / নতুন গহনা যোগ করুন
            </button>
          </div>
        </div>

        {/* সার্চ ও ক্যাটাগরি ফিল্টার বার */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="গহনার নাম বা ক্যাটাগরি দিয়ে খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-gray-50/50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs pb-1 md:pb-0">
            <span className="text-gray-400 text-[11px] font-semibold mr-1">ক্যাটাগরি:</span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium transition whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-pink-600 text-white shadow-xs' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat === 'All' ? `সকল গহনা (${products.length})` : cat}
              </button>
            ))}
          </div>
        </div>

        {/* প্রোডাক্ট তালিকা টেবিল / গ্রিড */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-md mx-auto shadow-sm">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-serif font-bold text-gray-800 text-base">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              আপনার ফিল্টার বা সার্চের সাথে মিলে এমন কোনো গহনা নেই।
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-semibold"
            >
              নতুন গহনা যোগ করুন
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-700 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">গহনা ও বিবরণ</th>
                    <th className="py-3.5 px-4">ক্যাটাগরি</th>
                    <th className="py-3.5 px-4">মূল্য (প্রদেয়)</th>
                    <th className="py-3.5 px-4">স্টক স্ট্যাটাস</th>
                    <th className="py-3.5 px-4">ওয়ারেন্টি পলিসি</th>
                    <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-pink-50/20 transition">
                      
                      {/* থাম্বনেইল ও টাইটেল */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image || prod.images?.[0] || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'}
                            alt={prod.name}
                            className="w-12 h-12 rounded-xl object-cover border border-gray-200 bg-gray-50 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <Link 
                              href={`/product/${prod.id}`} 
                              target="_blank"
                              className="font-bold text-gray-900 hover:text-pink-600 truncate block text-xs"
                            >
                              {prod.name}
                            </Link>
                            <p className="text-[11px] text-gray-400 truncate max-w-xs mt-0.5">
                              {prod.shortDescription}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* ক্যাটাগরি */}
                      <td className="py-3 px-4">
                        <span className="font-semibold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg">
                          {prod.category}
                        </span>
                      </td>

                      {/* মূল্য */}
                      <td className="py-3 px-4">
                        <div className="font-mono">
                          <span className="font-bold text-gray-900 text-sm">৳ {prod.price}</span>
                          {prod.originalPrice && (
                            <span className="text-gray-400 line-through text-[11px] ml-1.5">
                              ৳ {prod.originalPrice}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* স্টক স্ট্যাটাস বাটন */}
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => toggleStock(prod.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition active:scale-95 ${
                            prod.inStock
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                          title="স্টক পরিবর্তন করতে ক্লিক করুন"
                        >
                          {prod.inStock ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>স্টকে আছে (In Stock)</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>স্টক শেষ (Out of Stock)</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* ওয়ারেন্টি পলিসি */}
                      <td className="py-3 px-4">
                        {prod.hasWarranty ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                            <span>{prod.warrantyText || `${prod.warrantyDays} দিন`}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
                            নো ওয়ারেন্টি
                          </span>
                        )}
                      </td>

                      {/* অ্যাকশন বাটনসমূহ */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 text-gray-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition"
                            title="এডিট করুন"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(prod.id, prod.name)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* প্রোডাক্ট যোগ / এডিট মোডাল */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl shadow-2xl border border-pink-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* মোডাল হেডার */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-pink-50/40">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-600" />
                <h3 className="font-serif font-bold text-gray-900 text-base">
                  {editingProduct ? 'গহনার তথ্য পরিবর্তন (Edit Jewelry)' : 'নতুন গহনা যোগ করুন (Add New Jewelry)'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* মোডাল ফর্ম */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[80vh] overflow-y-auto">
              
              <div>
                <label className="block font-semibold text-gray-700 mb-1">গহনার নাম (Product Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: Sterling Silver Floral Ring"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">ক্যাটাগরি *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-white"
                  >
                    <option value="Ring">Ring (আংটি)</option>
                    <option value="Necklace">Necklace (লকেট ও চেইন)</option>
                    <option value="Bracelet">Bracelet (ব্রেসলেট)</option>
                    <option value="Earrings">Earrings (কানের দুল)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">বিক্রয় মূল্য (৳) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="যেমন: 1850"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">আগের মূল্য / কাটা মূল্য (৳)</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="যেমন: 2200"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-white font-mono"
                  />
                </div>
              </div>

              {/* ইমেজ ইনপুট */}
              <div className="space-y-3 p-3.5 bg-gray-50/60 rounded-2xl border border-gray-100">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-pink-600" /> প্রধান ইমেজ URL (Main Image Link)
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    অতিরিক্ত ইমেজ লিংকসমূহ (প্রতি লাইনে একটি লিংক দিন)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="https://...&#10;https://..."
                    value={formData.additionalImages}
                    onChange={(e) => setFormData({ ...formData, additionalImages: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-white"
                  />
                </div>
              </div>

              {/* স্টক ও ওয়ারেন্টি টগল */}
              <div className="p-4 bg-pink-50/30 rounded-2xl border border-pink-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">স্টক অবস্থা (Availability):</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-2 text-xs font-semibold text-gray-700">
                      {formData.inStock ? 'স্টকে আছে' : 'স্টক আউট'}
                    </span>
                  </label>
                </div>

                <div className="border-t border-pink-100/70 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> ওয়ারেন্টি প্রদান করবেন?
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasWarranty}
                        onChange={(e) => setFormData({ ...formData, hasWarranty: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-600"></div>
                      <span className="ml-2 text-xs font-semibold text-gray-700">
                        {formData.hasWarranty ? 'হ্যাঁ (সক্রিয়)' : 'না'}
                      </span>
                    </label>
                  </div>

                  {formData.hasWarranty && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          ওয়ারেন্টি মেয়াদ (দিন সংখ্যা)
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="যেমন: 180 বা 365"
                          value={formData.warrantyDays}
                          onChange={(e) => setFormData({ ...formData, warrantyDays: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-pink-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                          ওয়ারেন্টি বিবরণ টেক্সট
                        </label>
                        <input
                          type="text"
                          placeholder="যেমন: ৬ মাসের ফ্রি পলিশিং ওয়ারেন্টি"
                          value={formData.warrantyText}
                          onChange={(e) => setFormData({ ...formData, warrantyText: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-pink-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">সংক্ষিপ্ত বিবরণ (Short Description)</label>
                <input
                  type="text"
                  placeholder="যেমন: খাঁটি ৯২৫ স্টার্লিং সিলভারের স্নিগ্ধ আভিজাত্য..."
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">বিস্তারিত বিবরণ (Detailed Description)</label>
                <textarea
                  rows={3}
                  placeholder="প্রতিটি গহনায় রয়েছে আন্তর্জাতিক ৯২৫ সিলভার হলমার্ক নিশ্চয়তা..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-white"
                />
              </div>

              {/* ফুটার বাটনসমূহ */}
              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold shadow-md shadow-pink-600/25 transition active:scale-95"
                >
                  {editingProduct ? 'পরিবর্তন সেভ করুন' : 'প্রোডাক্ট যোগ করুন'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
