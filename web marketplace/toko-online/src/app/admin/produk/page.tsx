import ProductManager from "./ProductManager";

export default function AdminProductsPage() {
  return (
    <div>
      <h1 className="text-headline-md text-ink mb-stack-lg">Produk & Stok</h1>
      <ProductManager />
    </div>
  );
}
