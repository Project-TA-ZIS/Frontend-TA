import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import PageTransition from "../../components/PageTransition";

// Data dummy transaksi untuk tabel
const initialTransactions = [
  {
    id: "#ZIS-2023-001",
    tanggal: "12 Apr 2024",
    nama: "Bambang Wijaya",
    kategori: "Zakat Fitrah",
    nominal: "150.000",
    tipe: "Pemasukan",
  },
  {
    id: "#ZIS-2023-002",
    tanggal: "11 Apr 2024",
    nama: "Siti Aminah",
    kategori: "Infaq Masjid",
    nominal: "500.000",
    tipe: "Pemasukan",
  },
  {
    id: "#ZIS-2023-003",
    tanggal: "10 Apr 2024",
    nama: "Yayasan Yatim Piatu",
    kategori: "Penyaluran Zakat",
    nominal: "2.500.000",
    tipe: "Penyaluran",
  },
  {
    id: "#ZIS-2023-004",
    tanggal: "09 Apr 2024",
    nama: "Haji Sulaiman",
    kategori: "Zakat Mal",
    nominal: "5.000.000",
    tipe: "Pemasukan",
  },
  {
    id: "#ZIS-2023-005",
    tanggal: "08 Apr 2024",
    nama: "Agus Santoso",
    kategori: "Sedekah oumat",
    nominal: "200.000",
    tipe: "Pemasukan",
  },
];

export default function ManajemenZis() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <PageTransition>
      {/* Menggunakan h-screen flex flex-col untuk kontrol layout presisi */}
      <div className="h-screen bg-gray-50 font-['Manrope'] overflow-hidden flex flex-col justify-between">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* ─── NAVBAR PUBLIK ─── */}
        <nav className="w-full bg-[#F0FDF4] px-6 md:px-12 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F766E] rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="font-extrabold text-[#0F766E] text-lg leading-tight tracking-wide">
                DASAWISMA
              </h1>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                LENTENG AGUNG
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-[#F0FDF4] rounded-xl p-1 border border-emerald-100/50">
            <Link
              to="/"
              className="px-6 py-2 rounded-lg text-gray-500 hover:bg-white hover:text-[#0F766E] font-bold text-xs uppercase tracking-wider transition-all"
            >
              Home
            </Link>
            <Link
              to="/dashboard-publik"
              className="px-6 py-2 rounded-lg text-gray-500 hover:bg-white hover:text-[#0F766E] font-bold text-xs uppercase tracking-wider transition-all"
            >
              Dashboard
            </Link>
            <Link
              to="/zis-publik"
              className="px-6 py-2 rounded-lg bg-white text-[#0F766E] shadow-sm font-bold text-xs uppercase tracking-wider transition-all"
            >
              Laporan ZIS
            </Link>
          </div>

          <div>
            <button
              onClick={() => navigate("/login")}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20"
            >
              Masuk
            </button>
          </div>
        </nav>

        {/* ─── KONTEN UTAMA ─── */}
        <main className="max-w-6xl w-full mx-auto px-6 py-6 flex-1 flex flex-col overflow-y-auto">
          <div className="mb-4 shrink-0">
            <h2 className="text-2xl font-extrabold text-[#0F766E] mb-0.5">
              Manajemen ZIS
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              Kelola penerimaan dan penyaluran dana ZIS secara transparan.
            </p>
          </div>

          {/* KARTU RINGKASAN (Dipadatkan menjadi grid-cols-3 agar hemat ruang) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-3 shrink-0">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Penerimaan ZIS</p>
              <h3 className="text-xl font-extrabold text-gray-900">Rp 15.500.000</h3>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Total Penyaluran</p>
              <h3 className="text-xl font-extrabold text-gray-900">Rp 4.200.000</h3>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Saldo ZIS</p>
              <h3 className="text-xl font-extrabold text-[#0F766E]">Rp 11.300.000</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3 shrink-0">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Zakat Fitrah Beras</p>
              <h3 className="text-xl font-extrabold text-gray-900">10 Kg</h3>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Zakat Fitrah Uang</p>
              <h3 className="text-xl font-extrabold text-gray-900">Rp 15.500.000</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5 shrink-0">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Zakat Maal</p>
              <h3 className="text-lg font-extrabold text-gray-900">Rp 15.500.000</h3>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Infaq</p>
              <h3 className="text-lg font-extrabold text-gray-900">Rp 15.500.000</h3>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Shodaqoh</p>
              <h3 className="text-lg font-extrabold text-gray-900">Rp 15.500.000</h3>
            </div>
          </div>

          {/* SEARCH & SUBMIT FORM */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 mb-4 max-w-xl shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cari data warga atau transaksi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 border border-gray-200/60 rounded-xl py-2.5 pl-11 pr-4 text-xs font-medium focus:outline-none focus:bg-white focus:border-[#0F766E] transition-all"
              />
            </div>
            <button
              type="submit"
              className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-sm active:scale-95 shrink-0"
            >
              Submit
            </button>
          </form>

          {/* TABEL TRANSAKSI (flex-1 & overflow-hidden agar pas mengisi area bawah) */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 min-h-0 flex flex-col">
            <div className="overflow-x-auto overflow-y-auto flex-1">
              <table className="w-full min-w-[800px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 sticky top-0 z-10">
                    <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">ID Transaksi</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Tanggal</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Nama</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kategori</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Nominal (Rp)</th>
                    <th className="py-3 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">Tipe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {initialTransactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/40 transition-colors">
                      <td className="py-3 px-6 text-xs font-bold text-[#0F766E] text-center hover:underline cursor-pointer">{tx.id}</td>
                      <td className="py-3 px-6 text-xs font-bold text-gray-400 text-center">{tx.tanggal}</td>
                      <td className="py-3 px-6 text-xs font-extrabold text-gray-900">{tx.nama}</td>
                      <td className="py-3 px-6 text-xs font-bold text-gray-500">{tx.kategori}</td>
                      <td className={`py-3 px-6 text-xs font-extrabold text-center ${tx.tipe === "Pemasukan" ? "text-[#0F766E]" : "text-red-500"}`}>{tx.nominal}</td>
                      <td className="py-3 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${tx.tipe === "Pemasukan" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                          <span className={`w-1 h-1 rounded-full ${tx.tipe === "Pemasukan" ? "bg-emerald-500" : "bg-red-500"}`}></span>
                          {tx.tipe}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}