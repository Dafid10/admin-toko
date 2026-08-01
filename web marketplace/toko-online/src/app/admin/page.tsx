import OrdersTable from "./OrdersTable";

export default function AdminOrdersPage() {
  return (
    <div>
      <div className="mb-stack-lg">
        <h1 className="text-headline-md text-ink">Dashboard Pesanan</h1>
        <p className="text-body-sm text-ink-muted mt-1">Pantau pesanan masuk secara real-time.</p>
      </div>
      <OrdersTable />
    </div>
  );
}
