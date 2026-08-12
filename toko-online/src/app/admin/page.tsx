import OrdersTable from "./OrdersTable";

export default function AdminOrdersPage() {
  return (
    <div className="w-full">
      {/* Judul Halaman */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Pesanan</h1>
        <p className="text-gray-500 mt-2">
          Pantau semua pesanan masuk secara real-time di sini.
        </p>
      </div>

      {/* Komponen Tabel Pesanan */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <OrdersTable />
      </div>
    </div>
  );
}