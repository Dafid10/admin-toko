import { prisma } from "@/lib/prisma";
import { useLanguage } from "@/context/LanguageContext";
import { notFound } from "next/navigation";
import AddToCartButton from "./AddToCartButton";
import ProductGallery from "./ProductGallery";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const product: any = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: true, media: { orderBy: { order: "asc" } } },
  });

  if (!product || !product.isActive) notFound();

  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="grid md:grid-cols-2 gap-gutter">
      {/* Media Gallery */}
      <ProductGallery media={product.media} productName={product.name} />

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

        {/* Video Sections */}
        {product.media && product.media.filter((m: any) => m.type === "VIDEO").length > 0 && (
          <div className="mb-stack-lg">
            <h3 className="text-label-md font-bold mb-2">Video Produk</h3>
            <div className="space-y-4">
              {product.media.filter((m: any) => m.type === "VIDEO").map((v: any, i: number) => (
                <div key={i} className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                  <video src={v.url} controls className="w-full h-full" />
                </div>
              ))}
            </div>
          </div>
        )}

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
