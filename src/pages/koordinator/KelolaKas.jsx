import React, { useState } from "react";
import { Download, Plus, X } from "lucide-react";

// ─── Initial Dummy Data ────────────────────────────────────────────────────
const INITIAL_TRANSACTIONS = [
  {
    id: "#KAS-2023-102",
    tanggal: "2023-12-12",
    deskripsi: "Iuran Bulanan RT 05",
    jenis: "MASUK",
    nominal: 1250000,
  },
  {
    id: "#KAS-2023-103",
    tanggal: "2023-12-10",
    deskripsi: "Pembelian Alat Kebersihan",
    jenis: "KELUAR",
    nominal: 450000,
  },
  {
    id: "#KAS-2023-104",
    tanggal: "2023-12-08",
    deskripsi: "Biaya Maintenance Taman",
    jenis: "KELUAR",
    nominal: 300000,
  },
];

// ─── Helper untuk Format Rupiah ─────────────────────────────────────────────
const formatRupiah = (angka) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

export default function KelolaKas() {
  // ─── States Data & Modal ───
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tanggal: "",
    deskripsi: "",
    jenis: "MASUK",
    nominal: "",
  });

  // ─── States Filter (Dikembalikan) ───
  const [filterJenis, setFilterJenis] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");

  // ─── Perhitungan Ringkasan Otomatis ───
  const totalMasuk = transactions
    .filter((t) => t.jenis === "MASUK")
    .reduce((acc, curr) => acc + curr.nominal, 0);
  
  const totalKeluar = transactions
    .filter((t) => t.jenis === "KELUAR")
    .reduce((acc, curr) => acc + curr.nominal, 0);
  
  const saldoTotal = totalMasuk - totalKeluar;

  // ─── Handlers ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newId = `#KAS-2024-${transactions.length + 101}`;
    const newEntry = {
      id: newId,
      ...formData,
      nominal: parseInt(formData.nominal) || 0,
    };

    setTransactions([newEntry, ...transactions]);
    setIsModalOpen(false);
    setFormData({ tanggal: "", deskripsi: "", jenis: "MASUK", nominal: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10" style={{ fontFamily: "Manrope, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">Manajemen Kas Dasawisma</h1>
        <p className="text-sm text-gray-600 mt-1 font-medium">Kelola penerimaan dan penyaluran dana Kas secara transparan.</p>
      </div>

      {/* Summary Cards (Data Real-time) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center md:text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">TOTAL KAS MASUK</p>
          <h3 className="text-3xl font-extrabold text-[#10B981]">{formatRupiah(totalMasuk)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center md:text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">TOTAL PENGELUARAN</p>
          <h3 className="text-3xl font-extrabold text-[#EF4444]">{formatRupiah(totalKeluar)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center md:text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SALDO KAS SAAT INI</p>
          <h3 className="text-3xl font-extrabold text-gray-900">{formatRupiah(saldoTotal)}</h3>
        </div>
      </div>

      {/* Action Bar & Filters (Sudah dikembalikan!) */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <select
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] block px-4 py-2.5 font-semibold shadow-sm outline-none flex-1 md:flex-none"
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="Semua">Jenis Kas (Semua)</option>
            <option value="Masuk">Kas Masuk</option>
            <option value="Keluar">Kas Keluar</option>
          </select>

          <select
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] block px-4 py-2.5 font-semibold shadow-sm outline-none flex-1 md:flex-none"
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
          >
            <option value="">Bulan</option>
            <option value="April">April</option>
            <option value="Maret">Maret</option>
          </select>

          <select
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] block px-4 py-2.5 font-semibold shadow-sm outline-none w-full md:w-28"
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
          >
            <option value="">Tahun</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-sm transition-all hover:bg-gray-50 shadow-sm">
            <Download size={18} /> Unduh Data
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-[#10B981] text-white font-bold py-2.5 px-4 rounded-lg text-sm transition-all hover:bg-[#059669] shadow-sm"
          >
            <Plus size={18} strokeWidth={2.5} /> Catat Transaksi
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID KAS</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">TANGGAL</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">DESKRIPSI</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">JENIS</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">NOMINAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((trx, index) => (
                <tr key={index} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0F766E]">{trx.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">{trx.tanggal}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{trx.deskripsi}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${trx.jenis === "MASUK" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                      {trx.jenis}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-extrabold text-right ${trx.jenis === "MASUK" ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                    {trx.jenis === "MASUK" ? "+" : "-"} {formatRupiah(trx.nominal).replace("Rp", "").trim()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL POP-UP CATAT TRANSAKSI ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            
            <div className="bg-[#0F766E] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Catat Transaksi Kas</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-200 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tanggal Transaksi</label>
                <input 
                  type="date" name="tanggal" required value={formData.tanggal} onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Deskripsi Kegiatan</label>
                <input 
                  type="text" name="deskripsi" required value={formData.deskripsi} onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                  placeholder="Contoh: Pembelian Sapu..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Jenis Transaksi</label>
                <select 
                  name="jenis" value={formData.jenis} onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                >
                  <option value="MASUK">KAS MASUK (PEMASUKAN)</option>
                  <option value="KELUAR">KAS KELUAR (PENGELUARAN)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nominal (Rp)</label>
                <input 
                  type="number" name="nominal" required value={formData.nominal} onChange={handleInputChange}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"
                  placeholder="0"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Batal</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#10B981] hover:bg-[#059669]">Simpan Transaksi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}