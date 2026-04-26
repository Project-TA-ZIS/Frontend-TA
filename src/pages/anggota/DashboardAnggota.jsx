import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { HandHeart, Users, Wallet, UsersRound } from "lucide-react";

// ─── Helper Dummy Data (Visualnya dibuat berbeda tiap kategori) ───────────────
const generateData = (kategori, isTahunan = false) => {
  const labelsBulanan = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGT", "SEP", "OKT", "NOV", "DES"];
  const labelsTahunan = ["2020", "2021", "2022", "2023", "2024", "2025", "2026"];
  const labels = isTahunan ? labelsTahunan : labelsBulanan;

  return labels.map((label, index) => {
    let basePemasukan = 0;
    let basePengeluaran = 0;

    // Membuat pola lekukan yang benar-benar berbeda agar visualnya berubah saat diklik
    if (kategori === "Zakat Maal") {
      basePemasukan = 12000000 + (index * 1500000) + (Math.random() * 2000000);
      basePengeluaran = 8000000 + (index * 800000) + (Math.random() * 1000000);
    } else if (kategori === "Zakat Fitrah") {
      // Pola menggunung (lonjakan musiman)
      const peak = (index > 2 && index < 6) || (isTahunan && index > 3) ? 3 : 1; 
      basePemasukan = 5000000 * peak + (Math.random() * 1000000);
      basePengeluaran = 2000000 * peak + (Math.random() * 500000);
    } else if (kategori === "Infaq") {
      // Pola zigzag (fluktuatif)
      const zigzag = index % 2 === 0 ? 1.5 : 0.8;
      basePemasukan = 8000000 * zigzag + (Math.random() * 500000);
      basePengeluaran = 5000000 * zigzag + (Math.random() * 500000);
    } else if (kategori === "Sedekah") {
      // Pola stabil namun melandai di akhir
      basePemasukan = 15000000 - (index * 400000) + (Math.random() * 1000000);
      basePengeluaran = 10000000 - (index * 300000) + (Math.random() * 800000);
    } else {
      // Default / Kas
      basePemasukan = 7000000 + (Math.random() * 3000000);
      basePengeluaran = 4000000 + (Math.random() * 2000000);
    }

    return {
      label: label,
      pemasukan: Math.round(basePemasukan),
      pengeluaran: Math.round(basePengeluaran),
    };
  });
};

// ─── Static Data JSON ─────────────────────────────────────────────────────────
const DATA = {
  kpi: [
    { id: 1, icon: HandHeart, label: "JUMLAH MUZZAKI",            value: 152 },
    { id: 2, icon: Users,     label: "JUMLAH MUSTAHIQ",           value: 45  },
    { id: 3, icon: Wallet,    label: "JUMLAH AMIL",               value: 8   },
    { id: 4, icon: UsersRound,label: "JUMLAH ANGGOTA DASAWISMA",  value: 42  },
  ],
  trenZIS: {
    "Zakat Maal":   { "Bulanan": generateData("Zakat Maal"),   "Tahunan": generateData("Zakat Maal", true)   },
    "Zakat Fitrah": { "Bulanan": generateData("Zakat Fitrah"), "Tahunan": generateData("Zakat Fitrah", true) },
    "Infaq":        { "Bulanan": generateData("Infaq"),        "Tahunan": generateData("Infaq", true) },
    "Sedekah":      { "Bulanan": generateData("Sedekah"),      "Tahunan": generateData("Sedekah", true) },
  },
  trenKas: {
    "Bulanan": generateData("Kas"), 
    "Tahunan": generateData("Kas", true)
  }
};

