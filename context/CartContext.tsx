"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  productId: string;
  businessId: string;
  businessName: string;
  name: string;
  nameUr?: string | null;
  price: number;
  unit: string;
  imageUrl?: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  businessId: string | null;
  businessName: string | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("jdos_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("jdos_cart", JSON.stringify(items));
    } catch {
      // Ignore storage errors
    }
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      // Single-shop rule: if adding from another shop, confirm replacement
      if (prev.length > 0 && prev[0].businessId !== item.businessId) {
        if (
          confirm(
            `Your cart already contains items from "${prev[0].businessName}". Clear cart to add items from "${item.businessName}"?`
          )
        ) {
          return [{ ...item, quantity }];
        }
        return prev;
      }

      const existingIndex = prev.findIndex((i) => i.productId === item.productId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prev, { ...item, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const businessId = items.length > 0 ? items[0].businessId : null;
  const businessName = items.length > 0 ? items[0].businessName : null;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        businessId,
        businessName,
        isCartOpen,
        setIsCartOpen,
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
