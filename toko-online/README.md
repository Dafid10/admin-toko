# Toko Online — Rumah & Dapur

Website jualan dengan katalog produk, keranjang, checkout QRIS otomatis (Xendit), dan dashboard admin (pesanan, stok, laporan penjualan).

## Tumpukan Teknologi
- **Next.js 14** (App Router) — frontend + backend jadi satu aplikasi
- **PostgreSQL** + **Prisma ORM** — database
- **Xendit** — payment gateway untuk QRIS otomatis + webhook
- **Tailwind CSS** — styling

## Fitur yang Sudah Ada
- Katalog produk dengan filter kategori & pencarian
- Halaman detail produk (foto, deskripsi, harga, stok real-time)
- Keranjang belanja (localStorage, multi-item)
- Checkout → generate QRIS otomatis via Xendit → status pesanan berubah "Lunas" otomatis lewat webhook
- Dashboard admin: daftar pesanan + ubah status (Diproses/Dikirim/Selesai)
- Manajemen produk: tambah produk, edit harga & stok, nonaktifkan produk, tambah kategori
- Stok otomatis berkurang saat pembayaran QRIS berhasil (dilakukan di dalam database transaction agar aman dari race condition)
- Laporan penjualan: kotor, estimasi biaya payment gateway, bersih, per hari, produk terlaris
- **Terhubung ke sistem autopilot Google Sheet Anda**: stok produk disinkron dari `MASTER_STOCK`, dan setiap penjualan website otomatis tercatat balik ke sheet (lihat Bagian 4)

---

## Bagian 1 — Daftar Akun Xendit (wajib sebelum QRIS bisa jalan)

1. Buka **dashboard.xendit.co** → Daftar akun bisnis.
2. Xendit akan minta verifikasi **KYC/KYB**: KTP pemilik usaha, NIB/dokumen legalitas usaha (untuk usaha perorangan biasanya cukup KTP + NPWP), dan rekening bank untuk pencairan dana. Proses verifikasi biasanya beberapa hari kerja.
3. Setelah akun aktif, buka menu **Settings → API Keys**. Anda akan lihat dua jenis key:
   - **Test/Development key** (`xnd_development_...`) — pakai ini dulu untuk uji coba, tidak melibatkan uang sungguhan.
   - **Live/Production key** (`xnd_production_...`) — dipakai setelah Anda yakin semua alur berjalan benar dan siap terima pembayaran asli.
4. Aktifkan **QRIS** sebagai channel pembayaran (biasanya di menu Payment Channels/Settings — nama menu bisa berbeda tergantung update dashboard Xendit).
5. Buka **Settings → Webhooks**. Di sini Anda akan menemukan **Verification Token** — salin ke `XENDIT_WEBHOOK_TOKEN` di file `.env`.
6. Masih di halaman Webhooks, daftarkan URL webhook Anda (isi setelah website sudah online di VPS):
   ```
   https://domainanda.com/api/webhooks/xendit
   ```
   Aktifkan event untuk **Payment Request** / **QR Code payment succeeded**.
7. Cek juga tarif/biaya admin QRIS terbaru di dashboard Xendit Anda (biasanya persentase kecil per transaksi) — angka ini dipakai kode di `src/app/api/webhooks/xendit/route.ts` (variabel `ESTIMASI_PERSEN_BIAYA_QRIS`) untuk menghitung laporan profit. **Sesuaikan angka ini** dengan tarif riil dari akun Anda.

> Catatan: DOKU juga bisa dipakai sebagai alternatif, tapi kode di project ini sudah disiapkan khusus untuk Xendit karena dokumentasi & SDK-nya lebih mudah diintegrasikan untuk QRIS dinamis. Kalau Anda tetap ingin pakai DOKU, bagian yang perlu diganti hanya file `src/lib/xendit.ts` dan `src/app/api/webhooks/xendit/route.ts` — sisanya tetap sama.

---

## Bagian 2 — Setup di Komputer Lokal (untuk coba-coba dulu)

```bash
# 1. Install dependency
npm install

# 2. Siapkan database PostgreSQL lokal (atau pakai Docker, lihat contoh di bawah)
# 3. Salin .env.example jadi .env, isi DATABASE_URL, XENDIT_SECRET_KEY (pakai yang development), dst.
cp .env.example .env

# 4. Buat tabel-tabel di database
npx prisma migrate dev --name init

# 5. Isi data contoh (opsional)
npm run seed

# 6. Jalankan
npm run dev
```

