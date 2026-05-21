import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Coins, Users } from "lucide-react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import PageTransition from "../../components/PageTransition";
import LogoDasawisma from "../../assets/Logo.svg";
import Footer from "../../components/layout/Footer";

// Kumpulan data dummy yang sudah diperbaiki strukturnya
const chartDataMap = {
  "Zakat Maal": {
    Bulanan: [
      { name: "JAN", pemasukan: 2000, pengeluaran: 500 },
      { name: "FEB", pemasukan: 3000, pengeluaran: 800 },
      { name: "MAR", pemasukan: 4500, pengeluaran: 1000 },
      { name: "APR", pemasukan: 6000, pengeluaran: 1200 },
      { name: "MEI", pemasukan: 5500, pengeluaran: 1100 },
      { name: "JUN", pemasukan: 6500, pengeluaran: 1500 },
      { name: "JUL", pemasukan: 7500, pengeluaran: 2800 },
      { name: "AGU", pemasukan: 8500, pengeluaran: 3000 },
      { name: "SEP", pemasukan: 8000, pengeluaran: 2800 },
      { name: "OKT", pemasukan: 7000, pengeluaran: 2500 },
      { name: "NOV", pemasukan: 8500, pengeluaran: 4500 },
      { name: "DES", pemasukan: 10000, pengeluaran: 3500 },
    ],
    Tahunan: [
      { name: "2023", pemasukan: 50000, pengeluaran: 15000 },
      { name: "2024", pemasukan: 75000, pengeluaran: 20000 },
      { name: "2025", pemasukan: 90000, pengeluaran: 25000 },
      { name: "2026", pemasukan: 115000, pengeluaran: 32000 },
    ],
  },
  "Zakat Fitrah": {
    Bulanan: [
      { name: "JAN", pemasukan: 0, pengeluaran: 0 },
      { name: "FEB", pemasukan: 0, pengeluaran: 0 },
      { name: "MAR", pemasukan: 12000, pengeluaran: 2000 },
      { name: "APR", pemasukan: 15000, pengeluaran: 25000 },
      { name: "MEI", pemasukan: 0, pengeluaran: 0 },
      { name: "JUN", pemasukan: 0, pengeluaran: 0 },
      { name: "JUL", pemasukan: 0, pengeluaran: 0 },
      { name: "AGU", pemasukan: 0, pengeluaran: 0 },
      { name: "SEP", pemasukan: 0, pengeluaran: 0 },
      { name: "OKT", pemasukan: 0, pengeluaran: 0 },
      { name: "NOV", pemasukan: 0, pengeluaran: 0 },
      { name: "DES", pemasukan: 0, pengeluaran: 0 },
    ],
    Tahunan: [
      { name: "2023", pemasukan: 25000, pengeluaran: 22000 },
      { name: "2024", pemasukan: 30000, pengeluaran: 28000 },
      { name: "2025", pemasukan: 35000, pengeluaran: 31000 },
      { name: "2026", pemasukan: 42000, pengeluaran: 38000 },
    ],
  },
  Infaq: {
    Bulanan: [
      { name: "JAN", pemasukan: 1000, pengeluaran: 900 },
      { name: "FEB", pemasukan: 1200, pengeluaran: 1000 },
      { name: "MAR", pemasukan: 1500, pengeluaran: 1100 },
      { name: "APR", pemasukan: 1300, pengeluaran: 1200 },
      { name: "MEI", pemasukan: 1800, pengeluaran: 1600 },
      { name: "JUN", pemasukan: 2000, pengeluaran: 1900 },
      { name: "JUL", pemasukan: 2200, pengeluaran: 2100 },
      { name: "AGU", pemasukan: 2100, pengeluaran: 1800 },
      { name: "SEP", pemasukan: 2500, pengeluaran: 2400 },
      { name: "OKT", pemasukan: 2800, pengeluaran: 2500 },
      { name: "NOV", pemasukan: 3000, pengeluaran: 2800 },
      { name: "DES", pemasukan: 3500, pengeluaran: 3200 },
    ],
    Tahunan: [
      { name: "2023", pemasukan: 18000, pengeluaran: 14000 },
      { name: "2024", pemasukan: 22000, pengeluaran: 19000 },
      { name: "2025", pemasukan: 26000, pengeluaran: 22000 },
      { name: "2026", pemasukan: 31000, pengeluaran: 27000 },
    ],
  },
  Sedekah: {
    Bulanan: [
      { name: "JAN", pemasukan: 500, pengeluaran: 100 },
      { name: "FEB", pemasukan: 400, pengeluaran: 200 },
      { name: "MAR", pemasukan: 800, pengeluaran: 300 },
      { name: "APR", pemasukan: 600, pengeluaran: 400 },
      { name: "MEI", pemasukan: 700, pengeluaran: 500 },
      { name: "JUN", pemasukan: 900, pengeluaran: 200 },
      { name: "JUL", pemasukan: 1000, pengeluaran: 600 },
      { name: "AGU", pemasukan: 1200, pengeluaran: 400 },
      { name: "SEP", pemasukan: 1100, pengeluaran: 500 },
      { name: "OKT", pemasukan: 1500, pengeluaran: 800 },
      { name: "NOV", pemasukan: 1400, pengeluaran: 900 },
      { name: "DES", pemasukan: 2000, pengeluaran: 1200 },
    ],
    Tahunan: [
      { name: "2023", pemasukan: 8000, pengeluaran: 4000 },
      { name: "2024", pemasukan: 11000, pengeluaran: 6000 },
      { name: "2025", pemasukan: 13000, pengeluaran: 7500 },
      { name: "2026", pemasukan: 16000, pengeluaran: 9000 },
    ],
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState("Zakat Maal");
  const [activePeriod, setActivePeriod] = useState("Bulanan");

  const currentChartData = chartDataMap[activeCategory]?.[activePeriod] || [];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 font-['Manrope'] flex flex-col">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* ─── NAVBAR PUBLIK ─── */}
        <nav className="w-full bg-[#F0FDF4]/90 backdrop-blur-md px-6 md:px-12 py-4 flex items-center justify-between border-b border-emerald-100/50 sticky top-0 z-50 transition-all duration-300">
          <div className="flex items-center gap-3">
            {/* ─── LOGO SVG ─── */}
            <img
              src={LogoDasawisma}
              alt="Logo Dasawisma"
              onClick={() => navigate("/")} 
              style={{ cursor: "pointer" }}
              // Memperbesar logo secara signifikan: h-12 (tinggi 48px) untuk layar kecil, h-16 (tinggi 64px) untuk layar medium ke atas.
              // w-auto memastikan aspek rasio logo tetap terjaga. object-contain untuk mencegah distorsi.
              className="h-15 md:h-17 w-auto object-contain drop-shadow-sm group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>

          {/* ─── BAGIAN TENGAH: MENU NAVIGASI ─── */}
          {/* Tambahan absolute left-1/2 dan -translate-x-1/2 akan memaksa elemen berada tepat di tengah layar */}
          <div className="hidden md:flex items-center gap-1 bg-white/70 backdrop-blur-sm rounded-full p-1.5 border border-emerald-100/60 shadow-[0_2px_10px_-4px_rgba(15,118,110,0.1)] absolute left-1/2 -translate-x-1/2">
            {/* Tautan HOME */}
            <Link
              to="/"
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                location.pathname === "/"
                  ? "bg-white text-[#0F766E] shadow-sm"
                  : "text-gray-500 hover:bg-emerald-50 hover:text-[#0F766E]"
              }`}
            >
              Home
            </Link>

            {/* Tautan DASHBOARD */}
            <Link
              to="/dashboard-publik"
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                location.pathname === "/dashboard-publik"
                  ? "bg-white text-[#0F766E] shadow-sm"
                  : "text-gray-500 hover:bg-emerald-50 hover:text-[#0F766E]"
              }`}
            >
              Dashboard
            </Link>

            {/* Tautan LAPORAN ZIS */}
            <Link
              to="/zis-publik"
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                location.pathname === "/zis-publik"
                  ? "bg-white text-[#0F766E] shadow-sm"
                  : "text-gray-500 hover:bg-emerald-50 hover:text-[#0F766E]"
              }`}
            >
              Laporan ZIS
            </Link>
          </div>

          <div>
            <button
              onClick={() => navigate("/login")}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-8 py-2.5 rounded-full text-sm transition-all duration-300 shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Masuk
            </button>
          </div>
        </nav>

        {/* ─── KONTEN UTAMA ─── */}
        <main className="w-full px-6 md:px-12 lg:px-20 py-8 flex-1">
          <div className="mb-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F766E] mb-2">
              Dashboard Utama ZIS
            </h2>
            <p className="text-gray-500 font-medium">
              Selamat datang kembali, pantau aktivitas Dasawisma hari ini.
            </p>
          </div>

          {/* CARDS RINGKASAN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-[#F0FDF4] rounded-xl flex items-center justify-center text-[#10B981]">
                <Coins size={28} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Jumlah Muzzaki
                </p>
                <h3 className="text-3xl font-extrabold text-gray-900">152</h3>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-[#F0FDF4] rounded-xl flex items-center justify-center text-[#10B981]">
                <Users size={28} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Jumlah Mustahiq
                </p>
                <h3 className="text-3xl font-extrabold text-gray-900">45</h3>
              </div>
            </div>
          </div>

          {/* AREA CHART (tinggi fixed agar Recharts ResponsiveContainer dapat ukuran) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  Tren Transaksi ZIS
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Laporan akumulasi dana{" "}
                  {activePeriod === "Bulanan" ? "bulanan" : "tahunan"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                  {["Zakat Maal", "Zakat Fitrah", "Infaq", "Sedekah"].map(
                    (cat) => (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                          activeCategory === cat
                            ? "bg-[#10B981] text-white shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {cat}
                      </button>
                    ),
                  )}
                </div>

                <div className="flex bg-gray-50 p-0.5 rounded-lg border border-gray-100">
                  {["Bulanan", "Tahunan"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setActivePeriod(period)}
                      className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                        activePeriod === period
                          ? "bg-[#10B981] text-white shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ⚠️ Wrapper dengan TINGGI EKSPLISIT — wajib untuk ResponsiveContainer */}
            <div className="w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={currentChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis hide={true} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ fontWeight: "bold", color: "#374151" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pemasukan"
                    stroke="#0F766E"
                    strokeWidth={3}
                    fill="#d1fae5"
                    fillOpacity={0.4}
                  />
                  <Line
                    type="monotone"
                    dataKey="pengeluaran"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    strokeDasharray="6 6"
                    dot={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#0F766E]"></div>
                <span className="text-xs font-bold text-gray-600">
                  Pemasukan
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                <span className="text-xs font-bold text-gray-600">
                  Pengeluaran
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </PageTransition>
  );
}
