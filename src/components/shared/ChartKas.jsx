import React, { useMemo, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const MONTH_LABELS = ["JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGT", "SEP", "OKT", "NOV", "DES"];

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

export default function ChartKas({ pemasukanItems, pengeluaranItems, themeColors, customTooltipFormatter }) {
  const [waktu, setWaktu] = useState("Bulanan");

  const chartData = useMemo(() => {
    const nowYear = new Date().getFullYear();
    const isTahunan = waktu === "Tahunan";

    const result = isTahunan
      ? Array.from({ length: 7 }, (_, i) => ({ label: String(nowYear - 6 + i), pemasukan: 0, pengeluaran: 0 }))
      : MONTH_LABELS.map((m) => ({ label: m, pemasukan: 0, pengeluaran: 0 }));

    const latestYear = Math.max(
      getMaxYearFromItems(pemasukanItems, "tanggal_penghimpunan") ?? -Infinity,
      getMaxYearFromItems(pengeluaranItems, "tanggal_penyaluran") ?? -Infinity
    );
    const activeYear = isTahunan || latestYear === -Infinity ? nowYear : latestYear;

    (pemasukanItems || []).forEach((item) => {
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

    (pengeluaranItems || []).forEach((item) => {
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
      pemasukan: Math.round(row.pemasukan),
      pengeluaran: Math.round(row.pengeluaran),
    }));
  }, [pemasukanItems, pengeluaranItems, waktu]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 font-['Manrope']">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Tren Transaksi Kas Dasawisma</h2>
          <p className="text-xs text-gray-500 mt-0.5">Laporan akumulasi dana {waktu.toLowerCase()} {new Date().getFullYear()}</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {["Bulanan", "Tahunan"].map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => setWaktu(opt)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                waktu === opt ? "bg-[#10B981] text-white" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradKas" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={themeColors.accent} stopOpacity={0.25} />
              <stop offset="95%" stopColor={themeColors.accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#F3F4F6" strokeDasharray="4 4" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip content={customTooltipFormatter("Kas")} />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} />
          <Area type="monotone" dataKey="pemasukan" name="Pemasukan" stroke={themeColors.accent} strokeWidth={3} fill="url(#gradKas)" dot={false} />
          <Area type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke={themeColors.danger} strokeWidth={2} strokeDasharray="5 5" fill="none" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}