// ─── Theme Constants ──────────────────────────────────────────────────────────
const CLR = {
  primary:    "#0F766E",
  primaryBg:  "#ECFDF5",
  accent:     "#10B981",
  danger:     "#EF4444",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
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

// ─── Toggle Button Group ───────────────────────────────────────────────────────
const ToggleGroup = ({ options, active, onSelect }) => (
  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onSelect(opt)}
        style={
          active === opt
            ? { background: CLR.accent, color: "#fff", fontFamily: "Manrope, sans-serif" }
            : { fontFamily: "Manrope, sans-serif" }
        }
        className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
          active === opt ? "" : "text-gray-500 hover:text-gray-700"
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

// ─── KPI Card ─────────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value }) => {
  const IconComponent = icon;
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between"
         style={{ minHeight: 140 }}>
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: CLR.primaryBg }}
      >
        <IconComponent size={20} style={{ color: CLR.accent }} strokeWidth={2} />
      </div>
      <div>
        <p
          className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          {label}
        </p>
        <p
          className="text-3xl font-bold text-gray-900"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
};

// ─── Area Chart Block ─────────────────────────────────────────────────────────
const TrenChart = ({ title, subtitle, data, gradientId, rightControls }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
    <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
      <div>
        <h2
          className="text-base font-bold text-gray-900"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          {title}
        </h2>
        <p
          className="text-xs text-gray-500 mt-0.5"
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          {subtitle}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">{rightControls}</div>
    </div>

    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={CLR.accent} stopOpacity={0.25} />
            <stop offset="95%" stopColor={CLR.accent} stopOpacity={0}    />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="4 4" />
        <XAxis
          dataKey="label"
          tick={{ fontFamily: "Manrope, sans-serif", fontSize: 11, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontFamily: "Manrope, sans-serif", fontSize: 12, paddingTop: 16 }}
        />
        <Area
          type="monotone"
          dataKey="pemasukan"
          name="Pemasukan"
          stroke={CLR.accent}
          strokeWidth={3}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 5, fill: CLR.accent, stroke: "#fff", strokeWidth: 2 }}
        />
        <Area
          type="monotone"
          dataKey="pengeluaran"
          name="Pengeluaran"
          stroke={CLR.danger}
          strokeWidth={2}
          strokeDasharray="5 5"
          fill="none"
          dot={false}
          activeDot={{ r: 4, fill: CLR.danger, stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardAnggota() {
  const [zisKategori, setZisKategori] = useState("Zakat Maal");
  const [zisWaktu,    setZisWaktu]    = useState("Bulanan");
  const [kasWaktu,    setKasWaktu]    = useState("Bulanan");

  return (
    <div
      className="min-h-screen bg-gray-50 p-6 md:p-10"
      style={{ fontFamily: "Manrope, sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl md:text-3xl font-bold"
          style={{ color: CLR.primary }}
        >
          Dashboard Utama Dasawisma
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Selamat datang kembali, pantau aktivitas Dasawisma hari ini.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {DATA.kpi.map((card) => (
          <KpiCard
            key={card.id}
            icon={card.icon}
            label={card.label}
            value={card.value}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="flex flex-col gap-6">
        
        {/* Chart 1 – ZIS */}
        <TrenChart
          title="Tren Transaksi ZIS"
          subtitle="Laporan akumulasi dana bulanan 2024"
          data={DATA.trenZIS[zisKategori][zisWaktu]} 
          gradientId="gradZIS"
          rightControls={
            <>
              <ToggleGroup
                options={["Zakat Maal", "Zakat Fitrah", "Infaq", "Sedekah"]}
                active={zisKategori}
                onSelect={setZisKategori} 
              />
              <ToggleGroup
                options={["Bulanan", "Tahunan"]}
                active={zisWaktu}
                onSelect={setZisWaktu} 
              />
            </>
          }
        />

        {/* Chart 2 – Kas */}
        <TrenChart
          title="Tren Transaksi Kas Dasawisma"
          subtitle="Laporan akumulasi dana bulanan 2024"
          data={DATA.trenKas[kasWaktu]}
          gradientId="gradKas"
          rightControls={
            <ToggleGroup
              options={["Bulanan", "Tahunan"]}
              active={kasWaktu}
              onSelect={setKasWaktu}
            />
          }
        />
      </div>
    </div>
  );
}