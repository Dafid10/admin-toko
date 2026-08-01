import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";

export const dynamic = "force-dynamic"; // stok berubah terus, jangan di-cache statis

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { kategori?: string; q?: string };
}) {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(searchParams.kategori
        ? { category: { slug: searchParams.kategori } }
        : {}),
      ...(searchParams.q
        ? { name: { contains: searchParams.q, mode: "insensitive" } }
        : {}),
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-stack-lg">
        <h1 className="text-display-lg-mobile md:text-display-lg text-ink mb-stack-sm">
          Kebutuhan Rumah &amp; Dapur
        </h1>
        <p className="text-body-lg text-ink-muted">
          Bayar instan pakai QRIS — scan, bayar, pesanan langsung diproses.
        </p>
      </div>

      {searchParams.q && (
        <p className="text-body-sm text-ink-muted mb-stack-md">
          Hasil pencarian untuk <strong>&ldquo;{searchParams.q}&rdquo;</strong>
        </p>
      )}

      <CategoryFilter
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        activeSlug={searchParams.kategori}
      />

      {products.length === 0 ? (
        <div className="text-center py-20 bg-surface-lowest rounded-2xl border border-outline-variant">
          <p className="text-ink-muted">
            Belum ada produk yang cocok. Coba kata kunci atau kategori lain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                slug: p.slug,
                name: p.name,
                price: p.price,
                stock: p.stock,
                imageUrl: p.imageUrl,
                category: { name: p.category.name },
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
