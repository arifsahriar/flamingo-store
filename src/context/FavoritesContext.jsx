'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FavoritesContext = createContext();

const STORAGE_KEY = 'flamingo_favorites';

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastAction, setLastAction] = useState(null); // { type: 'ADD' | 'REMOVE', product, timestamp }

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load favorites from localStorage:', e);
    } finally {
      setIsLoaded(true);
    }

    // Multi-tab sync
    const handleStorage = (e) => {
      if (e.key === STORAGE_KEY) {
        try {
          const updated = e.newValue ? JSON.parse(e.newValue) : [];
          if (Array.isArray(updated)) {
            setFavorites(updated);
          }
        } catch (err) {
          console.error('Failed to parse updated favorites:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Save helper
  const persistFavorites = useCallback((newFavs) => {
    setFavorites(newFavs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavs));
    } catch (e) {
      console.error('Failed to save favorites to localStorage:', e);
    }
  }, []);

  // Check if item is favorited
  const isFavorite = useCallback(
    (productId) => {
      if (!productId) return false;
      return favorites.some((item) => String(item.id) === String(productId));
    },
    [favorites]
  );

  // Add to Favorites
  const addToFavorites = useCallback(
    (product) => {
      if (!product || !product.id) return;
      if (isFavorite(product.id)) return;

      const updated = [product, ...favorites];
      persistFavorites(updated);
      setLastAction({ type: 'ADD', product, timestamp: Date.now() });
    },
    [favorites, isFavorite, persistFavorites]
  );

  // Remove from Favorites
  const removeFromFavorites = useCallback(
    (productId) => {
      if (!productId) return;
      const target = favorites.find((item) => String(item.id) === String(productId));
      const updated = favorites.filter((item) => String(item.id) !== String(productId));
      persistFavorites(updated);
      if (target) {
        setLastAction({ type: 'REMOVE', product: target, timestamp: Date.now() });
      }
    },
    [favorites, persistFavorites]
  );

  // Toggle Favorite
  const toggleFavorite = useCallback(
    (product) => {
      if (!product || !product.id) return;
      if (isFavorite(product.id)) {
        removeFromFavorites(product.id);
      } else {
        addToFavorites(product);
      }
    },
    [isFavorite, addToFavorites, removeFromFavorites]
  );

  // Clear All Favorites
  const clearFavorites = useCallback(() => {
    persistFavorites([]);
    setLastAction({ type: 'CLEAR', timestamp: Date.now() });
  }, [persistFavorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoritesCount: favorites.length,
        isLoaded,
        lastAction,
        isFavorite,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
