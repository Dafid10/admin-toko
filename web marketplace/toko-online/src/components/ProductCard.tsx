import Link from "next/link";
import Image from "next/image";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: { name: string };
};

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProductCard({ product }: { product: ProductCardData }) {
  const habis = product.stock <= 0;
  const stokMenipis = !habis && product.stock <= 5;

  return (
    <div className="bg-surface-lowest rounded-2xl border border-outline-variant shadow-card hover:shadow-card-hover transition-shadow flex flex-col overflow-hidden group">
      <Link href={`/produk/${product.slug}`} className="relative w-full pt-[100%] bg-surface-low overflow-hidden block">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className={`absolute inset-0 object-cover transition-transform duration-500 group-hover:scale-105 ${
              habis ? "grayscale opacity-70" : ""
            }`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink-muted/50 text-body-sm">
            Tidak ada foto
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {habis && (
            <span className="px-2 py-1 bg-surface-highest text-outline text-label-sm rounded-md shadow-sm">
              Stok Habis
            </span>
          )}
          {stokMenipis && (
            <span className="px-2 py-1 bg-surface-highest text-ink text-label-sm rounded-md shadow-sm">
              Sisa {product.stock}
            </span>
          )}
          {!habis && !stokMenipis && (
            <span className="px-2 py-1 bg-secondary text-white text-label-sm rounded-md shadow-sm">
              Tersedia
            </span>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-grow gap-2">
        <span className="text-label-sm text-ink-muted uppercase tracking-wide">
          {product.category.name}
        </span>
        <Link href={`/produk/${product.slug}`}>
          <h4 className="text-label-md text-ink line-clamp-2 leading-snug hover:text-primary transition-colors">
            {product.name}
          </h4>
        </Link>
        <div className="mt-auto pt-3 flex flex-col gap-3">
          <span className="text-headline-sm font-bold text-primary">
            {formatRupiah(product.price)}
          </span>
          <Link
            href={`/produk/${product.slug}`}
            className={`w-full py-2.5 text-label-md rounded-lg flex items-center justify-center gap-2 transition-colors ${
              habis
                ? "bg-surface-high text-outline cursor-not-allowed pointer-events-none"
                : "bg-primary text-white hover:bg-primary-hover shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {habis ? "notifications" : "add_shopping_cart"}
            </span>
            {habis ? "Beri Tahu Saya" : "Lihat Produk"}
          </Link>
        </div>
      </div>
    </div>
  );
}
