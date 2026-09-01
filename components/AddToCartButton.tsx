"use client";

import React, { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface AddToCartButtonProps {
  product: {
    id: string;
    businessId: string;
    businessName: string;
    name: string;
    nameUr?: string | null;
    price: number;
    unit: string;
    imageUrl?: string | null;
  };
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem, items } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const inCartCount =
    items.find((i) => i.productId === product.id)?.quantity || 0;

  const handleAdd = () => {
    addItem({
      productId: product.id,
      businessId: product.businessId,
      businessName: product.businessName,
      name: product.name,
      nameUr: product.nameUr,
      price: product.price,
      unit: product.unit,
      imageUrl: product.imageUrl,
    });

    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  return (
    <button
      onClick={handleAdd}
      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all shadow-sm active:scale-95 ${
        isAdded
          ? "bg-emerald-700 text-white"
          : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20"
      }`}
    >
      {isAdded ? (
        <>
          <Check className="w-3.5 h-3.5" />
          <span>Added</span>
        </>
      ) : (
        <>
          <Plus className="w-3.5 h-3.5" />
          <span>Add to Cart {inCartCount > 0 ? `(${inCartCount})` : ""}</span>
        </>
      )}
    </button>
  );
}
