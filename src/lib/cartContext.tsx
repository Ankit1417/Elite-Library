"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface CartItem {
  bookId: string;
  title: string;
  slug: string;
  coverImage: string;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  quantity: number;
  stockQuantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => boolean;
  updateQuantity: (bookId: string, quantity: number) => void;
  removeFromCart: (bookId: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discountSavings: number;
  finalTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "elite_library_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    // Defer setting mounted to avoid synchronous setState
    setTimeout(() => setMounted(true), 0);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        // Defer setting cart to avoid synchronous setState
        setTimeout(() => setCart(JSON.parse(stored)), 0);
      }
    } catch {
      setTimeout(() => setCart([]), 0);
    }
  }, [mounted]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save cart to localStorage on updates (only after mounting)
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Ignore localStorage errors
    }
  }, [cart, mounted]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const addToCart = (
    item: Omit<CartItem, "quantity">,
    quantityToAdd = 1
  ): boolean => {
    if (item.stockQuantity <= 0) {
      showToast(`"${item.title}" is currently out of stock`);
      return false;
    }

    const existingIndex = cart.findIndex((i) => i.bookId === item.bookId);
    const updatedCart = [...cart];

    if (existingIndex > -1) {
      const currentQty = updatedCart[existingIndex].quantity;
      const newQty = currentQty + quantityToAdd;

      if (newQty > item.stockQuantity) {
        showToast(
          `Cannot add more. Only ${item.stockQuantity} copy/copies available in stock.`
        );
        return false;
      }

      updatedCart[existingIndex].quantity = newQty;
    } else {
      if (quantityToAdd > item.stockQuantity) {
        showToast(
          `Cannot add. Only ${item.stockQuantity} copy/copies available in stock.`
        );
        return false;
      }
      updatedCart.push({ ...item, quantity: quantityToAdd });
    }

    setCart(updatedCart);
    showToast(`Added "${item.title}" to cart`);
    return true;
  };

  const updateQuantity = (bookId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(bookId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.bookId === bookId) {
          if (newQty > item.stockQuantity) {
            showToast(`Max available stock is ${item.stockQuantity}`);
            return { ...item, quantity: item.stockQuantity };
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (bookId: string) => {
    setCart((prev) => prev.filter((item) => item.bookId !== bookId));
    showToast("Item removed from cart");
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const finalTotal = cart.reduce(
    (acc, item) => acc + item.finalPrice * item.quantity,
    0
  );

  const discountSavings = subtotal - finalTotal;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        subtotal,
        discountSavings,
        finalTotal,
        isCartOpen,
        setIsCartOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
