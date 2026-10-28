'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS } from '@/data/products';

const ProductsContext = createContext();

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // লোকাল স্টোরেজ থেকে প্রোডাক্ট লোড করা
  useEffect(() => {
    try {
      const saved = localStorage.getItem('flamingo_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        } else {
          // খালি থাকলে ইনিশিয়াল প্রোডাক্ট সেভ রাখা
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

    // অন্য ট্যাবে পরিবর্তন হলে সিঙ্ক রাখা
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

  // নতুন প্রোডাক্ট যোগ করা
  const addProduct = (newProduct) => {
    const productWithId = {
      ...newProduct,
      id: newProduct.id || 'flm-' + Date.now(),
      inStock: newProduct.inStock ?? true,
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
    return productWithId;
  };

  // প্রোডাক্ট আপডেট করা
  const updateProduct = (id, updatedFields) => {
    const updated = products.map((prod) => {
      if (prod.id === id) {
        const merged = { ...prod, ...updatedFields };
        if (updatedFields.images && updatedFields.images.length > 0) {
          merged.image = updatedFields.images[0];
        }
        return merged;
      }
      return prod;
    });
    saveProducts(updated);
  };

  // স্টক টগল করা (In Stock / Out of Stock)
  const toggleStock = (id) => {
    const updated = products.map((prod) => 
      prod.id === id ? { ...prod, inStock: !prod.inStock } : prod
    );
    saveProducts(updated);
  };

  // প্রোডাক্ট মুছে ফেলা
  const deleteProduct = (id) => {
    const updated = products.filter((prod) => prod.id !== id);
    saveProducts(updated);
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
