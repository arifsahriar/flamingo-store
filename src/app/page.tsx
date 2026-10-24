"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Droplets,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  User,
  Menu,
  X,
  Truck,
  Gift,
  Share2,
  ArrowRight,
  Star,
  Phone,
  Mail,
  MapPin,
  RotateCcw,
  BadgePercent,
  Check,
  ChevronRight,
  Award,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  bengaliName: string;
  category: string;
  price: number;
  originalPrice: number;
  discountTag: string;
  tag: string;
  rating: number;
  reviewsCount: number;
  image: string;
  specs: string[];
}

const FEATURED_PRODUCTS: Product[] = [
  {
    id: "flamingo-silver-pendant",
    name: "925 Sterling Silver Solitaire Pendant Necklace",
    bengaliName: "৯২৫ স্টার্লিং সিলভার সলিটায়ার পেন্ডেন্ট নেকলেস",
    category: "নেকলেস ও পেন্ডেন্ট",
    price: 1850,
    originalPrice: 2450,
    discountTag: "২৪% ছাড়",
    tag: "বেস্টসেলার",
    rating: 4.9,
    reviewsCount: 168,
    image:
      "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=900&auto=format&fit=crop",
    specs: ["খাঁটি ৯২৫ সিলভার", "Anti-Tarnish", "Hallmarked 925"],
  },
  {
    id: "flamingo-silver-twist-bangle",
    name: "925 Silver Minimalist Twist Bangle",
    bengaliName: "৯২৫ সিলভার মিনিমালিস্ট টুইস্ট ব্যাঙ্গেল",
    category: "ব্যাঙ্গেল ও ব্রেসলেট",
    price: 2250,
    originalPrice: 2950,
    discountTag: "২৪% ছাড়",
    tag: "ট্রেন্ডিং",
    rating: 5.0,
    reviewsCount: 114,
    image:
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?q=80&w=900&auto=format&fit=crop",
    specs: ["925 Hallmark", "হ্যান্ড পলিশড", "Hypoallergenic"],
  },
  {
    id: "flamingo-silver-halo-ring",
    name: "925 Silver Sparkling Halo Ring",
    bengaliName: "৯২৫ সিলভার স্পার্কলিং হ্যালো রিং",
    category: "আংটি ও ব্যান্ডস",
    price: 1450,
    originalPrice: 1950,
    discountTag: "২৬% ছাড়",
    tag: "নিউ অ্যারাইভাল",
    rating: 4.9,
    reviewsCount: 89,
    image:
      "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=900&auto=format&fit=crop",
    specs: ["AAA+ জিরকন", "রোডিয়াম প্রটেকশন", "Waterproof"],
  },
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);

  // Quick order form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleOrderClick = (product: Product) => {
    setSelectedProduct(product);
    setOrderModalOpen(true);
    setOrderSuccess(false);
  };

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !customerAddress) {
      showToast("অনুগ্রহ করে আপনার নাম, মোবাইল নম্বর ও ঠিকানা দিন।");
      return;
    }
    setOrderSuccess(true);
    setCartCount((prev) => prev + 1);
    setTimeout(() => {
      setOrderModalOpen(false);
      setOrderSuccess(false);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      showToast("ধন্যবাদ! আপনার ৯২৫ সিলভার জুয়েলারি অর্ডারটি সফলভাবে গৃহীত হয়েছে।");
    }, 1800);
  };

  const handleCopyReferral = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("SILVER-FLAMINGO10");
      setCopiedReferral(true);
      showToast("রেফারেল কোড 'SILVER-FLAMINGO10' কপি করা হয়েছে!");
      setTimeout(() => setCopiedReferral(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF5F5] via-[#FFF1F2] to-[#FFE4E6] text-slate-800 font-sans relative selection:bg-[#FDA4AF] selection:text-[#881337]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-white text-slate-900 border border-[#FDA4AF] shadow-xl shadow-rose-950/10 px-5 py-3.5 rounded-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-2.5 h-2.5 rounded-full bg-[#E11D48] animate-pulse" />
          <p className="text-sm font-medium">{toastMessage}</p>
        </div>
      )}

      {/* 1. TOP ANNOUNCEMENT BAR */}
      <div className="bg-gradient-to-r from-[#FFE4E6] via-[#FFF1F2] to-[#FFE4E6] border-b border-[#FECDD3] text-rose-950 py-2.5 px-4 text-xs md:text-sm tracking-wide">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center font-medium">
          <Truck className="w-4 h-4 text-[#E11D48] shrink-0 inline-block animate-pulse" />
          <span>
            সমগ্র বাংলাদেশে ক্যাশ অন ডেলিভারি{" "}
            <span className="text-[#E11D48] font-bold mx-1">|</span>{" "}
            ডেলিভারির সময় পার্সেল চেক করে নেওয়ার সুযোগ
          </span>
        </div>
      </div>

      {/* 2. HEADER / NAVIGATION BAR WITH LOGO */}
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#FECDD3]/70 transition-all duration-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#E11D48] focus:outline-none transition-colors"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Brand Logo & Name */}
          <div className="flex items-center">
            <a href="#home" className="group flex items-center gap-3.5">
              <div className="relative w-[53px] h-[53px] sm:w-[58px] sm:h-[58px] rounded-full overflow-hidden border border-[#FDA4AF]/70 shadow-xs bg-white shrink-0 group-hover:scale-105 transition-transform duration-300">
                <Image
                  src="/logo2.png"
                  alt="FLAMINGO Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-serif text-xl sm:text-2xl tracking-[0.3em] uppercase text-slate-900 group-hover:text-[#E11D48] transition-colors font-medium">
                  FLAMINGO
                </span>
                <span className="text-[8.5px] sm:text-[9.5px] tracking-[0.28em] uppercase text-[#E11D48] font-semibold mt-0.5">
                  Elegance That Endures
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Minimalist Links */}
          <nav className="hidden md:flex items-center space-x-8 lg:space-x-10 text-xs uppercase tracking-[0.2em] text-slate-700 font-medium">
            <a
              href="#home"
              className="hover:text-[#E11D48] transition-colors duration-200 py-1 border-b-2 border-transparent hover:border-[#E11D48]"
            >
              Home
            </a>
            <a
              href="#collections"
              className="hover:text-[#E11D48] transition-colors duration-200 py-1 border-b-2 border-transparent hover:border-[#E11D48]"
            >
              Collections
            </a>
            <a
              href="#warranty"
              className="hover:text-[#E11D48] transition-colors duration-200 py-1 border-b-2 border-transparent hover:border-[#E11D48]"
            >
              Warranty
            </a>
            <a
              href="#contact"
              className="hover:text-[#E11D48] transition-colors duration-200 py-1 border-b-2 border-transparent hover:border-[#E11D48]"
            >
              Contact
            </a>
          </nav>

          {/* Action Buttons: Cart & Account */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() =>
                showToast("লগইন বা অ্যাকাউন্ট তৈরি করতে নিচের ভিআইপি ব্যানারটি দেখুন!")
              }
              className="p-2.5 text-slate-700 hover:text-[#E11D48] hover:bg-rose-50 transition-colors rounded-full"
              title="অ্যাকাউন্ট (Account)"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                if (cartCount === 0) {
                  showToast("আপনার ব্যাগ খালি। কালেকশন থেকে পছন্দের ৯২৫ সিলভার জুয়েলারি বেছে নিন!");
                } else {
                  showToast(`আপনার ব্যাগে ${cartCount}টি আইটেম রয়েছে।`);
                }
              }}
              className="relative p-2.5 text-slate-700 hover:text-[#E11D48] hover:bg-rose-50 transition-colors rounded-full"
              title="শপিং ব্যাগ (Cart)"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute 1 top-1 right-1 bg-gradient-to-r from-[#F43F5E] to-[#E11D48] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-b border-[#FECDD3] px-6 py-5 space-y-4 text-sm tracking-[0.15em] uppercase text-slate-700 font-medium">
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
              className="block hover:text-[#E11D48] transition-colors"
            >
              Home (হোম)
            </a>
            <a
              href="#collections"
              onClick={() => setMobileMenuOpen(false)}
              className="block hover:text-[#E11D48] transition-colors"
            >
              Collections (কালেকশন)
            </a>
            <a
              href="#warranty"
              onClick={() => setMobileMenuOpen(false)}
              className="block hover:text-[#E11D48] transition-colors"
            >
              Warranty (ওয়ারেন্টি)
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block hover:text-[#E11D48] transition-colors"
            >
              Contact (যোগাযোগ)
            </a>
          </div>
        )}
      </header>

      {/* 3. HERO SECTION */}
      <section
        id="home"
        className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32"
      >
        {/* Soft Ambient Light Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[400px] bg-[radial-gradient(ellipse_at_top,_rgba(253,164,175,0.35)_0%,_transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Luxury Hallmark Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#FDA4AF] text-[#E11D48] text-xs font-semibold tracking-[0.2em] uppercase shadow-xs">
                <Award className="w-3.5 h-3.5 text-[#E11D48]" />
                <span>Premium 925 Sterling Silver • খাঁটি ৯২৫ সিলভার</span>
              </div>

              {/* Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-900 font-light leading-[1.15]">
                Elegance That{" "}
                <span className="italic font-normal bg-gradient-to-r from-[#E11D48] via-[#F43F5E] to-[#BE123C] bg-clip-text text-transparent">
                  Endures
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg lg:text-xl text-slate-700 font-normal max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                খাঁটি ৯২৫ স্টার্লিং সিলভারের স্নিগ্ধ আভিজাত্য — যা আপনার প্রতিদিনের সৌন্দর্যকে করে তোলে চিরস্থায়ী।
              </p>

              <div className="pt-2 text-sm text-slate-600 font-light max-w-xl mx-auto lg:mx-0 leading-relaxed">
                প্রতিটি গহনায় রয়েছে আন্তর্জাতিক ৯২৫ সিলভার হলমার্ক নিশ্চয়তা, অ্যান্টি-টার্নিশ ফিনিশিং এবং সংবেদনশীল ত্বকের জন্য শতভাগ অ্যালার্জি-মুক্ত সুরক্ষা।
              </div>

              {/* CTA Button Group */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <a
                  href="#collections"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#F43F5E] to-[#E11D48] text-white font-semibold text-sm tracking-wider uppercase shadow-md shadow-rose-500/25 hover:shadow-lg hover:shadow-rose-500/35 hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 group"
                >
                  <span>কালেকশন দেখুন (Shop Collection)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="#warranty"
                  className="w-full sm:w-auto px-6 py-4 rounded-xl border border-[#FECDD3] bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 text-sm tracking-wider uppercase transition-all duration-200 shadow-xs flex items-center justify-center gap-2"
                >
                  <span>সার্টিফিকেট ও পলিসি</span>
                </a>
              </div>

              {/* Trust Micro-Metrics */}
              <div className="pt-6 border-t border-[#FECDD3]/70 grid grid-cols-3 gap-4 text-center lg:text-left max-w-lg mx-auto lg:mx-0">
                <div>
                  <div className="font-serif text-lg sm:text-xl text-[#E11D48] font-bold">
                    925 Hallmark
                  </div>
                  <div className="text-[11px] text-slate-600">খাঁটি সিলভার স্ট্যাম্প</div>
                </div>
                <div>
                  <div className="font-serif text-lg sm:text-xl text-slate-800 font-bold">
                    Anti-Tarnish
                  </div>
                  <div className="text-[11px] text-slate-600">দীর্ঘস্থায়ী উজ্জ্বলতা</div>
                </div>
                <div>
                  <div className="font-serif text-lg sm:text-xl text-[#E11D48] font-bold">
                    100% Skin Safe
                  </div>
                  <div className="text-[11px] text-slate-600">অ্যালার্জি-মুক্ত ধাতু</div>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Soft flamingo halo behind card */}
                <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-b from-[#FDA4AF]/40 to-transparent blur-xl opacity-80" />

                <div className="relative rounded-3xl overflow-hidden border border-[#FDA4AF]/60 bg-white/80 backdrop-blur-md p-3 shadow-xl shadow-rose-950/5">
                  {/* Hero Showcase Image */}
                  <div className="relative h-96 sm:h-[460px] w-full rounded-2xl overflow-hidden group">
                    <Image
                      src="https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=900&auto=format&fit=crop"
                      alt="FLAMINGO 925 Sterling Silver Jewelry"
                      fill
                      priority
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

                    {/* Floating Luxury Tag Top Right */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md border border-[#FDA4AF] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs text-[#E11D48] font-semibold shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#E11D48]" />
                      <span>Pure 925 Silver</span>
                    </div>

                    {/* Floating Info Bottom Left */}
                    <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-[#FECDD3] text-left shadow-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10.5px] uppercase tracking-wider text-[#E11D48] font-bold block">
                            Signature Silver Piece
                          </span>
                          <span className="text-sm font-semibold text-slate-900">
                            Solitaire Pendant Necklace
                          </span>
                        </div>
                        <span className="font-serif font-bold text-lg text-slate-900">
                          ৳ ১,৮৫০
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#E11D48] animate-ping" />
                        <span>অরিজিনাল ৯২৫ সার্টিফিকেট সহ ডেলিভারি</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. 3 DURABILITY BADGES */}
      <section
        id="warranty"
        className="py-16 md:py-24 bg-white/60 backdrop-blur-sm border-y border-[#FECDD3]/70 relative"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading */}
          <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
            <span className="text-xs uppercase tracking-[0.3em] text-[#E11D48] font-bold block mb-2">
              Silver Purity & Craftsmanship
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 font-light">
              খাঁটি ৯২৫ স্টার্লিং সিলভারের নিশ্চয়তা
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-[#E11D48] to-transparent mx-auto mt-4" />
          </div>

          {/* 3 Luxury Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Badge 1: 925 Hallmark */}
            <div className="group relative rounded-2xl bg-white/80 backdrop-blur-md border border-[#FDA4AF]/40 hover:border-[#E11D48]/60 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-950/5">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-[#FECDD3] flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-[#E11D48] group-hover:text-white text-[#E11D48] transition-all duration-300">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#E11D48] mb-1">
                🛡️ Authentic 925 Hallmark
              </div>
              <h3 className="font-serif text-xl text-slate-900 font-medium mb-3">
                খাঁটি ৯২৫ স্টার্লিং সিলভার স্ট্যাম্প ও সার্টিফিকেট
              </h3>
              <p className="text-sm text-slate-600 font-light leading-relaxed">
                প্রতিটি গহনায় রয়েছে খাঁটি 925 সিলভার স্ট্যাম্প এবং ফ্ল্যামিঙ্গো অথেনটিসিটি কার্ড, যা সিলভারের বিশুদ্ধতা নিশ্চিত করে।
              </p>
            </div>

            {/* Badge 2: Anti-Tarnish Coating & Waterproof */}
            <div className="group relative rounded-2xl bg-white/80 backdrop-blur-md border border-[#FDA4AF]/40 hover:border-[#E11D48]/60 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-950/5">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-[#FECDD3] flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-[#E11D48] group-hover:text-white text-[#E11D48] transition-all duration-300">
                <Droplets className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#E11D48] mb-1">
                💧 Anti-Tarnish Coating & Waterproof
              </div>
              <h3 className="font-serif text-xl text-slate-900 font-medium mb-3">
                দৈনন্দিন ব্যবহারে রঙ উজ্জ্বল ও দীর্ঘস্থায়ী
              </h3>
              <p className="text-sm text-slate-600 font-light leading-relaxed">
                উন্নত রোডিয়াম ও অ্যান্টি-অক্সিডেশন প্রোটেকটিভ কোটিংয়ের ফলে নিয়মিত পরিধান বা পানিতে ভিজলেও রূপালী দীপ্তি থাকে অটুট।
              </p>
            </div>

            {/* Badge 3: 100% Skin Safe & Hypoallergenic */}
            <div className="group relative rounded-2xl bg-white/80 backdrop-blur-md border border-[#FDA4AF]/40 hover:border-[#E11D48]/60 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-rose-950/5">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-[#FECDD3] flex items-center justify-center mb-6 group-hover:scale-105 group-hover:bg-[#E11D48] group-hover:text-white text-[#E11D48] transition-all duration-300">
                <Sparkles className="w-7 h-7" />
              </div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-[#E11D48] mb-1">
                ✨ 100% Skin Safe & Hypoallergenic
              </div>
              <h3 className="font-serif text-xl text-slate-900 font-medium mb-3">
                নিকেল-মুক্ত, সংবেদনশীল ত্বকেও অ্যালার্জি-মুক্ত
              </h3>
              <p className="text-sm text-slate-600 font-light leading-relaxed">
                সম্পূর্ণ নিকেল ও সীসা মুক্ত আন্তর্জাতিক জুয়েলারি স্ট্যান্ডার্ডে তৈরি, যা স্পর্শকাতর ত্বকেও দেয় সারাদিন স্বাচ্ছন্দ্যময় অনুভূতি।
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED SILVER JEWELRY COLLECTION (3 Starter Cards) */}
      <section id="collections" className="py-20 md:py-28 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-[#E11D48] font-bold block mb-2">
                Pure Silver Collection
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-slate-900 font-light">
                ৯২৫ স্টার্লিং সিলভার কালেকশন
              </h2>
              <p className="text-slate-600 text-sm mt-2 font-normal">
                চিরন্তন আভিজাত্য ও আধুনিক রূপালী দ্যোতনার অনন্য নিদর্শন
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#E11D48] font-semibold">
              <span>খাঁটি ৯২৫ সিলভার কালেকশন</span>
              <ChevronRight className="w-4 h-4 text-[#E11D48]" />
            </div>
          </div>

          {/* 3 Luxury 925 Silver Product Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FEATURED_PRODUCTS.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl bg-white/90 backdrop-blur-md border border-[#FDA4AF]/40 hover:border-[#E11D48]/60 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-xl hover:shadow-rose-950/5"
              >
                {/* Image Container */}
                <div className="relative aspect-square w-full overflow-hidden bg-rose-50/50">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-60" />

                  {/* Discount Tag Top Left */}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-[#F43F5E] to-[#E11D48] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs uppercase tracking-wider">
                    {product.discountTag}
                  </div>

                  {/* Micro-badge Top Right */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md border border-[#FECDD3] text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs">
                    {product.tag}
                  </div>

                  {/* Spec pills overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5">
                    {product.specs.map((spec, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-white/90 backdrop-blur-md border border-[#FECDD3] text-slate-700 font-medium px-2 py-0.5 rounded-full shadow-xs"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Category & Rating */}
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                      <span>{product.category}</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span className="font-semibold text-slate-800">{product.rating}</span>
                        <span className="text-[11px] text-slate-400">
                          ({product.reviewsCount})
                        </span>
                      </div>
                    </div>

                    {/* Product Names */}
                    <h3 className="font-serif text-lg text-slate-900 font-medium group-hover:text-[#E11D48] transition-colors leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{product.bengaliName}</p>
                  </div>

                  {/* Price Block */}
                  <div className="pt-3 border-t border-[#FECDD3]/60 flex items-baseline justify-between">
                    <div>
                      <div className="text-xs text-slate-500 font-medium">অফার মূল্য:</div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-2xl font-bold text-slate-900">
                          ৳ {product.price.toLocaleString("bn-BD")}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ৳ {product.originalPrice.toLocaleString("bn-BD")}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#E11D48] font-semibold bg-rose-50 border border-[#FECDD3] px-2.5 py-0.5 rounded-full">
                      ৯২৫ সিলভার
                    </span>
                  </div>

                  {/* Order Button */}
                  <button
                    onClick={() => handleOrderClick(product)}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F43F5E] to-[#E11D48] text-white font-semibold text-xs uppercase tracking-widest hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-rose-500/20"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>অর্ডার করুন (Order Now)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery & Ordering Assurance Strip */}
          <div className="mt-12 p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-[#FDA4AF]/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-slate-700 font-medium shadow-xs">
            <div className="flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-[#E11D48]" />
              <span>খাঁটি ৯২৫ সিলভার অথেনটিসিটি কার্ড সহ ডেলিভারি</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#E11D48]" />
              <span>পার্সেল দেখে নেওয়ার ১০০% ফ্রি রিটার্ন সুবিধা</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Truck className="w-4 h-4 text-[#E11D48]" />
              <span>সারা বাংলাদেশে ক্যাশ অন ডেলিভারি</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. VIP PRIVILEGE CLUB BANNER (Growth Loop & Referral) */}
      <section className="py-16 md:py-24 bg-white/60 backdrop-blur-sm relative overflow-hidden border-t border-[#FECDD3]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="rounded-3xl bg-gradient-to-br from-white via-[#FFF1F2] to-[#FFE4E6] border border-[#FDA4AF] p-8 sm:p-12 lg:p-16 shadow-lg shadow-rose-950/5 relative overflow-hidden">
            {/* Inner Flamingo Ambient Accent */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-b from-[#FDA4AF]/30 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Growth Loop Offers */}
              <div className="lg:col-span-8 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-[#FDA4AF] text-[#E11D48] text-xs font-bold tracking-widest uppercase shadow-xs">
                  <Gift className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span>FLAMINGO SILVER PRIVILEGE CLUB</span>
                </div>

                <div className="space-y-4">
                  {/* Offer 1 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#FDA4AF] flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <BadgePercent className="w-5 h-5 text-[#E11D48]" />
                    </div>
                    <div>
                      <h3 className="font-serif text-xl sm:text-2xl text-slate-900 font-medium">
                        প্রথম অর্ডারে অ্যাকাউন্ট খুললেই পরবর্তী সব অর্ডারে ১০% নিশ্চিত ডিসকাউন্ট!
                      </h3>
                      <p className="text-sm text-slate-600 mt-1 font-light">
                        ফ্ল্যামিঙ্গো পরিবারের অংশ হোন। প্রতি অর্ডারে উপভোগ করুন আজীবন প্রিভিলেজ
                        রিওয়ার্ড ও এক্সক্লুসিভ আর্লি অ্যাক্সেস।
                      </p>
                    </div>
                  </div>

                  {/* Offer 2 */}
                  <div className="flex items-start gap-4 pt-3 border-t border-[#FECDD3]/70">
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#FDA4AF] flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <Share2 className="w-5 h-5 text-[#E11D48]" />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg sm:text-xl text-slate-900 font-medium">
                        বন্ধুকে রেফার করে জিতে নিন অতিরিক্ত ক্যাশব্যাক ও ডিসকাউন্ট।
                      </h4>
                      <p className="text-sm text-slate-600 mt-1 font-light">
                        আপনার রেফারেল কোড ব্যবহারে বন্ধু পাবেন ফ্ল্যাট ৫% ছাড়, আর আপনি পাবেন পরবর্তী
                        অর্ডারে ইনস্ট্যান্ট ক্যাশব্যাক ভাউচার!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Code Box */}
              <div className="lg:col-span-4 bg-white border border-[#FDA4AF] rounded-2xl p-6 sm:p-8 text-center space-y-5 shadow-xs">
                <span className="text-xs uppercase tracking-[0.2em] text-[#E11D48] font-bold block">
                  স্পেশাল রেফারেল কোড
                </span>

                <div className="p-4 rounded-xl bg-rose-50/60 border border-dashed border-[#FDA4AF] font-mono text-xl sm:text-2xl tracking-widest text-[#E11D48] font-bold">
                  SILVER-FLAMINGO10
                </div>

                <button
                  onClick={handleCopyReferral}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#F43F5E] to-[#E11D48] text-white font-semibold text-xs tracking-wider uppercase hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md shadow-rose-500/20"
                >
                  {copiedReferral ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>কপি সম্পন্ন হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Gift className="w-4 h-4" />
                      <span>রেফারেল কোড কপি করুন</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-500">
                  চেকআউট পেজে অথবা সরাসরি প্রতিনিধিকে জানিয়ে এই ডিসকাউন্ট নিশ্চিত করুন।
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" className="bg-[#FFF1F2] border-t border-[#FECDD3] pt-16 pb-12 text-sm text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Col 1: Brand story & Logo */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#FDA4AF] bg-white shrink-0 shadow-xs">
                  <Image
                    src="/logo2.png"
                    alt="FLAMINGO Logo"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-xl tracking-[0.3em] uppercase text-slate-900 font-medium">
                    FLAMINGO
                  </span>
                  <span className="text-[9px] tracking-[0.25em] uppercase text-[#E11D48] font-semibold">
                    Elegance That Endures
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                বাংলাদেশে খাঁটি ৯২৫ স্টার্লিং সিলভারের আধুনিক, হাইপোঅ্যালার্জেনিক ও অ্যান্টি-টার্নিশ লাক্সারি জুয়েলারি ব্র্যান্ড।
              </p>
            </div>

            {/* Col 2: Navigation Links */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#E11D48] font-bold mb-4">
                সিলভার কালেকশন
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li>
                  <a href="#collections" className="hover:text-[#E11D48] transition-colors">
                    ৯২৫ সিলভার সলিটায়ার পেন্ডেন্ট
                  </a>
                </li>
                <li>
                  <a href="#collections" className="hover:text-[#E11D48] transition-colors">
                    মিনিমালিস্ট সিলভার টুইস্ট ব্যাঙ্গেল
                  </a>
                </li>
                <li>
                  <a href="#collections" className="hover:text-[#E11D48] transition-colors">
                    স্পার্কলিং জিরকন হ্যালো রিং
                  </a>
                </li>
                <li>
                  <a href="#warranty" className="hover:text-[#E11D48] transition-colors">
                    ৯২৫ হলমার্ক ও অথেনটিসিটি সার্টিফিকেট
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Customer Service */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#E11D48] font-bold mb-4">
                গ্রাহক সহায়তা ও হেল্পলাইন
              </h4>
              <ul className="space-y-3 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#E11D48] shrink-0" />
                  <span>হটলাইন: +880 1700-000000</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#E11D48] shrink-0" />
                  <span>ইমেইল: care@flamingostore.bd</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#E11D48] shrink-0" />
                  <span>ধানমন্ডি, ঢাকা - ১২০৯, বাংলাদেশ</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Trust & Payment Reassurance */}
            <div>
              <h4 className="text-xs uppercase tracking-[0.2em] text-[#E11D48] font-bold mb-4">
                ডেলিভারি ও পেমেন্ট
              </h4>
              <p className="text-xs text-slate-600 mb-3 leading-relaxed font-light">
                পণ্য হাতে পেয়ে চেক করে পেমেন্ট করার শতভাগ নিশ্চয়তা। বিকাশ, নগদ ও কার্ড গ্রহণ করা হয়।
              </p>
              <div className="p-3 rounded-xl bg-white border border-[#FECDD3] flex items-center justify-between text-[11px] text-[#E11D48] font-semibold shadow-xs">
                <span>ক্যাশ অন ডেলিভারি</span>
                <span>•</span>
                <span>৯২৫ হলমার্ক</span>
                <span>•</span>
                <span>ফ্রি রিটার্ন</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[#FECDD3] flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <p>© 2026 FLAMINGO Jewelry. All rights reserved.</p>
            <p className="text-[11px] text-slate-500 tracking-wider">
              ELEGANCE THAT ENDURES • PURE 925 STERLING SILVER
            </p>
          </div>
        </div>
      </footer>

      {/* QUICK ORDER MODAL */}
      {orderModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white border border-[#FDA4AF] rounded-2xl p-6 sm:p-8 shadow-2xl text-left">
            {/* Close Button */}
            <button
              onClick={() => setOrderModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {orderSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 border border-[#FDA4AF] text-[#E11D48] flex items-center justify-center mx-auto animate-bounce">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-serif text-2xl text-slate-900 font-medium">অর্ডার সফল হয়েছে!</h3>
                <p className="text-sm text-slate-600">
                  আমাদের প্রতিনিধি শীঘ্রই কল করে আপনার ৯২৫ সিলভার অর্ডারটি কনফার্ম করবেন।
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#E11D48] font-bold block mb-1">
                  ক্যাশ অন ডেলিভারি দ্রুত অর্ডার
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-slate-900 font-medium mb-4">
                  {selectedProduct.name}
                </h3>

                {/* Selected Product Summary */}
                <div className="flex items-center gap-4 p-3 rounded-xl bg-rose-50/50 border border-[#FECDD3] mb-6">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-600 truncate font-medium">
                      {selectedProduct.bengaliName}
                    </p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-serif text-lg font-bold text-slate-900">
                        ৳ {selectedProduct.price.toLocaleString("bn-BD")}
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        ৳ {selectedProduct.originalPrice.toLocaleString("bn-BD")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-[#E11D48] font-bold">
                      {selectedProduct.discountTag}
                    </span>
                  </div>
                </div>

                {/* Order Form */}
                <form onSubmit={handleConfirmOrder} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 mb-1.5 font-semibold">
                      আপনার নাম <span className="text-[#E11D48]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="উদাঃ নুসরাত জাহান"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#FECDD3] focus:border-[#E11D48] text-slate-900 text-sm outline-none transition-colors shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 mb-1.5 font-semibold">
                      মোবাইল নম্বর <span className="text-[#E11D48]">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="017XXXXXXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#FECDD3] focus:border-[#E11D48] text-slate-900 text-sm outline-none transition-colors shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-700 mb-1.5 font-semibold">
                      ডেলিভারি ঠিকানা <span className="text-[#E11D48]">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="বাসা নম্বর, রোড নম্বর, এলাকা, জেলা"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#FECDD3] focus:border-[#E11D48] text-slate-900 text-sm outline-none transition-colors resize-none shadow-xs"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-4 rounded-xl bg-gradient-to-r from-[#F43F5E] to-[#E11D48] text-white font-bold text-sm tracking-widest uppercase hover:brightness-105 active:scale-[0.99] transition-all shadow-md shadow-rose-500/25 flex items-center justify-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      <span>অর্ডার নিশ্চিত করুন (ক্যাশ অন ডেলিভারি)</span>
                    </button>
                    <p className="text-[11px] text-center text-slate-500 mt-2">
                      পার্সেল পৌঁছানোর পর দেখে মূল্য পরিশোধ করবেন। ৯২৫ সিলভার অথেনটিসিটি কার্ড অন্তর্ভুক্ত।
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
