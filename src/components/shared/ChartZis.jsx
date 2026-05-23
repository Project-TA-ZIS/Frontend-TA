import React, { useMemo, useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGT", "SEP", "OKT", "NOV", "DES"];
const KATEGORI_ZIS = ["Zakat Maal", "Zakat Fitrah Uang", "Zakat Fitrah Beras", "Infaq", "Sedekah"];

const parseDateSafe = (dateLike) => {
  if (!dateLike) return null;
  if (dateLike instanceof Date) return Number.isNaN(dateLike.getTime()) ? null : dateLike;
  const safe = String(dateLike).trim();
  if (!safe) return null;
  const looksLikeDateTime = safe.includes("T") || /\d{2}:\d{2}/.test(safe);
  const d = looksLikeDateTime ? new Date(safe) : new Date(`${safe}T00:00:00`);
  return !Number.isNaN(d.getTime()) ? d : new Date(safe);
};

const getMaxYearFromItems = (items, dateKey) => {
  let maxYear = null;
  (items || []).forEach((item) => {
    const d = parseDateSafe(item?.[dateKey]);
    if (!d) return;
    const y = d.getFullYear();
    if (maxYear == null || y > maxYear) maxYear = y;
  });
  return maxYear;
};

const toUiZisKategori = (kategori) => {
  const k = (kategori || "").toString().trim().toLowerCase().replace(/[_-]/g, " ");
  if (!k) return null;
  if (k.includes("zakat mal")) return "Zakat Maal";
  if (k.includes("zakat fitrah uang")) return "Zakat Fitrah Uang";
  if (k.includes("zakat fitrah beras")) return "Zakat Fitrah Beras";
  if (k === "infaq") return "Infaq";
  if (k === "shodaqoh" || k === "sedekah") return "Sedekah";
  return null;
};

export default function ChartZis({ pemasukanItems, pengeluaranItems, themeColors, customTooltipFormatter }) {
  const [kategori, setKategori] = useState("Zakat Maal");
  const [waktu, setWaktu] = useState("Bulanan");

  // Fallback warna jika props themeColors tidak dilempar dari parent
  const CLR = themeColors || {
    primary: "#0F766E",
    accent: "#10B981",
    danger: "#EF4444"
  };

  const chartData = useMemo(() => {
    const nowYear = new Date().getFullYear();
    const isTahunan = waktu === "Tahunan";
    
    const result = isTahunan
      ? Array.from({ length: 7 }, (_, i) => ({ label: String(nowYear - 6 + i), pemasukan: 0, pengeluaran: 0 }))
      : MONTH_LABELS.map((m) => ({ label: m, pemasukan: 0, pengeluaran: 0 }));

    const relevantMasuk = (pemasukanItems || []).filter((item) => toUiZisKategori(item?.kategori) === kategori);
    const relevantKeluar = (pengeluaranItems || []).filter((item) => toUiZisKategori(item?.kategori) === kategori);

    const latestYear = Math.max(
      getMaxYearFromItems(relevantMasuk, "tanggal_penghimpunan") ?? -Infinity,
      getMaxYearFromItems(relevantKeluar, "tanggal_penyaluran") ?? -Infinity
    );
    const activeYear = isTahunan || latestYear === -Infinity ? nowYear : latestYear;

    relevantMasuk.forEach((item) => {
      const d = parseDateSafe(item?.tanggal_penghimpunan);
      if (!d) return;
      const amount = Number.parseFloat(item?.jumlah ?? 0) || 0;
      if (isTahunan) {
        const idx = d.getFullYear() - (nowYear - 6);
        if (idx >= 0 && idx < result.length) result[idx].pemasukan += amount;
      } else if (d.getFullYear() === activeYear) {
        result[d.getMonth()].pemasukan += amount;
      }
    });

    relevantKeluar.forEach((item) => {
      const d = parseDateSafe(item?.tanggal_penyaluran);
      if (!d) return;
      const amount = Number.parseFloat(item?.jumlah ?? 0) || 0;
      if (isTahunan) {
        const idx = d.getFullYear() - (nowYear - 6);
        if (idx >= 0 && idx < result.length) result[idx].pengeluaran += amount;
      } else if (d.getFullYear() === activeYear) {
        result[d.getMonth()].pengeluaran += amount;
      }
    });

    return result.map((row) => ({
      ...row,
      pemasukan: kategori === "Zakat Fitrah Beras" ? Number(row.pemasukan.toFixed(1)) : Math.round(row.pemasukan),
      pengeluaran: kategori === "Zakat Fitrah Beras" ? Number(row.pengeluaran.toFixed(1)) : Math.round(row.pengeluaran),
    }));
  }, [pemasukanItems, pengeluaranItems, kategori, waktu]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 font-['Manrope'] w-full">
      
      {/* ─── HEADER GRAFIK ─── */}
      <div className="mb-4">
        <h2 className="text-base md:text-lg font-bold text-gray-900">Tren Transaksi ZIS</h2>
        <p className="text-xs text-gray-500 mt-1">Laporan akumulasi dana {waktu.toLowerCase()} {new Date().getFullYear()}</p>
      </div>

      {/* ─── AREA FILTER (RESPONSIF & SCROLLABLE) ─── */}
      <div className="flex flex-col gap-3 mb-6">
        
        {/* Filter Kategori: Bisa di-scroll horizontal di HP */}
        {/* [&::-webkit-scrollbar]:hidden untuk menyembunyikan garis scrollbar */}
        <div className="w-full overflow-x-auto pb-1 -mb-1 [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex bg-gray-100 rounded-lg p-1 min-w-max">
            {KATEGORI_ZIS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setKategori(opt)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-[11px] md:text-xs font-semibold transition-all duration-300 ${
                  kategori === opt 
                    ? "bg-[#10B981] text-white shadow-sm" 
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Periode */}
        <div className="inline-flex bg-gray-100 rounded-lg p-1 self-start">
          {["Bulanan", "Tahunan"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setWaktu(opt)}
              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-[11px] md:text-xs font-semibold transition-all duration-300 ${
                waktu === opt 
                  ? "bg-[#10B981] text-white shadow-sm" 
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-200"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* ─── AREA RENDER GRAFIK ─── */}
      <div className="w-full h-[250px] md:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {/* Margin Kiri (left) dinolkan jika YAxis di-hide agar grafik mentok ke kiri (hemat ruang) */}
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            
            <defs>
              <linearGradient id="gradZIS_Masuk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CLR.accent} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CLR.accent} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradZIS_Keluar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CLR.danger} stopOpacity={0.2} />
                <stop offset="95%" stopColor={CLR.danger} stopOpacity={0} />
              </linearGradient>
            </defs>
            
            <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="4 4" />
            
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 11, fill: "#9CA3AF", fontWeight: 500 }} 
              axisLine={false} 
              tickLine={false} 
              dy={10} 
            />
            
            {/* YAxis disembunyikan sesuai kodemu sebelumnya untuk tampilan yang lebih bersih */}
            <YAxis hide />
            
            <Tooltip content={customTooltipFormatter ? customTooltipFormatter(kategori) : undefined} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 20 }} />
            
            <Area 
              type="monotone" 
              dataKey="pemasukan" 
              name="Pemasukan" 
              stroke={CLR.accent} 
              strokeWidth={3} 
              fill="url(#gradZIS_Masuk)" 
              activeDot={{ r: 5, strokeWidth: 0, fill: CLR.accent }}
            />
            
            <Area 
              type="monotone" 
              dataKey="pengeluaran" 
              name="Pengeluaran" 
              stroke={CLR.danger} 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              fill="url(#gradZIS_Keluar)" 
              activeDot={{ r: 4, strokeWidth: 0, fill: CLR.danger }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}