import React, { useState } from "react";
import { Download } from "lucide-react";
import PageTransition from "../../components/PageTransition";

// ─── Dummy Data Kas ────────────────────────────────────────────────────────
const DUMMY_KAS = [
  {
    id: "1",
    tanggal: "12 Des 2023",
    deskripsi: "Iuran Bulanan RT 05",
    jenis: "MASUK",
    nominal: 1250000,
  },
  {
    id: "2",
    tanggal: "10 Des 2023",
    deskripsi: "Pembelian Alat Kebersihan",
    jenis: "KELUAR",
    nominal: 450000,
  },
  {
    id: "3",
    tanggal: "08 Des 2023",
    deskripsi: "Biaya Maintenance Taman",
    jenis: "KELUAR",
    nominal: 300000,
  },
  {
    id: "4",
    tanggal: "08 Des 2023",
    deskripsi: "Donasi Sosial Perbaikan Drainase",
    jenis: "MASUK",
    nominal: 300000,
  },
  {
    id: "5",
    tanggal: "08 Des 2023",
    deskripsi: "Pembelian Benih Hidroponik",
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

export default function LaporanKasAnggota() {
  // ─── States Filter ───
  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterBulan, setFilterBulan] = useState("Desember");
  const [filterTahun, setFilterTahun] = useState("2023");

  // ─── Perhitungan Ringkasan (Statis untuk Demo, Dinamis jika pakai API) ───
  // Menggunakan angka dari mockup agar visualnya persis
  const totalMasuk = 8500000;
  const totalKeluar = 3100000;
  const saldoTotal = 5100000;

  return (
    <PageTransition>
    <div className="min-h-screen bg-gray-50 p-6 md:p-10" style={{ fontFamily: "Manrope, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ─── Header ─── */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">Manajemen Kas Dasawisma</h1>
        <p className="text-sm text-gray-600 mt-1 font-medium">Kelola penerimaan dan penyaluran dana Kas secara transparan.</p>
      </div>

      {/* ─── Summary Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center md:text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">TOTAL KAS MASUK</p>
          <h3 className="text-3xl font-extrabold text-gray-900">{formatRupiah(totalMasuk)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center md:text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">TOTAL PENGELUARAN</p>
          <h3 className="text-3xl font-extrabold text-gray-900">{formatRupiah(totalKeluar)}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-center md:text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SALDO KAS SAAT INI</p>
          <h3 className="text-3xl font-extrabold text-gray-900">{formatRupiah(saldoTotal)}</h3>
        </div>
      </div>

      {/* ─── Action Bar & Filters ─── */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-6">
        
        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <select
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] block px-4 py-2.5 font-semibold shadow-sm outline-none flex-1 md:flex-none cursor-pointer"
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
          >
            <option value="Semua">Jenis Kas (Semua)</option>
            <option value="Masuk">Kas Masuk</option>
            <option value="Keluar">Kas Keluar</option>
          </select>

          <select
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] block px-4 py-2.5 font-semibold shadow-sm outline-none flex-1 md:flex-none cursor-pointer"
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
          >
            <option value="Desember">Bulan (Desember)</option>
            <option value="November">Bulan (November)</option>
            <option value="Oktober">Bulan (Oktober)</option>
          </select>

          <select
            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-[#10B981] focus:border-[#10B981] block px-4 py-2.5 font-semibold shadow-sm outline-none w-full md:w-28 cursor-pointer"
            value={filterTahun}
            onChange={(e) => setFilterTahun(e.target.value)}
          >
            <option value="Tahun">Tahun</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>

        {/* Action Button (Hanya Unduh) */}
        <div className="flex items-center w-full xl:w-auto">
          <button className="flex-1 xl:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-bold py-2.5 px-5 rounded-lg text-sm transition-all hover:bg-gray-50 shadow-sm">
            <Download size={18} /> Unduh Data
          </button>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">ID KAS</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">TANGGAL</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">DESKRIPSI KEGIATAN</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">JENIS</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">NOMINAL (RP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DUMMY_KAS.map((trx, index) => (
                <tr key={index} className="hover:bg-emerald-50/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-[#0F766E]">{trx.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">{trx.tanggal}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{trx.deskripsi}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${trx.jenis === "MASUK" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                      {trx.jenis}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-extrabold ${trx.jenis === "MASUK" ? "text-[#10B981]" : "text-[#EF4444]"}`}>
                    {formatRupiah(trx.nominal).replace("Rp", "").trim()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
    </PageTransition>
  );
}