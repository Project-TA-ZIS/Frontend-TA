import React, { useState } from "react";
import { Download, Search } from "lucide-react";

// ─── Dummy Data Transaksi ZIS ──────────────────────────────────────────────
const DUMMY_ZIS = [
  {
    id: "1",
    tanggal: "12 Apr 2024",
    nama: "Bambang Wijaya",
    kategori: "Zakat Fitrah",
    nominal: 150000,
    tipe: "Pemasukan",
  },
  {
    id: "2",
    tanggal: "11 Apr 2024",
    nama: "Siti Aminah",
    kategori: "Infaq Masjid",
    nominal: 500000,
    tipe: "Pemasukan",
  },
  {
    id: "3",
    tanggal: "10 Apr 2024",
    nama: "Yayasan Yatim Piatu",
    kategori: "Penyaluran Zakat",
    nominal: 2500000,
    tipe: "Penyaluran",
  },
  {
    id: "4",
    tanggal: "09 Apr 2024",
    nama: "Haji Sulaiman",
    kategori: "Zakat Mal",
    nominal: 5000000,
    tipe: "Pemasukan",
  },
  {
    id: "5",
    tanggal: "08 Apr 2024",
    nama: "Agus Santoso",
    kategori: "Sedekah Jumat",
    nominal: 200000,
    tipe: "Pemasukan",
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

export default function LaporanZIS() {
  // State untuk filter dan pencarian
  const [filterKategori, setFilterKategori] = useState("");
  const [filterBulan, setFilterBulan] = useState("");
  const [filterTahun, setFilterTahun] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div
      className="min-h-screen bg-gray-50 p-6 md:p-10"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

      {/* ─── Header ─── */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">
          Manajemen ZIS
        </h1>
        <p className="text-sm text-gray-600 mt-1 font-medium">
          Kelola penerimaan dan penyaluran dana ZIS secara transparan.
        </p>
      </div>

      {/* ─── Top Summary Cards ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            TOTAL PENERIMAAN ZIS
          </p>
          <h3 className="text-3xl font-extrabold text-gray-900">
            {formatRupiah(15500000)}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            TOTAL PENYALURAN
          </p>
          <h3 className="text-3xl font-extrabold text-gray-900">
            {formatRupiah(4200000)}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            SALDO ZIS
          </p>
          <h3 className="text-3xl font-extrabold text-[#0F766E]">
            {formatRupiah(11300000)}
          </h3>
        </div>
      </div>

      {/* ─── Filter & Action Bar ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            className="bg-gray-100 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block px-4 py-2.5 font-semibold outline-none"
            value={filterKategori}
            onChange={(e) => setFilterKategori(e.target.value)}
          >
            <option value="">Kategori ZIS</option>
            <option value="Zakat Maal">Zakat Maal</option>
            <option value="Zakat Fitrah">Zakat Fitrah</option>
            <option value="Infaq">Infaq</option>
            <option value="Sedekah">Sedekah</option>
          </select>

          <select
            className="bg-gray-100 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block px-4 py-2.5 font-semibold outline-none"
            value={filterBulan}
            onChange={(e) => setFilterBulan(e.target.value)}
          >
            <option value="">Bulan</option>
            <option value="April">April</option>
            <option value="Maret">Maret</option>
          </select>

          {/* PERUBAHAN: Input text diganti menjadi dropdown Select */}
          <select
            className="bg-gray-100 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block px-4 py-2.5 font-semibold outline-none w-28"
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

        {/* Action Button */}
        <button className="flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors shadow-sm text-sm w-full md:w-auto">
          <Download size={16} />
          Unduh CSV
        </button>
      </div>

      {/* ─── Search Bar ─── */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Cari data warga atau transaksi..."
          className="bg-gray-100 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block w-full pl-11 pr-4 py-3 font-semibold outline-none transition-all"
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
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  ID TRANSAKSI
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  TANGGAL
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  NAMA
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  KATEGORI
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  NOMINAL (RP)
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  TIPE
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DUMMY_ZIS.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-emerald-50/30 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#10B981]">
                    {item.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">
                    {item.tanggal}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">
                    {item.nama}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-600">
                    {item.kategori}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${
                      item.tipe === "Pemasukan" ? "text-[#10B981]" : "text-[#EF4444]"
                    }`}
                  >
                    {formatRupiah(item.nominal).replace("Rp", "").trim()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.tipe === "Pemasukan" ? "bg-[#10B981]" : "bg-[#EF4444]"
                        }`}
                      ></span>
                      <span
                        className={`text-sm font-bold ${
                          item.tipe === "Pemasukan" ? "text-[#10B981]" : "text-[#EF4444]"
                        }`}
                      >
                        {item.tipe}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Bottom Summary Cards (Kategori Breakdown) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            ZAKAT MAAL
          </p>
          <h3 className="text-2xl font-extrabold text-gray-900">
            {formatRupiah(15500000)}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            ZAKAT FITRAH
          </p>
          <h3 className="text-2xl font-extrabold text-gray-900">
            {formatRupiah(15500000)}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            INFAQ
          </p>
          <h3 className="text-2xl font-extrabold text-gray-900">
            {formatRupiah(15500000)}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            SEDEKAH
          </p>
          <h3 className="text-2xl font-extrabold text-gray-900">
            {formatRupiah(15500000)}
          </h3>
        </div>
      </div>
    </div>
  );
}