Buka `http://localhost:3000` untuk toko, dan `http://localhost:3000/admin` untuk dashboard admin (login pakai `ADMIN_EMAIL`/`ADMIN_PASSWORD` dari `.env`).

**Uji coba pembayaran QRIS di mode development:** Xendit menyediakan simulator pembayaran untuk API key development, jadi Anda bisa tes seluruh alur checkout tanpa uang sungguhan. Untuk webhook masuk ke `localhost`, gunakan tool seperti `ngrok` supaya Xendit bisa mengakses server lokal Anda dari internet:
```bash
ngrok http 3000
# lalu daftarkan URL ngrok + /api/webhooks/xendit di dashboard Xendit
```

---

## Bagian 3 — Deploy ke VPS (Production)

Asumsi: VPS Ubuntu 22.04, Anda punya akses root/sudo, dan sudah punya domain yang diarahkan (DNS A record) ke IP VPS.

### 3.1. Install kebutuhan dasar di VPS
```bash
sudo apt update && sudo apt install -y postgresql nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### 3.2. Setup database PostgreSQL
```bash
sudo -u postgres psql
```
```sql
CREATE DATABASE toko_online;
CREATE USER toko_user WITH ENCRYPTED PASSWORD 'password-yang-kuat';
GRANT ALL PRIVILEGES ON DATABASE toko_online TO toko_user;
\q
```

### 3.3. Upload & build project
```bash
# Upload folder project ke VPS (scp, git clone, atau cara lain)
cd toko-online
npm install
cp .env.example .env
nano .env   # isi DATABASE_URL, XENDIT_SECRET_KEY (pakai yang PRODUCTION), dst.

