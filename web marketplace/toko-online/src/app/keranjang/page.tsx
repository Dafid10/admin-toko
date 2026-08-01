"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import Image from "next/image";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <div className="text-center py-20 card">
        <span className="material-symbols-outlined text-[48px] text-outline-variant mb-stack-sm block">
          shopping_cart
        </span>
        <p className="text-ink-muted mb-stack-md">Keranjang Anda masih kosong.</p>
        <Link href="/" className="btn-primary inline-block">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-stack-lg">
        <h1 className="text-display-lg-mobile md:text-display-lg text-ink">Keranjang Anda</h1>
        <p className="text-body-lg text-ink-muted mt-stack-sm">
          Periksa kembali pesanan sebelum lanjut ke checkout.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-gutter items-start">
        <div className="w-full lg:w-2/3 flex flex-col gap-stack-md">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-surface-lowest rounded-2xl border border-outline-variant p-stack-md flex flex-col sm:flex-row gap-stack-md items-center shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="w-full sm:w-32 h-32 bg-surface-container rounded-xl overflow-hidden flex-shrink-0 relative">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                )}
              </div>
              <div className="flex-grow flex flex-col justify-between h-full w-full">
                <div>
                  <h3 className="text-headline-sm text-ink">{item.name}</h3>
                </div>
                <div className="flex items-center justify-between w-full mt-stack-md sm:mt-0">
                  <span className="text-headline-sm text-primary font-bold">
                    {formatRupiah(item.price)}
                  </span>
                  <div className="flex items-center gap-stack-sm border border-outline-variant rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-ink-muted hover:bg-surface-container rounded-md transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">remove</span>
                    </button>
                    <span className="text-label-md w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))
                      }
                      className="w-8 h-8 flex items-center justify-center text-ink-muted hover:bg-surface-container rounded-md transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">add</span>
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={() => removeItem(item.productId)}
                className="text-outline hover:text-danger transition-colors p-2"
                aria-label="Hapus item"
              >
                <span className="material-symbols-outlined">delete</span>
              </button>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-1/3 card p-stack-lg lg:sticky lg:top-24">
          <h2 className="text-headline-sm text-ink mb-stack-md">Ringkasan Pesanan</h2>
          <div className="flex justify-between mb-stack-sm text-body-sm text-ink-muted">
            <span>Subtotal</span>
            <span>{formatRupiah(totalPrice)}</span>
          </div>
          <div className="border-t border-outline-variant my-stack-sm" />
          <div className="flex justify-between text-label-md text-ink mb-stack-lg">
            <span className="font-bold">Total</span>
            <span className="font-bold">{formatRupiah(totalPrice)}</span>
          </div>
          <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
            Lanjut ke Checkout
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
