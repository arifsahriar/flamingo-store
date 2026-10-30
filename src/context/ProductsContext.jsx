'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS } from '@/data/products';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const ProductsContext = createContext();

// Supabase row -> Frontend Product
const mapSupabaseProduct = (row) => ({
  id: row.id,
  name: row.name,
  category: row.category || 'Jewelry',
  costPrice: Number(row.cost_price) || 0,
  cost_price: Number(row.cost_price) || 0,
  price: Number(row.price) || 0,
  originalPrice: row.discount_price ? Number(row.discount_price) : undefined,
  images: Array.isArray(row.images) && row.images.length > 0 
    ? row.images 
    : [row.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'],
  image: (Array.isArray(row.images) && row.images[0]) || row.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
  purity: row.purity || '৯২৫ স্টার্লিং সিলভার',
  coating: row.coating || 'অ্যান্টি-টার্নিশ রোডিয়াম ফিনিশ',
  inStock: typeof row.stock === 'number' ? row.stock > 0 : true,
  stock: row.stock ?? 20,
  hasWarranty: typeof row.warranty_days === 'number' ? row.warranty_days > 0 : Boolean(row.hasWarranty),
  warrantyDays: Number(row.warranty_days) || 0,
  warrantyText: row.warranty_text || row.warranty_desc || (row.warranty_days > 0 ? `${row.warranty_days} দিনের ফ্রি পলিশিং ওয়ারেন্টি` : ''),
  warranty_text: row.warranty_text || row.warranty_desc || '',
  returnPolicyType: row.return_policy_type || 'NO_RETURN',
  return_policy_type: row.return_policy_type || 'NO_RETURN',
  returnDays: typeof row.return_days === 'number' ? Number(row.return_days) : 0,
  return_days: typeof row.return_days === 'number' ? Number(row.return_days) : 0,
  shortDescription: row.short_description || '',
  description: row.description || '',
  specs: row.specs || {},
});

// Frontend Product -> Supabase row
const mapToSupabaseProduct = (p) => ({
  id: p.id,
  name: p.name,
  slug: p.slug || p.id,
  cost_price: Number(p.costPrice ?? p.cost_price ?? 0),
  price: Number(p.price) || 0,
  discount_price: p.originalPrice ? Number(p.originalPrice) : null,
  category: p.category || 'Jewelry',
  images: Array.isArray(p.images) ? p.images : [p.image],
  stock: typeof p.stock === 'number' ? p.stock : (p.inStock ? 20 : 0),
  warranty_days: Number(p.warrantyDays) || 0,
  warranty_desc: p.warrantyText || '',
  warranty_text: p.warrantyText || '',
  return_policy_type: p.returnPolicyType || p.return_policy_type || 'NO_RETURN',
  return_days: Number(p.returnDays ?? p.return_days ?? 0),
  description: p.description || '',
  short_description: p.shortDescription || '',
  purity: p.purity || '৯২৫ স্টার্লিং সিলভার',
  coating: p.coating || 'অ্যান্টি-টার্নিশ রোডিয়াম ফিনিশ',
  specs: p.specs || {},
});

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // ১. লোকাল স্টোরেজ থেকে প্রাথমিক লোড (Instant First Render)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('flamingo_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        } else {
          localStorage.setItem('flamingo_products', JSON.stringify(INITIAL_PRODUCTS));
          setProducts(INITIAL_PRODUCTS);
        }
      } else {
        localStorage.setItem('flamingo_products', JSON.stringify(INITIAL_PRODUCTS));
        setProducts(INITIAL_PRODUCTS);
      }
    } catch (e) {
      console.error('Failed to load products from localStorage:', e);
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setIsLoaded(true);
    }

    // ২. সুপাবেজ ডাটাবেজ থেকে লাইভ ফেচ ও হাইব্রিড সিঙ্ক
    const fetchFromSupabase = async () => {
      if (!isSupabaseConfigured()) return;

      try {
        setIsSyncing(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const mapped = data.map(mapSupabaseProduct);
          setProducts(mapped);
          localStorage.setItem('flamingo_products', JSON.stringify(mapped));
        } else if (error) {
          console.warn('Supabase products fetch fallback to local:', error.message);
        }
      } catch (err) {
        console.warn('Supabase offline or unreachable, using local products cache:', err);
      } finally {
        setIsSyncing(false);
      }
    };

    fetchFromSupabase();

    // মাল্টি-ট্যাব সিঙ্ক
    const handleStorageChange = (e) => {
      if (e.key === 'flamingo_products' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setProducts(parsed);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // সেন্ট্রাল সেভ মেথড
  const saveProducts = (newProductsList) => {
    setProducts(newProductsList);
    try {
      localStorage.setItem('flamingo_products', JSON.stringify(newProductsList));
    } catch (e) {
      console.error('Failed to save products to localStorage:', e);
    }
  };

  // নতুন প্রোডাক্ট যোগ করা (হাইব্রিড: লোকাল + সুপাবেজ)
  const addProduct = async (newProduct) => {
    const productWithId = {
      ...newProduct,
      id: newProduct.id || 'flm-' + Date.now(),
      inStock: newProduct.inStock ?? true,
      stock: Number(newProduct.stock) || 20,
      hasWarranty: newProduct.hasWarranty ?? false,
      warrantyDays: Number(newProduct.warrantyDays) || 0,
      warrantyText: newProduct.warrantyText || (newProduct.warrantyDays > 0 ? `${newProduct.warrantyDays} দিনের ওয়ারেন্টি` : 'কোনো ওয়ারেন্টি নেই'),
      images: Array.isArray(newProduct.images) && newProduct.images.length > 0 
        ? newProduct.images 
        : [newProduct.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'],
      image: newProduct.image || (newProduct.images && newProduct.images[0]) || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    };

    const updated = [productWithId, ...products];
    saveProducts(updated);

    // সুপাবেজে ব্যাকগ্রাউন্ডে সেভ
    if (isSupabaseConfigured()) {
      try {
        const payload = mapToSupabaseProduct(productWithId);
        const { error } = await supabase.from('products').insert([payload]);
        if (error) {
          console.warn('Supabase product insert error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase offline during addProduct:', err);
      }
    }

    return productWithId;
  };

  // প্রোডাক্ট আপডেট করা (হাইব্রিড: লোকাল + সুপাবেজ)
  const updateProduct = async (id, updatedFields) => {
    let targetProduct = null;
    const updated = products.map((prod) => {
      if (prod.id === id) {
        const merged = { ...prod, ...updatedFields };
        if (updatedFields.images && updatedFields.images.length > 0) {
          merged.image = updatedFields.images[0];
        }
        targetProduct = merged;
        return merged;
      }
      return prod;
    });
    saveProducts(updated);

    // সুপাবেজে ব্যাকগ্রাউন্ডে আপডেট
    if (isSupabaseConfigured() && targetProduct) {
      try {
        const payload = mapToSupabaseProduct(targetProduct);
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', id);
        if (error) {
          console.warn('Supabase product update error:', error.message);
        }
      } catch (err) {
        console.warn('Supabase offline during updateProduct:', err);
      }
    }
  };

  // স্টক টগল করা (In Stock / Out of Stock)
  const toggleStock = async (id) => {
    let newInStock = true;
    const updated = products.map((prod) => {
      if (prod.id === id) {
        newInStock = !prod.inStock;
        return { ...prod, inStock: newInStock, stock: newInStock ? 20 : 0 };
      }
      return prod;
    });
    saveProducts(updated);

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('products')
          .update({ stock: newInStock ? 20 : 0 })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase offline during toggleStock:', err);
      }
    }
  };

  // প্রোডাক্ট মুছে ফেলা
  const deleteProduct = async (id) => {
    const updated = products.filter((prod) => prod.id !== id);
    saveProducts(updated);

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.warn('Supabase offline during deleteProduct:', err);
      }
    }
  };

  // ডিফল্ট প্রোডাক্টে রিসেট
  const resetToDefault = () => {
    saveProducts(INITIAL_PRODUCTS);
  };

  // আইডি দিয়ে প্রোডাক্ট খোঁজা
  const getProductById = (id) => {
    return products.find((p) => p.id === id) || products[0];
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoaded,
        isSyncing,
        addProduct,
        updateProduct,
        toggleStock,
        deleteProduct,
        resetToDefault,
        getProductById,
        INITIAL_PRODUCTS,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
