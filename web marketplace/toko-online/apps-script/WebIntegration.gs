// ==========================================================
// WebIntegration.gs
// ==========================================================
// File TAMBAHAN — taruh sebagai file terpisah di project Apps Script
// yang sama dengan Code.gs Anda (jangan timpa Code.gs).
// Karena satu project, fungsi di sini bisa memanggil fungsi yang
// sudah ada di Code.gs (checkCriticalStock, dst) langsung tanpa import.
//
// CARA PASANG:
// 1. Buka spreadsheet Anda -> Extensions -> Apps Script.
// 2. Klik ikon "+" di sebelah "Files" -> pilih "Script".
// 3. Beri nama "WebIntegration" lalu tempel SELURUH isi file ini.
// 4. Ganti WEB_API_KEY di bawah dengan kunci rahasia Anda sendiri
//    (bebas, asal panjang & acak — minimal 32 karakter).
// 5. Deploy -> New deployment -> pilih tipe "Web app".
//      - Execute as: Me
//      - Who has access: Anyone
//    Klik Deploy, salin URL yang muncul (diakhiri /exec).
// 6. URL itu jadi GOOGLE_SCRIPT_URL, dan WEB_API_KEY jadi
//    GOOGLE_SCRIPT_KEY di file .env website Anda — HARUS SAMA PERSIS.
//
// PENTING: setiap kali Anda edit file ini lagi di kemudian hari,
// perubahan TIDAK otomatis aktif di URL yang sudah ada. Anda harus
// buka Deploy -> Manage deployments -> ikon pensil -> Version "New
// version" -> Deploy ulang, supaya perubahan kepakai.
// ==========================================================

const WEB_API_KEY = "GANTI_DENGAN_KUNCI_RAHASIA_ANDA_MIN_32_KARAKTER";

const SHEET_PENJUALAN_WEB = "PENJUALAN_WEBSITE";

// =======================================================
// doGet — dipanggil website untuk MENGAMBIL data stok terkini.
// Contoh pemanggilan: {URL_DEPLOY}?key=XXXX&action=getStock
// =======================================================
function doGet(e) {
  const params = (e && e.parameter) || {};

  if (params.key !== WEB_API_KEY) {
    return jsonResponse({ ok: false, error: "Unauthorized" });
  }

  const action = params.action || "getStock";

  if (action === "ping") {
    return jsonResponse({ ok: true, message: "pong", waktu: new Date().toISOString() });
  }

  if (action === "getStock") {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER_STOCK");
    if (!sheet) return jsonResponse({ ok: false, error: "Sheet MASTER_STOCK tidak ditemukan" });

    const data = sheet.getDataRange().getValues();
    const items = [];
    for (let i = 1; i < data.length; i++) {
      const kode = data[i][0];
      if (!kode) continue;
      items.push({
        kode: String(kode).trim(),
        nama: data[i][1],
        stok: Number(data[i][2]) || 0,
        batasMin: Number(data[i][3]) || 0,
      });
    }
    return jsonResponse({ ok: true, items: items });
  }

  return jsonResponse({ ok: false, error: "Action tidak dikenali: " + action });
}

// =======================================================
// doPost — dipanggil website setiap ada pesanan berstatus LUNAS.
// Mencatat penjualan ke sheet PENJUALAN_WEBSITE, lalu mengurangi
// MASTER_STOCK dan memicu cek stok kritis — meniru persis alur
// yang sudah berjalan untuk channel Shopee di Code.gs.
// =======================================================
function doPost(e) {
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, error: "Body request bukan JSON yang valid" });
  }

  if (body.key !== WEB_API_KEY) {
    return jsonResponse({ ok: false, error: "Unauthorized" });
  }

  if (body.action === "recordSale") {
    return handleRecordSale(body);
  }

  return jsonResponse({ ok: false, error: "Action tidak dikenali: " + body.action });
}

function handleRecordSale(body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_PENJUALAN_WEB);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_PENJUALAN_WEB);
    sheet.appendRow([
      "Tanggal", "No. Pesanan", "Kode", "Nama Produk",
      "Qty", "Harga Satuan", "Subtotal", "Metode Bayar", "Status",
    ]);
  }

  const items = body.items || [];
  items.forEach(function (item) {
    sheet.appendRow([
      new Date(),
      body.orderNumber || "",
      item.kode || "",
      item.nama || "",
      item.qty || 0,
      item.harga || 0,
      (item.qty || 0) * (item.harga || 0),
      body.paymentMethod || "QRIS",
      "Lunas",
    ]);
    if (item.kode) {
      kurangiStokWebsite(item.kode, item.qty || 0);
    }
  });

  // Pakai ulang fungsi yang sudah ada di Code.gs Anda
  if (typeof checkCriticalStock === "function") {
    checkCriticalStock();
  }

  return jsonResponse({ ok: true, itemsRecorded: items.length });
}

// Pengurangan stok berbasis KODE PERSIS (exact match), bukan cocok
// sebagian seperti kurangiStok() di Code.gs — karena website selalu
// mengirim kode SKU yang sudah pasti sama persis dengan MASTER_STOCK,
// jadi lebih aman dari salah cocok antar kode yang mirip.
function kurangiStokWebsite(kode, qty) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("MASTER_STOCK");
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  const target = String(kode).trim().toUpperCase();

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).trim().toUpperCase() === target) {
      const stokLama = Number(data[i][2]) || 0;
      sheet.getRange(i + 1, 3).setValue(stokLama - qty);
      return;
    }
  }
}

function jsonResponse(obj) {
  // Catatan: Apps Script Web App SELALU membalas HTTP 200, tidak bisa
  // diatur jadi 401/500 dsb — makanya berhasil/gagal dicek lewat field
  // "ok" di body JSON, bukan lewat kode status HTTP.
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