npx prisma migrate deploy
npm run build
```

### 3.4. Jalankan dengan PM2 (supaya tetap hidup & auto-restart)
```bash
pm2 start npm --name "toko-online" -- start
pm2 save
pm2 startup   # ikuti instruksi yang muncul, supaya PM2 auto-start saat VPS reboot
```

### 3.5. Setup Nginx sebagai reverse proxy + HTTPS
Buat file `/etc/nginx/sites-available/toko-online`:
```nginx
server {
    listen 80;
    server_name domainanda.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
```bash
sudo ln -s /etc/nginx/sites-available/toko-online /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Aktifkan HTTPS gratis (wajib! Xendit webhook & QRIS butuh HTTPS)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domainanda.com
```

### 3.6. Daftarkan webhook ke Xendit
Sekarang website sudah online di `https://domainanda.com`. Kembali ke dashboard Xendit → Settings → Webhooks, masukkan:
```
https://domainanda.com/api/webhooks/xendit
```

Selesai — alur checkout QRIS otomatis sudah aktif secara production.

---

## Bagian 4 — Integrasi Google Sheet (Sistem Autopilot Anda)

Website ini terhubung ke spreadsheet "autopilot" Anda (yang sudah punya `Code.gs` untuk email Shopee, notifikasi Telegram, dsb). **`MASTER_STOCK` di sheet jadi sumber utama stok** — website menarik data dari sana, dan setiap penjualan di website dilaporkan balik ke sheet supaya `MASTER_STOCK` tetap akurat untuk semua channel (Shopee, BSM, website).

### 5.1. Pasang file Apps Script tambahan
1. Buka spreadsheet Anda → **Extensions → Apps Script**.
2. Klik ikon **+** di sebelah "Files" → **Script** → beri nama `WebIntegration`.
3. Salin **seluruh isi** file `apps-script/WebIntegration.gs` (ada di dalam folder project ini) ke file baru tersebut.
4. Di baris paling atas file itu, ganti:
   ```js
   const WEB_API_KEY = "GANTI_DENGAN_KUNCI_RAHASIA_ANDA_MIN_32_KARAKTER";
   ```
   dengan kunci rahasia buatan Anda sendiri (bebas, asal panjang & acak, minimal 32 karakter). Ini seperti password antara website dan sheet — jangan dibagikan ke siapapun.
5. Klik **Deploy → New deployment**:
   - Pilih tipe **Web app**
   - **Execute as:** Me
   - **Who has access:** Anyone
   - Klik **Deploy**, lalu **Authorize access** (izinkan akses ke akun Google Anda — ini normal, script perlu baca/tulis sheet Anda).
6. Salin URL yang muncul (berakhiran `/exec`).

### 5.2. Isi environment variable website
Di `.env` VPS Anda:
```
GOOGLE_SCRIPT_URL="<URL yang disalin dari langkah 5.1>"
GOOGLE_SCRIPT_KEY="<kunci yang sama persis dengan WEB_API_KEY di langkah 5.1.4>"
CRON_SECRET="<string acak bebas, untuk otorisasi cron>"
```
Lalu restart aplikasi (`pm2 restart toko-online`).

### 5.3. Hubungkan produk website ↔ kode di MASTER_STOCK
Setiap produk di website punya field **SKU** yang harus **sama persis** dengan kolom "Kode" di `MASTER_STOCK`. Dua cara mengisinya:
- **Produk sudah ada duluan di MASTER_STOCK:** buka `/admin/produk`, klik **"Impor Produk Baru dari Sheet"** — website otomatis membuat produk baru (nonaktif) untuk setiap kode yang belum ada. Anda tinggal lengkapi harga, deskripsi, foto, lalu klik **Aktifkan**.
- **Produk sudah ada duluan di website:** isi kolom SKU di tabel produk (klik, ketik kode, klik di luar kolom untuk simpan) supaya cocok dengan kode di sheet.

### 5.4. Sinkron stok otomatis (cron)
Klik **"Sinkron Stok Sekarang"** di `/admin/produk` kapan saja untuk sinkron manual. Untuk otomatis tiap beberapa menit, tambahkan cron job di VPS:
```bash
crontab -e
```
```
*/10 * * * * curl -s -X POST https://domainanda.com/api/admin/sync-stock -H "x-cron-secret: ISI_DENGAN_CRON_SECRET_ANDA" > /dev/null
```
(Contoh di atas sinkron tiap 10 menit — sesuaikan angkanya.)

### 5.5. Alur saat ada pesanan website
1. Pembeli checkout & bayar QRIS → webhook Xendit masuk → order jadi **Lunas** (seperti biasa).
2. Website otomatis memanggil `WebIntegration.gs` → mencatat baris baru di sheet **`PENJUALAN_WEBSITE`** (dibuat otomatis, formatnya senada dengan `PENJUALAN_SHOPEE`) dan mengurangi `MASTER_STOCK`.
3. Fungsi `checkCriticalStock()` yang sudah ada otomatis jalan → kalau stok di bawah batas minimum, notifikasi Telegram tetap terkirim seperti biasa.
4. Sinkron berikutnya (manual atau cron) menarik angka stok terbaru dari `MASTER_STOCK` balik ke website — jadi kalau ada penjualan offline/Shopee di waktu yang sama, stok website tetap ikut angka sheet yang paling akurat.

Kalau webhook Xendit masuk tapi Apps Script sedang down/lambat, pembayaran pembeli **tetap sah tercatat Lunas** di website — laporan ke sheet akan menyusul di sinkronisasi berikutnya, tidak menghalangi konfirmasi ke pembeli.

### 5.6. Catatan keamanan
`Code.gs` Anda menyimpan token bot Telegram langsung di kode. Ini sudah berjalan dan tidak saya ubah, tapi ke depannya pertimbangkan pindahkan token semacam itu ke **Project Settings → Script Properties** di Apps Script (bukan hardcode di kode), supaya tidak ikut ter-copy kalau file script dibagikan ke orang lain.

---

## Bagian 5 — Impor Produk dari Shopee

Katalog awal website ini diisi dari data toko Shopee Anda (114 produk, dari file "Perbarui Info Dasar" + harga dari `PL_shopee.xlsx` kolom "offline", dicocokkan lewat kode barang seperti SIP 119 / HNT 641).

Jalankan sekali setelah database siap (lihat Bagian 2 atau 3):
```bash
npm run import:shopee
```
Aman dijalankan berulang kali — produk yang sudah ada (dicocokkan lewat Kode Produk Shopee) akan di-update harganya saja, tidak dibuat dobel.

**Yang perlu Anda tahu:**
- Semua produk masuk **nonaktif** dulu ke kategori "Container & Box Penyimpanan" — belum tampil ke pembeli sampai Anda cek & klik Aktifkan di `/admin/produk`.
- **60 dari 114 produk** berhasil dapat harga otomatis (kode barangnya ketemu di `PL_shopee.xlsx`). Cek file `laporan_import_shopee.csv` yang saya lampirkan terpisah — kolom "Status" menandai mana yang "Cocok" vs "Perlu Dicek Manual" (harga masih Rp0).
- 54 sisanya harga masih Rp0 — kebanyakan karena produknya bukan dari lini SIP/HNT (misalnya emas Antam, LionStar, Kimplast) sehingga memang tidak ada di `PL_shopee.xlsx`, atau kodenya ada di judul tapi harganya kosong di sheet tersebut. Isi manual harganya di tabel produk admin (klik kolom harga, ketik, klik di luar untuk simpan).
- Belum ada data stok sama sekali di tahap ini — kalau kode SKU-nya juga ada di `MASTER_STOCK` Google Sheet Anda, tinggal klik **"Sinkron Stok Sekarang"** di `/admin/produk` (Bagian 4) setelah integrasi sheet aktif.

---

## Bagian 6 — Hal Penting Sebelum Benar-Benar Dipakai Jualan

Karena skala Anda serius (jualan nyata), sebelum go-live sebaiknya perhatikan:

1. **Ganti kredensial default.** `ADMIN_EMAIL`, `ADMIN_PASSWORD`, dan `SESSION_SECRET` di `.env` harus diganti dengan nilai yang kuat & rahasia — jangan pakai contoh di `.env.example`.
2. **Backup database rutin.** `pg_dump` terjadwal (cron) minimal harian.
3. **Uji alur QRIS end-to-end** dengan API key development dulu sebelum pindah ke production key.
4. **Perbarui estimasi biaya gateway** di `src/app/api/webhooks/xendit/route.ts` sesuai tarif riil akun Xendit Anda, supaya laporan profit akurat.
5. **Autentikasi admin saat ini sederhana** (satu akun dari `.env`). Kalau nanti butuh beberapa staf admin dengan hak akses berbeda, ini perlu ditingkatkan jadi tabel `Admin` dengan bcrypt + role.
6. **Foto produk**: saat ini pakai URL gambar eksternal (`imageUrl`). Untuk upload foto langsung dari admin, perlu ditambahkan integrasi storage (mis. Cloudflare R2 atau S3) — belum termasuk di versi ini.
7. **Monitoring**: pertimbangkan pasang `pm2 logs`/`pm2 monit`, atau tool seperti UptimeRobot untuk memantau website tetap online.

---

## Struktur Folder Singkat
```
src/
  app/
    page.tsx                    → Katalog produk (beranda)
    produk/[slug]/               → Detail produk
    keranjang/                   → Keranjang belanja
    checkout/                    → Form checkout + tampilan QR + polling status
    admin/                       → Dashboard admin (dilindungi login)
      produk/                    → Manajemen produk, SKU, tombol sinkron sheet
    api/checkout/                 → Buat order + request QRIS ke Xendit
    api/webhooks/xendit/          → Terima konfirmasi pembayaran dari Xendit + lapor ke sheet
    api/admin/                    → API untuk dashboard admin
      sync-stock/                 → Tarik stok terbaru dari MASTER_STOCK
      import-from-sheet/          → Buat produk baru dari kode sheet yang belum ada
  lib/
    prisma.ts                    → Koneksi database
    xendit.ts                    → Helper API Xendit
    googleSheet.ts                → Helper komunikasi ke Apps Script Web App
    auth.ts                       → Session admin sederhana
  context/CartContext.tsx        → State keranjang belanja
prisma/schema.prisma             → Struktur database (Product punya field sku & shopeeProductId)
prisma/import-shopee.ts          → Impor 114 produk dari toko Shopee (lihat Bagian 5)
prisma/data/shopee-products.json → Data produk Shopee (nama, deskripsi, sku, harga) hasil olahan
apps-script/WebIntegration.gs    → File yang ditempel ke Apps Script (lihat Bagian 4)
```
