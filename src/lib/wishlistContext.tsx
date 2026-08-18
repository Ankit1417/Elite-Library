"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { fetchApi } from "./api";
import { useAuth } from "./authContext";
import { useRouter } from "next/navigation";

export interface WishlistBook {
  _id: string;
  title: string;
  slug: string;
  author: string;
  coverImage: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  stockQuantity: number;
  category?: { name: string; slug?: string };
}

interface WishlistContextType {
  wishlistIds: string[];
  wishlistBooks: WishlistBook[];
  isLoading: boolean;
  isWishlisted: (bookId: string) => boolean;
  toggleWishlist: (bookId: string) => Promise<boolean>;
  addToWishlist: (bookId: string) => Promise<boolean>;
  removeFromWishlist: (bookId: string) => Promise<boolean>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [wishlistBooks, setWishlistBooks] = useState<WishlistBook[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistBooks([]);
      setWishlistIds([]);
      return;
    }
    try {
      setIsLoading(true);
      const res = await fetchApi<{ wishlist: WishlistBook[] }>("/wishlist");
      if (res.success && Array.isArray(res.data?.wishlist)) {
        setWishlistBooks(res.data.wishlist);
        setWishlistIds(res.data.wishlist.map((b) => b._id));
      }
    } catch (err) {
      console.error("Failed to load wishlist:", err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Expose as refreshWishlist for external callers
  const refreshWishlist = fetchWishlist;

  useEffect(() => {
    // This calls setState asynchronously after an API response — not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchWishlist();
    // fetchWishlist is memoized and stable; we intentionally depend on isAuthenticated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const isWishlisted = useCallback(
    (bookId: string) => {
      return wishlistIds.includes(bookId);
    },
    [wishlistIds]
  );

  const addToWishlist = async (bookId: string): Promise<boolean> => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/")}`);
      return false;
    }

    try {
      const res = await fetchApi<{ wishlist: WishlistBook[] }>(`/wishlist/${bookId}`, {
        method: "POST",
      });
      if (res.success && Array.isArray(res.data?.wishlist)) {
        setWishlistBooks(res.data.wishlist);
        setWishlistIds(res.data.wishlist.map((b) => b._id));
        return true;
      }
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
    }
    return false;
  };

  const removeFromWishlist = async (bookId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const res = await fetchApi<{ wishlist: WishlistBook[] }>(`/wishlist/${bookId}`, {
        method: "DELETE",
      });
      if (res.success && Array.isArray(res.data?.wishlist)) {
        setWishlistBooks(res.data.wishlist);
        setWishlistIds(res.data.wishlist.map((b) => b._id));
        return true;
      }
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
    return false;
  };

  const toggleWishlist = async (bookId: string): Promise<boolean> => {
    if (isWishlisted(bookId)) {
      return removeFromWishlist(bookId);
    }
    return addToWishlist(bookId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistBooks,
        isLoading,
        isWishlisted,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
