"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, CartItem } from "@/context/CartContext";

export default function AddToCartButton({
  product,
}: {
  product: Omit<CartItem, "quantity">;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const habis = product.stock <= 0;

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-outline-variant rounded-lg">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-9 h-9 flex items-center justify-center hover:bg-surface-low rounded-md transition-colors"
          disabled={habis}
        >
          <span className="material-symbols-outlined text-[20px]">remove</span>
        </button>
        <span className="px-4 min-w-[2.5rem] text-center text-label-md">{qty}</span>
        <button
          onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
          className="w-9 h-9 flex items-center justify-center hover:bg-surface-low rounded-md transition-colors"
          disabled={habis}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
      </div>
      <button onClick={handleAdd} disabled={habis} className="btn-primary flex-1 flex items-center justify-center gap-2">
        <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
        {habis ? "Stok habis" : added ? "Ditambahkan ✓" : "Tambah ke Keranjang"}
      </button>
      <button
        onClick={() => {
          addItem(product, qty);
          router.push("/keranjang");
        }}
        disabled={habis}
        className="btn-secondary"
      >
        Beli Sekarang
      </button>
    </div>
  );
}
