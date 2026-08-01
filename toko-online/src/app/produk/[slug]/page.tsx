import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "./AddToCartButton";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true },
  });

  if (!product || !product.isActive) notFound();

  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="grid md:grid-cols-2 gap-gutter">
      <div className="relative w-full pt-[100%] bg-surface-low rounded-2xl overflow-hidden border border-outline-variant">
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill className="absolute inset-0 object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink-muted/50">
            Tidak ada foto
          </div>
        )}
      </div>

      <div>
        <span className="text-label-sm text-ink-muted uppercase tracking-wide">
          {product.category.name}
        </span>
        <h1 className="text-headline-md text-ink mt-1 mb-stack-sm">{product.name}</h1>
        <p className="text-headline-md font-bold text-primary mb-stack-md">{formatted}</p>

        <div className="mb-stack-lg">
          {product.stock > 0 ? (
            <span className="status-chip-lunas">Stok tersedia: {product.stock}</span>
          ) : (
            <span className="status-chip-danger">Stok habis</span>
          )}
        </div>

        <p className="text-body-md text-ink-muted leading-relaxed whitespace-pre-line mb-stack-lg">
          {product.description}
        </p>

        <AddToCartButton
          product={{
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
            stock: product.stock,
          }}
        />
      </div>
    </div>
  );
}
