import React, { useState } from "react";
import { Download, Plus, Search, X } from "lucide-react";
import PageTransition from "../../components/PageTransition";

// ─── Dummy Data Awal ───────────────────────────────────────────────────────
const INITIAL_TRANSACTIONS = [
  { id: "1", tanggal: "2024-04-12", nama: "Bambang Wijaya", kategori: "Zakat Fitrah", nominal: 150000, tipe: "Pemasukan" },
  { id: "2", tanggal: "2024-04-11", nama: "Siti Aminah", kategori: "Infaq", nominal: 500000, tipe: "Pemasukan" },
  { id: "3", tanggal: "2024-04-10", nama: "Yayasan Yatim Piatu", kategori: "Penyaluran", nominal: 2500000, tipe: "Penyaluran" },
  { id: "4", tanggal: "2024-04-09", nama: "Haji Sulaiman", kategori: "Zakat Maal", nominal: 5000000, tipe: "Pemasukan" },
  { id: "5", tanggal: "2024-04-08", nama: "Agus Santoso", kategori: "Sedekah", nominal: 200000, tipe: "Pemasukan" },
];

// ─── Helper untuk Format Rupiah ─────────────────────────────────────────────
const formatRupiah = (angka) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(angka);
};

export default function KelolaZis() {
  // ─── States ───
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  
  // States Filter
  const [filterKategori, setFilterKategori] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [filterTipe, setFilterTipe] = useState("");

  // States Modal Pop-up
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tanggal: "",
    nama: "",
    kategori: "Zakat Maal",
    tipe: "Pemasukan",
    nominal: "",
  });

  // ─── Perhitungan Otomatis (Real-time) ───
  const totalPenerimaan = transactions
    .filter((t) => t.tipe === "Pemasukan")
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const totalPenyaluran = transactions
    .filter((t) => t.tipe === "Penyaluran")
    .reduce((acc, curr) => acc + curr.nominal, 0);

  const saldoTotal = totalPenerimaan - totalPenyaluran;

  // Fungsi hitung per kategori (Hanya menghitung Pemasukan)
  const calcTotalKategori = (kategori) => {
    return transactions
      .filter((t) => t.kategori === kategori && t.tipe === "Pemasukan")
      .reduce((acc, curr) => acc + curr.nominal, 0);
  };

  // ─── Filter & Search Logic ───
  const filteredTransactions = transactions.filter((trx) => {
    const matchesSearch = trx.nama.toLowerCase().includes(searchQuery.toLowerCase()) || trx.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch; // Ditambahkan logika filter dropdown jika diperlukan nanti
  });

  // ─── Handlers ───
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newId = `#ZIS-2024-${String(transactions.length + 1).padStart(3, '0')}`;
    const newEntry = {
      id: newId,
      ...formData,
      nominal: parseInt(formData.nominal) || 0,
    };
    setTransactions([newEntry, ...transactions]);
    setIsModalOpen(false);
    setFormData({ tanggal: "", nama: "", kategori: "Zakat Maal", tipe: "Pemasukan", nominal: "" });
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-['Manrope']">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ─── Header ─── */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">Manajemen ZIS</h1>
        <p className="text-sm text-gray-600 mt-1 font-medium">Kelola penerimaan dan penyaluran dana ZIS secara transparan.</p>
      </div>

      {/* ─── Top Summary Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">TOTAL PENERIMAAN ZIS</p>
          <h3 className="text-3xl font-extrabold text-gray-900">{formatRupiah(totalPenerimaan)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">TOTAL PENYALURAN</p>
          <h3 className="text-3xl font-extrabold text-gray-900">{formatRupiah(totalPenyaluran)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">SALDO ZIS</p>
          <h3 className="text-3xl font-extrabold text-[#10B981]">{formatRupiah(saldoTotal)}</h3>
        </div>
      </div>

      {/* ─── Filter & Action Bar ─── */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] px-4 py-2.5 font-semibold shadow-sm flex-1 md:flex-none cursor-pointer" value={filterKategori} onChange={(e) => setFilterKategori(e.target.value)}>
            <option value="">Kategori ZIS</option>
            <option value="Zakat Maal">Zakat Maal</option>
            <option value="Zakat Fitrah">Zakat Fitrah</option>
            <option value="Infaq">Infaq</option>
            <option value="Sedekah">Sedekah</option>
          </select>
          <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] px-4 py-2.5 font-semibold shadow-sm flex-1 md:flex-none cursor-pointer" value={filterBulan} onChange={(e) => setFilterBulan(e.target.value)}>
            <option value="">Bulan</option>
            <option value="April">April</option>
            <option value="Maret">Maret</option>
          </select>
          <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] px-4 py-2.5 font-semibold shadow-sm flex-1 md:flex-none cursor-pointer" value={filterTahun} onChange={(e) => setFilterTahun(e.target.value)}>
            <option value="">Tahun</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
          <select className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] px-4 py-2.5 font-semibold shadow-sm flex-1 md:flex-none cursor-pointer" value={filterTipe} onChange={(e) => setFilterTipe(e.target.value)}>
            <option value="">Tipe</option>
            <option value="Pemasukan">Pemasukan</option>
            <option value="Penyaluran">Penyaluran</option>
          </select>
        </div>
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 px-4 rounded-lg text-sm hover:bg-gray-50 shadow-sm transition-all">
            <Download size={18} /> Unduh Data
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-[#10B981] text-white font-bold py-2.5 px-4 rounded-lg text-sm hover:bg-[#059669] shadow-sm transition-all">
            <Plus size={18} strokeWidth={2.5} /> Catat ZIS
          </button>
        </div>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari data warga atau transaksi..."
          className="bg-gray-200/60 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block w-full pl-11 pr-5 py-3.5 font-medium outline-none transition-all placeholder-gray-400"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">ID TRANSAKSI</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">TANGGAL</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">NAMA</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">KATEGORI</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">NOMINAL (RP)</th>
                <th className="px-6 py-4 text-[11px] font-extrabold text-gray-500 uppercase tracking-wider text-center">TIPE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((trx, index) => (
                <tr key={index} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0F766E] text-center">{trx.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600 text-center">
                    {new Date(trx.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900 text-center">{trx.nama}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600 text-center">{trx.kategori}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-center ${trx.tipe === "Pemasukan" ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                    {formatRupiah(trx.nominal).replace("Rp", "").trim()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${trx.tipe === "Pemasukan" ? "bg-[#10B981]" : "bg-[#EF4444]"}`}></span>
                      <span className={`text-xs font-bold ${trx.tipe === "Pemasukan" ? "text-[#10B981]" : "text-[#EF4444]"}`}>{trx.tipe}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Bottom Summary Cards (Rincian Kategori) ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "ZAKAT MAAL", amount: calcTotalKategori("Zakat Maal") },
          { title: "ZAKAT FITRAH", amount: calcTotalKategori("Zakat Fitrah") },
          { title: "INFAQ", amount: calcTotalKategori("Infaq") },
          { title: "SEDEKAH", amount: calcTotalKategori("Sedekah") },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center text-center">
            <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{item.title}</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{formatRupiah(item.amount)}</h3>
          </div>
        ))}
      </div>

      {/* ─── MODAL POP-UP CATAT ZIS ─── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#0F766E] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Catat Transaksi ZIS</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-emerald-200 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tanggal Transaksi</label>
                <input type="date" name="tanggal" required value={formData.tanggal} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"/>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Muzzaki/Mustahiq</label>
                <input type="text" name="nama" required value={formData.nama} onChange={handleInputChange} placeholder="Masukkan nama..." className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kategori</label>
                  <select name="kategori" value={formData.kategori} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]">
                    <option value="Zakat Maal">Zakat Maal</option>
                    <option value="Zakat Fitrah">Zakat Fitrah</option>
                    <option value="Infaq">Infaq</option>
                    <option value="Sedekah">Sedekah</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipe</label>
                  <select name="tipe" value={formData.tipe} onChange={handleInputChange} className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]">
                    <option value="Pemasukan">Pemasukan</option>
                    <option value="Penyaluran">Penyaluran</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nominal (Rp)</label>
                <input type="number" name="nominal" required value={formData.nominal} onChange={handleInputChange} placeholder="0" className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 font-semibold outline-none focus:ring-2 focus:ring-[#10B981]"/>
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
    </PageTransition>
  );
}