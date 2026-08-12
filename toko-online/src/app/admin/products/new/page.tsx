export default function UploadProductPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">➕ Upload Produk Baru</h1>
      <div className="bg-white p-8 rounded-xl border shadow-sm">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Nama Produk</label>
            <input type="text" className="w-full border rounded-lg p-3" placeholder="Contoh: Hanata 3101" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Harga (Rp)</label>
              <input type="number" className="w-full border rounded-lg p-3" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Stok</label>
              <input type="number" className="w-full border rounded-lg p-3" placeholder="0" />
            </div>
          </div>

          {/* Textarea Lega untuk Deskripsi */}
          <div>
            <label className="block text-sm font-semibold mb-2">Deskripsi Produk (Luas)</label>
            <textarea 
              rows={10} 
              className="w-full border rounded-lg p-4 focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Tuliskan spesifikasi lengkap, ukuran, dan keunggulan produk di sini..."
            />
          </div>

          <button 
            type="button" 
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition"
          >
            Simpan Produk (Preview)
          </button>
        </form>
      </div>
    </div>
  );
}