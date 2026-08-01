"use client";

import { useRouter, useSearchParams } from "next/navigation";

export type CategoryOption = { slug: string; name: string };

export default function CategoryFilter({
  categories,
  activeSlug,
}: {
  categories: CategoryOption[];
  activeSlug?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function selectCategory(slug?: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set("kategori", slug);
    else params.delete("kategori");
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2 mb-stack-lg">
      <button
        onClick={() => selectCategory(undefined)}
        className={`px-4 py-2 rounded-full text-label-md border transition-colors ${
          !activeSlug
            ? "bg-primary text-white border-primary"
            : "bg-surface-lowest border-outline-variant text-ink-muted hover:border-primary hover:text-primary"
        }`}
      >
        Semua Kategori
      </button>
      {categories.map((c) => (
        <button
          key={c.slug}
          onClick={() => selectCategory(c.slug)}
          className={`px-4 py-2 rounded-full text-label-md border transition-colors ${
            activeSlug === c.slug
              ? "bg-primary text-white border-primary"
              : "bg-surface-lowest border-outline-variant text-ink-muted hover:border-primary hover:text-primary"
          }`}
        >
          {c.name}
        </button>
      ))}
    </div>
  );
}
