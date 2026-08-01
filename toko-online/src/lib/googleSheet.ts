// Klien untuk komunikasi dengan Google Apps Script Web App
// (sistem "autopilot" Google Sheets milik Anda — lihat apps-script/WebIntegration.gs)

const SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
const SCRIPT_KEY = process.env.GOOGLE_SCRIPT_KEY;

export type SheetStockItem = {
  kode: string;
  nama: string;
  stok: number;
  batasMin: number;
};

function assertConfigured() {
  if (!SCRIPT_URL || !SCRIPT_KEY) {
    throw new Error(
      "GOOGLE_SCRIPT_URL / GOOGLE_SCRIPT_KEY belum diset di .env — lihat README Bagian 5"
    );
  }
}

/**
 * Ambil seluruh data MASTER_STOCK dari spreadsheet lewat Apps Script Web App.
 */
export async function fetchStockFromSheet(): Promise<SheetStockItem[]> {
  assertConfigured();
  const url = `${SCRIPT_URL}?key=${encodeURIComponent(SCRIPT_KEY!)}&action=getStock`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Apps Script merespons HTTP ${res.status} — cek URL deployment-nya`);
  }
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Gagal mengambil data stok dari Google Sheet");
  return data.items as SheetStockItem[];
}

/**
 * Catat penjualan website ke sheet PENJUALAN_WEBSITE + kurangi MASTER_STOCK,
 * meniru alur yang sudah ada untuk channel Shopee/BSM di Code.gs Anda.
 *
 * Sengaja TIDAK melempar error ke pemanggil kalau gagal (lihat pemakaiannya
 * di webhook Xendit) — kegagalan lapor ke sheet tidak boleh menggagalkan
 * konfirmasi pembayaran ke pembeli. Kegagalan tetap dicatat lewat console.error.
 */
export async function pushSaleToSheet(params: {
  orderNumber: string;
  paymentMethod: string;
  items: { sku: string | null; nama: string; qty: number; harga: number }[];
}): Promise<void> {
  assertConfigured();

  const itemsWithSku = params.items.filter((i) => i.sku);
  if (itemsWithSku.length === 0) {
    console.warn(
      `Order ${params.orderNumber}: tidak ada item dengan SKU, dilewati (tidak dilaporkan ke sheet)`
    );
    return;
  }

  const res = await fetch(SCRIPT_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      key: SCRIPT_KEY,
      action: "recordSale",
      orderNumber: params.orderNumber,
      paymentMethod: params.paymentMethod,
      items: itemsWithSku.map((i) => ({ kode: i.sku, nama: i.nama, qty: i.qty, harga: i.harga })),
    }),
  });

  if (!res.ok) throw new Error(`Apps Script merespons HTTP ${res.status}`);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "Gagal mencatat penjualan ke Google Sheet");
}
