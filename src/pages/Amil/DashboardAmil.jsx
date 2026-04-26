import React, { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { HandHeart, Users } from "lucide-react";

// ─── Dummy Data Dinamis ─────────────────────────────────────────────────────
// Menambahkan 'multiplier' agar bentuk grafik dan angkanya berbeda tiap kategori
const generateData = (isTahunan = false, multiplier = 1) => {
  const labels = isTahunan 
    ? ["2020", "2021", "2022", "2023", "2024", "2025", "2026"]
    : ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGT", "SEP", "OKT", "NOV", "DES"];

  return labels.map((label, index) => ({
    label,
    pemasukan: Math.round((10000000 + (Math.random() * 5000000) + (index * 500000)) * multiplier),
    pengeluaran: Math.round((5000000 + (Math.random() * 2000000) + (index * 300000)) * multiplier),
  }));
};

// Struktur data sekarang dipisah berdasarkan Kategori lalu Waktu
const DATA = {
  tren: {
    "Zakat Maal": {
      "Bulanan": generateData(false, 1.2),
      "Tahunan": generateData(true, 1.2)
    },
    "Zakat Fitrah": {
      "Bulanan": generateData(false, 0.8),
      "Tahunan": generateData(true, 0.8)
    },
    "Infaq": {
      "Bulanan": generateData(false, 0.5),
      "Tahunan": generateData(true, 0.5)
    },
    "Sedekah": {
      "Bulanan": generateData(false, 0.3),
      "Tahunan": generateData(true, 0.3)
    }
  }
};

// ─── Komponen Bantuan ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const fmt = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  return (
    <div style={{ fontFamily: "Manrope, sans-serif" }} className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-semibold" style={{ color: p.color }}>{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const ToggleBtnGroup = ({ options, active, onSelect }) => (
  <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-lg p-1">
    {options.map((opt) => (
      <button key={opt} onClick={() => onSelect(opt)}
        className={`px-4 py-2 rounded-md text-xs font-bold transition-all duration-200 ${
          active === opt 
            ? "bg-[#10B981] text-white shadow-sm" 
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

const ChartArea = ({ title, subtitle, data, kategori, setKategori, waktu, setWaktu }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-4">
      <div>
        <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ToggleBtnGroup 
          options={["Zakat Maal", "Zakat Fitrah", "Infaq", "Sedekah"]} 
          active={kategori} 
          onSelect={setKategori} 
        />
        <ToggleBtnGroup 
          options={["Bulanan", "Tahunan"]} 
          active={waktu} 
          onSelect={setWaktu} 
        />
      </div>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="4 4" />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF", fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, paddingTop: 20, fontWeight: 700 }} iconType="circle" />
        <Area type="monotone" dataKey="pemasukan" name="Pemasukan" stroke="#10B981" strokeWidth={3} fill="url(#colorPemasukan)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }} />
        <Area type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" fill="none" activeDot={{ r: 6, strokeWidth: 0, fill: '#EF4444' }} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// ─── FUNGSI UTAMA HALAMAN ───
export default function DashboardAmil() {
  const [zisKategori, setZisKategori] = useState("Zakat Maal");
  const [zisWaktu, setZisWaktu] = useState("Bulanan");

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10" style={{ fontFamily: "Manrope, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">Dashboard Utama ZIS</h1>
        <p className="text-sm text-gray-600 mt-1 font-medium">Selamat datang kembali, pantau aktivitas Dasawisma hari ini.</p>
      </div>

      {/* KPI Cards (Dibungkus flex agar Center sempurna) */}
      <div className="flex justify-center w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between h-36">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#ECFDF5] mb-4">
              <HandHeart size={20} className="text-[#10B981]" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">JUMLAH MUZZAKI</p>
              <p className="text-4xl font-extrabold text-gray-900">152</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between h-36">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#ECFDF5] mb-4">
              <Users size={20} className="text-[#10B981]" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">JUMLAH MUSTAHIQ</p>
              <p className="text-4xl font-extrabold text-gray-900">45</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart ZIS */}
      <div className="flex flex-col gap-6">
        <ChartArea 
          title="Tren Transaksi ZIS" 
          subtitle="Laporan akumulasi dana bulanan 2024"
          // INI KUNCINYA: Data yang dipanggil sekarang menyesuaikan Kategori dan Waktu yang sedang aktif
          data={DATA.tren[zisKategori][zisWaktu]}
          kategori={zisKategori}
          setKategori={setZisKategori}
          waktu={zisWaktu}
          setWaktu={setZisWaktu}
        />
      </div>
    </div>
  );
}