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
  LogOut,
  Calculator,
  Percent,
  RotateCcw,
  Video,
  ArrowUp,
  ArrowDown,
  Film,
  Play
} from 'lucide-react';
import { useSiteConfig } from '@/context/SiteConfigContext';
import { calculateSellingPriceBreakdown } from '@/lib/pricingEngine';

const CATEGORIES = ['All', 'Jewelry', 'Necklace', 'Ring', 'Bracelet', 'Earrings', 'Electronics', 'Lifestyle', 'Accessories', 'Home Decor', 'Other'];

export default function AdminProductsPage() {
  const { currentAdmin, isAuthLoaded, logoutAdmin } = useAuth();
  const router = useRouter();
  const { products, addProduct, updateProduct, toggleStock, deleteProduct, resetToDefault } = useProducts();
  const { config } = useSiteConfig();

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

  // ফর্ম স্টেট (মডিউল ১: costPrice সহ ডায়নামিক মার্জিন ও রিটার্ন পলিসি, মাল্টিমিডিয়া গ্যালারি)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Jewelry',
    costPrice: '',
    price: '',
    originalPrice: '',
    image: '',
    additionalImages: '',
    media_gallery: [],
    stock: 20,
    inStock: true,
    returnPolicyType: 'NO_RETURN',
    returnDays: 0,
    hasWarranty: false,
    warrantyDays: 0,
    warrantyText: '',
    shortDescription: '',
    description: '',
  });

  // নতুন মিডিয়া আইটেম ইনপুট স্টেট (ছবি / ভিডিও রিল)
  const [mediaInput, setMediaInput] = useState({
    type: 'IMAGE',
    url: '',
    thumbnail_url: '',
  });

  // ফিল্টার ও সার্চ লজিক
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || prod.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  // কস্ট প্রাইস টাইপ করলে স্বয়ংক্রিয় সেলিং প্রাইস (MRP) ও ব্রেকডাউন হিসাব
  const handleCostPriceChange = (costInput) => {
    const num = Number(costInput) || 0;
    const breakdown = calculateSellingPriceBreakdown(num, config?.pricingSettings);
    setFormData((prev) => ({
      ...prev,
      costPrice: costInput,
      price: breakdown.sellingPrice ? String(breakdown.sellingPrice) : prev.price,
    }));
  };

  // লাইভ ব্রেকডাউন
  const liveBreakdown = calculateSellingPriceBreakdown(formData.costPrice, config?.pricingSettings);

  // মিডিয়া আইটেম যোগ
  const handleAddMediaItem = () => {
    if (!mediaInput.url.trim()) return;

    const newItem = {
      id: `media-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type: mediaInput.type === 'VIDEO' ? 'VIDEO' : 'IMAGE',
      url: mediaInput.url.trim(),
      thumbnail_url: mediaInput.thumbnail_url.trim() || (mediaInput.type === 'IMAGE' ? mediaInput.url.trim() : ''),
      display_order: formData.media_gallery.length,
    };

    const updatedGallery = [...formData.media_gallery, newItem];
    setFormData((prev) => {
      const firstImg = updatedGallery.find((m) => m.type === 'IMAGE')?.url || updatedGallery[0]?.url || '';
      const otherImgs = updatedGallery.filter((m) => m.type === 'IMAGE' && m.url !== firstImg).map((m) => m.url);
      return {
        ...prev,
        media_gallery: updatedGallery,
        image: prev.image || firstImg,
        additionalImages: otherImgs.join('\n'),
      };
    });

    setMediaInput({
      type: 'IMAGE',
      url: '',
      thumbnail_url: '',
    });
  };

  // মিডিয়া আইটেম রিমুভ
  const handleRemoveMediaItem = (index) => {
    const updated = formData.media_gallery.filter((_, idx) => idx !== index).map((item, idx) => ({
      ...item,
      display_order: idx,
    }));
    setFormData((prev) => {
      const firstImg = updated.find((m) => m.type === 'IMAGE')?.url || updated[0]?.url || '';
      return {
        ...prev,
        media_gallery: updated,
        image: firstImg,
      };
    });
  };

  // মিডিয়া আইটেম রি-অর্ডার (Up / Down)
  const handleMoveMediaItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= formData.media_gallery.length) return;

    const list = [...formData.media_gallery];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    const reordered = list.map((item, idx) => ({
      ...item,
      display_order: idx,
    }));

    setFormData((prev) => {
      const firstImg = reordered.find((m) => m.type === 'IMAGE')?.url || reordered[0]?.url || '';
      return {
        ...prev,
        media_gallery: reordered,
        image: firstImg,
      };
    });
  };

  // মোডাল ওপেন (Add Mode)
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'Jewelry',
      costPrice: '',
      price: '',
      originalPrice: '',
      image: '',
      additionalImages: '',
      media_gallery: [],
      stock: 20,
      inStock: true,
      returnPolicyType: 'NO_RETURN',
      returnDays: 0,
      hasWarranty: false,
      warrantyDays: 0,
      warrantyText: '',
      shortDescription: '',
      description: '',
    });
    setMediaInput({ type: 'IMAGE', url: '', thumbnail_url: '' });
    setIsModalOpen(true);
  };

  // মোডাল ওপেন (Edit Mode)
  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);

    // Initial media_gallery fallback
    let gallery = [];
    if (Array.isArray(prod.media_gallery) && prod.media_gallery.length > 0) {
      gallery = prod.media_gallery.slice().sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    } else {
      const imgs = Array.isArray(prod.images) && prod.images.length > 0 ? prod.images : [prod.image].filter(Boolean);
      gallery = imgs.map((url, idx) => ({
        id: `mg-legacy-${idx}`,
        type: 'IMAGE',
        url,
        thumbnail_url: url,
        display_order: idx,
      }));
    }

    const extraImages = (prod.images || []).filter((img) => img !== (prod.image || prod.images?.[0]));

    setFormData({
      name: prod.name || '',
      category: prod.category || 'Jewelry',
      costPrice: prod.costPrice || prod.cost_price || '',
      price: prod.price || '',
      originalPrice: prod.originalPrice || '',
      image: prod.image || prod.images?.[0] || gallery[0]?.url || '',
      additionalImages: extraImages.join('\n'),
      media_gallery: gallery,
      stock: prod.stock ?? 20,
      inStock: prod.inStock ?? true,
      returnPolicyType: prod.returnPolicyType || prod.return_policy_type || 'NO_RETURN',
      returnDays: prod.returnDays ?? prod.return_days ?? 0,
      hasWarranty: prod.hasWarranty ?? Boolean(prod.warrantyText || prod.warranty_text),
      warrantyDays: prod.warrantyDays || 0,
      warrantyText: prod.warrantyText || prod.warranty_text || '',
      shortDescription: prod.shortDescription || '',
      description: prod.description || '',
    });
    setMediaInput({ type: 'IMAGE', url: '', thumbnail_url: '' });
    setIsModalOpen(true);
  };

  // ফর্ম সাবমিট হ্যান্ডলার
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      alert('প্রোডাক্ট নাম ও মূল্য প্রদান করুন');
      return;
    }

    // Prepare media_gallery and fallback images
    let finalGallery = formData.media_gallery && formData.media_gallery.length > 0
      ? formData.media_gallery.slice().sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
      : [];

    const mainImg = formData.image.trim() || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop';
    const extras = formData.additionalImages
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    const allImages = [mainImg, ...extras.filter((url) => url !== mainImg)];

    if (finalGallery.length === 0) {
      finalGallery = allImages.map((url, idx) => ({
        id: `mg-gen-${idx}`,
        type: 'IMAGE',
        url,
        thumbnail_url: url,
        display_order: idx,
      }));
    }

    const primaryImg = finalGallery.find((m) => m.type === 'IMAGE')?.url || finalGallery[0]?.url || mainImg;
    const galleryImageUrls = finalGallery.filter((m) => m.type === 'IMAGE').map((m) => m.url);

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      costPrice: Number(formData.costPrice) || 0,
      cost_price: Number(formData.costPrice) || 0,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      stock: Number(formData.stock) || (formData.inStock ? 20 : 0),
      media_gallery: finalGallery,
      image: primaryImg,
      images: galleryImageUrls.length > 0 ? galleryImageUrls : [primaryImg],
      inStock: Boolean(formData.inStock),
      returnPolicyType: formData.returnPolicyType || 'NO_RETURN',
      return_policy_type: formData.returnPolicyType || 'NO_RETURN',
      returnDays: formData.returnPolicyType === 'RETURNABLE' ? (Number(formData.returnDays) || 7) : 0,
      return_days: formData.returnPolicyType === 'RETURNABLE' ? (Number(formData.returnDays) || 7) : 0,
      hasWarranty: Boolean(formData.hasWarranty || formData.warrantyText.trim()),
      warrantyDays: formData.hasWarranty ? Number(formData.warrantyDays) || 0 : 0,
      warrantyText: formData.warrantyText.trim(),
      warranty_text: formData.warrantyText.trim(),
      shortDescription: formData.shortDescription.trim() || 'আন্তর্জাতিক মানসম্মত ও শতভাগ যাচাইকৃত কোয়ালিটি পণ্য।',
      description: formData.description.trim() || 'উচ্চমানের টেকসই কাঁচামাল, আধুনিক প্রযুক্তি ও নিখুঁত ফিনিশিং সংবলিত পণ্য।',
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
            <div className="flex flex-wrap items-center gap-2.5 mb-2 text-xs font-semibold">
              <Link 
                href="/admin/settings?tab=theme" 
                className="text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
              >
                <LayoutTemplate className="w-3.5 h-3.5" /> থিম সেটিংস
              </Link>
              <span className="text-gray-300">|</span>
              {currentAdmin.role === 'superadmin' ? (
                <Link 
                  href="/admin/settings?tab=business" 
                  className="text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
                >
                  <Percent className="w-3.5 h-3.5" /> বিজনেস মার্জিন
                </Link>
              ) : (
                <span className="text-gray-400 cursor-not-allowed flex items-center gap-1" title="শুধুমাত্র সুপারঅ্যাডমিন অ্যাক্সেস">
                  <Percent className="w-3.5 h-3.5" /> মার্জিন (লক)
                </span>
              )}
              <span className="text-gray-300">|</span>
              <Link 
                href="/admin/settings?tab=coupons" 
                className="text-gray-500 hover:text-pink-600 flex items-center gap-1 transition"
              >
                <Tag className="w-3.5 h-3.5" /> কুপন ও মার্কেটিং
              </Link>
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
                    <th className="py-3.5 px-4">রিটার্ন ও ওয়ারেন্টি</th>
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
                            {prod.media_gallery && prod.media_gallery.length > 0 && (
                              <span className="inline-flex items-center gap-1 text-[9px] text-pink-700 bg-pink-50 border border-pink-100 px-1.5 py-0.5 rounded-md mt-1 font-bold">
                                {prod.media_gallery.some((m) => m.type === 'VIDEO') && (
                                  <Film className="w-2.5 h-2.5 text-purple-600 flex-shrink-0" />
                                )}
                                <span>{prod.media_gallery.length} টি মিডিয়া</span>
                              </span>
                            )}
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
                      {/* মূল্য (প্রদেয়) ও বেস ক্রয় মূল্য */}
                      <td className="py-3 px-4">
                        <div className="font-mono">
                          <span className="font-bold text-gray-900 text-sm">৳ {prod.price}</span>
                          {prod.originalPrice && (
                            <span className="text-gray-400 line-through text-[11px] ml-1.5">
                              ৳ {prod.originalPrice}
                            </span>
                          )}
                          {(prod.costPrice || prod.cost_price) ? (
                            <span className="block text-[10px] text-gray-400 mt-0.5">
                              ক্রয়: ৳{prod.costPrice || prod.cost_price}
                            </span>
                          ) : null}
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

                      {/* রিটার্ন পলিসি ও ওয়ারেন্টি */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {(prod.returnPolicyType === 'RETURNABLE' || prod.return_policy_type === 'RETURNABLE') ? (
                            <span className="inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 font-medium">
                              <RotateCcw className="w-3 h-3 text-blue-600 flex-shrink-0" />
                              <span>রিটার্ন: {prod.returnDays || prod.return_days || 7} দিন</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 font-medium">
                              <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0" />
                              <span>নো-রিটার্ন</span>
                            </span>
                          )}

                          {(prod.warrantyText || prod.warranty_text) && (
                            <div className="block">
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                                <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                                <span className="truncate max-w-[140px]">{prod.warrantyText || prod.warranty_text}</span>
                              </span>
                            </div>
                          )}
                        </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">জেনেরিক ক্যাটাগরি (Category) *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-white"
                  >
                    <option value="Jewelry">Jewelry (জুয়েলারি ও অলংকার)</option>
                    <option value="Ring">Ring (আংটি)</option>
                    <option value="Necklace">Necklace (লকেট ও চেইন)</option>
                    <option value="Bracelet">Bracelet (ব্রেসলেট)</option>
                    <option value="Earrings">Earrings (কানের দুল)</option>
                    <option value="Electronics">Electronics (ইলেকট্রনিক্স ও গ্যাজেট)</option>
                    <option value="Lifestyle">Lifestyle (লাইফস্টাইল ও ফ্যাশন)</option>
                    <option value="Accessories">Accessories (অ্যাকসেসরিজ)</option>
                    <option value="Home Decor">Home Decor (হোম অ্যান্ড লিভিং)</option>
                    <option value="Other">Other (অন্যান্য ফিজিক্যাল প্রোডাক্ট)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">স্টক পরিমাণ (Stock Quantity) *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="যেমন: 25"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-white font-mono"
                  />
                </div>
              </div>

              {/* মডিউল ১: ডায়নামিক প্রাইসিং ও মার্জিন ইঞ্জিন অটো-ক্যালকুলেশন */}
              <div className="p-4 bg-gradient-to-br from-pink-50/70 to-purple-50/40 rounded-2xl border border-pink-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-pink-700 font-bold">
                    <Calculator className="w-4 h-4 text-pink-600" />
                    <span>ডায়নামিক প্রাইসিং ও মার্জিন ইঞ্জিন (Auto-Pricing Math)</span>
                  </div>
                  <span className="text-[10px] bg-white border border-pink-200 text-pink-700 px-2.5 py-0.5 rounded-full font-semibold">
                    মার্জিন: {liveBreakdown.totalMarginPercentage.toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-800 mb-1">
                      বেস ক্রয় মূল্য (Cost Price ৳) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">৳</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="যেমন: 1000"
                        value={formData.costPrice}
                        onChange={(e) => handleCostPriceChange(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 border border-pink-300 rounded-xl text-xs font-bold font-mono focus:outline-pink-500 bg-white"
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-0.5 block">ওয়্যারহাউজ বেস পারচেজ রেট</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-800 mb-1">
                      বিক্রয় মূল্য / MRP (৳) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-pink-600">৳</span>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full pl-7 pr-3 py-2 border border-pink-300 rounded-xl text-xs font-black font-mono text-pink-700 focus:outline-pink-500 bg-white"
                      />
                    </div>
                    <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">স্বয়ংক্রিয় হিসাবকৃত</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">কাটা মূল্য / ডিসপ্লে অফার (৳)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs font-bold text-gray-400">৳</span>
                      <input
                        type="number"
                        min="1"
                        placeholder="যেমন: 2200"
                        value={formData.originalPrice}
                        onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                        className="w-full pl-7 pr-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-white font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">ঐচ্ছিক স্ট্রিক-থ্রু মূল্য</span>
                  </div>
                </div>

                {/* লাইভ ব্রেকডাউন টেবিল */}
                {Number(formData.costPrice) > 0 && (
                  <div className="mt-2 bg-white rounded-xl border border-pink-100 overflow-hidden shadow-xs">
                    <div className="bg-pink-100/60 px-3 py-1.5 text-[11px] font-bold text-pink-900 flex justify-between items-center">
                      <span>মার্জিন ফান্ড বিভাজন (Margin Allocation Breakdown)</span>
                      <span className="font-mono">মোট মার্জিন: {liveBreakdown.totalMarginPercentage}%</span>
                    </div>
                    <table className="w-full text-[11px]">
                      <tbody className="divide-y divide-gray-100">
                        <tr className="bg-gray-50/50">
                          <td className="px-3 py-1.5 text-gray-600">বেস ক্রয় মূল্য (Base Warehouse Cost)</td>
                          <td className="px-3 py-1.5 font-mono font-bold text-gray-900 text-right">৳ {liveBreakdown.costPrice.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-1.5 text-gray-600">অপারেশনাল ফান্ড ({liveBreakdown.opexPercentage}% of MRP)</td>
                          <td className="px-3 py-1.5 font-mono font-semibold text-indigo-700 text-right">+ ৳ {liveBreakdown.allocatedOpex.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-1.5 text-gray-600">গ্রোথ, মার্কেটিং ও রেফারেল ফান্ড ({liveBreakdown.growthPoolPercentage}% of MRP)</td>
                          <td className="px-3 py-1.5 font-mono font-semibold text-purple-700 text-right">+ ৳ {liveBreakdown.allocatedGrowth.toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="px-3 py-1.5 text-gray-600">কোম্পানির নিট প্রফিট ({liveBreakdown.netProfitPercentage}% of MRP)</td>
                          <td className="px-3 py-1.5 font-mono font-semibold text-emerald-700 text-right">+ ৳ {liveBreakdown.allocatedNetProfit.toLocaleString()}</td>
                        </tr>
                        <tr className="bg-pink-50/80 font-bold border-t border-pink-200">
                          <td className="px-3 py-2 text-pink-900 font-bold">চূড়ান্ত বিক্রয় মূল্য (Final Selling Price / MRP)</td>
                          <td className="px-3 py-2 font-mono font-black text-pink-700 text-right text-xs">৳ {liveBreakdown.sellingPrice.toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* মাল্টি-মিডিয়া গ্যালারি ও ভিডিও রিলস কনফিগারেশন */}
              <div className="space-y-3.5 p-4 bg-gradient-to-br from-pink-50/50 via-white to-pink-50/30 rounded-2xl border border-pink-200/80 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-pink-100">
                  <div className="flex items-center gap-2">
                    <Film className="w-4 h-4 text-pink-600" />
                    <span className="font-bold text-gray-900 text-xs">
                      মাল্টি-মিডিয়া গ্যালারি ও ভিডিও রিল (Media Gallery & Reels)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                    {formData.media_gallery.length} টি আইটেম
                  </span>
                </div>

                {/* বর্তমান মিডিয়া আইটেম তালিকা (রি-অর্ডারিং সহ) */}
                {formData.media_gallery.length > 0 && (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {formData.media_gallery.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between p-2 bg-white rounded-xl border border-gray-200 hover:border-pink-300 shadow-2xs gap-2 transition"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* প্রিভিউ থাম্বনেইল */}
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-900 flex-shrink-0 relative border border-gray-100">
                            {item.type === 'VIDEO' ? (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-pink-400">
                                <Play className="w-4 h-4 fill-current" />
                              </div>
                            ) : (
                              <img
                                src={item.url}
                                alt="preview"
                                className="w-full h-full object-cover"
                              />
                            )}
                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center font-bold">
                              #{idx + 1}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                  item.type === 'VIDEO'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-emerald-100 text-emerald-700'
                                }`}
                              >
                                {item.type === 'VIDEO' ? '🎥 ভিডিও রিল' : '📷 ছবি'}
                              </span>
                              {idx === 0 && (
                                <span className="text-[9px] font-bold bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded">
                                  প্রধান থাম্বনেইল
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 truncate max-w-xs font-mono mt-0.5">
                              {item.url}
                            </p>
                          </div>
                        </div>

                        {/* রি-অর্ডার ও ডিলিট বাটন */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleMoveMediaItem(idx, -1)}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 hover:bg-gray-100 rounded transition"
                            title="উপরে নিন"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === formData.media_gallery.length - 1}
                            onClick={() => handleMoveMediaItem(idx, 1)}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 hover:bg-gray-100 rounded transition"
                            title="নিচে নিন"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveMediaItem(idx)}
                            className="p-1 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded transition"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* নতুন মিডিয়া আইটেম যোগ ফর্ম */}
                <div className="bg-white p-3 rounded-xl border border-pink-200/60 space-y-2.5">
                  <span className="text-[11px] font-bold text-gray-800 block">
                    + নতুন ছবি বা ভিডিও রিল যোগ করুন:
                  </span>

                  {/* টাইপ সিলেকশন */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMediaInput((prev) => ({ ...prev, type: 'IMAGE' }))}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold border transition flex items-center justify-center gap-1.5 ${
                        mediaInput.type === 'IMAGE'
                          ? 'bg-pink-50 border-pink-400 text-pink-700 shadow-2xs'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>📷 প্রোডাক্ট ইমেজ (Image)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMediaInput((prev) => ({ ...prev, type: 'VIDEO' }))}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-bold border transition flex items-center justify-center gap-1.5 ${
                        mediaInput.type === 'VIDEO'
                          ? 'bg-purple-50 border-purple-400 text-purple-700 shadow-2xs'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>🎥 ভিডিও রিল (MP4/WebM)</span>
                    </button>
                  </div>

                  {/* URL ইনপুটস */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder={
                          mediaInput.type === 'VIDEO'
                            ? 'ভিডিও URL (https://... .mp4)'
                            : 'ইমেজ URL (https://... .jpg)'
                        }
                        value={mediaInput.url}
                        onChange={(e) => setMediaInput((prev) => ({ ...prev, url: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-gray-50/50"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="থাম্বনেইল URL (ঐচ্ছিক)"
                        value={mediaInput.thumbnail_url}
                        onChange={(e) => setMediaInput((prev) => ({ ...prev, thumbnail_url: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-gray-50/50"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddMediaItem}
                    disabled={!mediaInput.url.trim()}
                    className="w-full py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl text-xs font-bold shadow-xs hover:from-pink-700 hover:to-rose-700 active:scale-95 disabled:opacity-40 transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> গ্যালারিতে যুক্ত করুন
                  </button>
                </div>

                {/* কুইক ফলব্যাক প্রধান ইমেজ লিংক */}
                <div>
                  <label className="block font-semibold text-gray-600 text-[11px] mb-1">
                    কুইক প্রধান ইমেজ লিংক (Quick Default Image URL):
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-xs focus:outline-pink-500 bg-white"
                  />
                </div>
              </div>

              {/* রিটার্ন পলিসি ও কুলিং উইন্ডো কনফিগারেশন */}
              <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-200/70 space-y-3">
                <div>
                  <label className="block font-semibold text-gray-800 text-xs mb-1.5 flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4 text-blue-600" />
                    <span>রিটার্ন পলিসি টাইপ (Return Policy):</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, returnPolicyType: 'NO_RETURN', returnDays: 0 })}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                        formData.returnPolicyType === 'NO_RETURN'
                          ? 'bg-amber-50 border-amber-300 text-amber-950 ring-2 ring-amber-400/30'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>NO_RETURN (নো-রিটার্ন)</span>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        চেক করে রিসিভ, পরবর্তীতে কোনো রিটার্ন প্রযোজ্য নয় (২৪ ঘণ্টা সেফটি বাফার)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, returnPolicyType: 'RETURNABLE', returnDays: formData.returnDays || 7 })}
                      className={`p-3 rounded-xl border text-left flex flex-col gap-1 transition ${
                        formData.returnPolicyType === 'RETURNABLE'
                          ? 'bg-blue-50 border-blue-300 text-blue-950 ring-2 ring-blue-400/30'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold">
                        <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                        <span>RETURNABLE (রিটার্নযোগ্য)</span>
                      </div>
                      <span className="text-[11px] text-gray-500">
                        গ্রাহক নির্দিষ্ট দিনের ভেতর রিটার্ন করতে পারবেন (কুরিয়ার চার্জ গ্রাহক বহন করবেন)
                      </span>
                    </button>
                  </div>
                </div>

                {formData.returnPolicyType === 'RETURNABLE' && (
                  <div className="pt-2 border-t border-blue-100 flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                        রিটার্ন সময়সীমা (দিন সংখ্যা):
                      </label>
                      <select
                        value={formData.returnDays || 7}
                        onChange={(e) => setFormData({ ...formData, returnDays: Number(e.target.value) })}
                        className="w-full px-3 py-2 border border-blue-200 rounded-xl text-xs bg-white focus:outline-blue-500"
                      >
                        <option value={3}>৩ দিন (3 Days)</option>
                        <option value={5}>৫ দিন (5 Days)</option>
                        <option value={7}>৭ দিন (7 Days - Standard)</option>
                        <option value={10}>১০ দিন (10 Days)</option>
                        <option value={14}>১৪ দিন (14 Days)</option>
                        <option value={30}>৩০ দিন (30 Days)</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[11px] font-semibold text-gray-500 mb-1">
                        রেফারেল কমিশন রিলিজ সিঙ্ক:
                      </label>
                      <div className="p-2 bg-white rounded-xl border border-blue-100 text-[11px] text-blue-900">
                        ডেলিভারির <strong>{formData.returnDays || 7} দিন</strong> পর আপলাইন কমিশন ওয়ালেটে ক্রেডিট হবে
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-blue-100">
                  <label className="block text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>ওয়ারেন্টি টেক্সট (Warranty Text - ঐচ্ছিক):</span>
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: 7 Days Replacement বা ৬ মাসের ফ্রি পলিশিং ওয়ারেন্টি"
                    value={formData.warrantyText}
                    onChange={(e) => setFormData({ ...formData, warrantyText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-pink-500"
                  />
                </div>
              </div>

              {/* স্টক অবস্থা */}
              <div className="p-4 bg-pink-50/30 rounded-2xl border border-pink-100 flex items-center justify-between">
                <span className="font-semibold text-gray-800 text-xs">স্টক প্রাপ্যতা (Stock Availability):</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                  <span className="ml-2 text-xs font-semibold text-gray-700">
                    {formData.inStock ? 'স্টকে আছে (In Stock)' : 'স্টক আউট (Out of Stock)'}
                  </span>
                </label>
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
