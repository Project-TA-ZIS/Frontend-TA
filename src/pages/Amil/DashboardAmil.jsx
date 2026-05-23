import React, { useEffect, useMemo, useState } from "react";
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
import { HandHeart, Users } from "lucide-react";
import PageTransition from "../../components/shared/PageTransition";
import muzakkiService from "../../services/muzakki.service";
import mustahikService from "../../services/mustahik.service";
import pemasukanZISService from "../../services/pemasukanZIS.service";
import pengeluaranZISService from "../../services/pengeluaranZIS.service";
import KpiCardShared from "../../components/shared/KpiCardShared";

const KPI_TEMPLATE = [
  { id: 1, icon: HandHeart, label: "JUMLAH MUZZAKI", key: "muzakki" },
  { id: 2, icon: Users, label: "JUMLAH MUSTAHIQ", key: "mustahik" },
];

const MONTH_LABELS = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MEI",
  "JUN",
  "JUL",
  "AGT",
  "SEP",
  "OKT",
  "NOV",
  "DES",
];

const parseDateSafe = (dateLike) => {
  if (!dateLike) return null;
  if (dateLike instanceof Date)
    return Number.isNaN(dateLike.getTime()) ? null : dateLike;
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
  const k = (kategori || "").toString().trim().toLowerCase();
  if (!k) return null;
  if (k.includes("zakat mal")) return "Zakat Maal";
  if (k.includes("zakat fitrah uang")) return "Zakat Fitrah Uang";
  if (k.includes("zakat fitrah beras")) return "Zakat Fitrah Beras";
  if (k === "infaq") return "Infaq";
  if (k === "shodaqoh") return "Sedekah";
  return null;
};

const buildEmptySeries = (mode, now = new Date()) => {
  const currentYear = now.getFullYear();
  if (mode === "Tahunan") {
    const years = Array.from({ length: 7 }, (_, i) =>
      String(currentYear - 6 + i),
    );
    return years.map((y) => ({ label: y, pemasukan: 0, pengeluaran: 0 }));
  }
  return MONTH_LABELS.map((m) => ({ label: m, pemasukan: 0, pengeluaran: 0 }));
};

const buildZisSeries = ({
  pemasukanItems,
  pengeluaranItems,
  uiKategori,
  mode,
  now = new Date(),
}) => {
  const nowYear = now.getFullYear();
  const result = buildEmptySeries(mode, now);

  const addValue = (idx, key, amount) => {
    if (idx >= 0 && idx < result.length) result[idx][key] += amount;
  };

  const relevantMasuk = (pemasukanItems || []).filter(
    (item) => toUiZisKategori(item?.kategori) === uiKategori,
  );
  const relevantKeluar = (pengeluaranItems || []).filter(
    (item) => toUiZisKategori(item?.kategori) === uiKategori,
  );

  const latestYearInData = Math.max(
    getMaxYearFromItems(relevantMasuk, "tanggal_penghimpunan") ?? -Infinity,
    getMaxYearFromItems(relevantKeluar, "tanggal_penyaluran") ?? -Infinity,
  );
  const activeYear =
    mode === "Tahunan" || latestYearInData === -Infinity
      ? nowYear
      : latestYearInData;

  relevantMasuk.forEach((item) => {
    const d = parseDateSafe(item?.tanggal_penghimpunan);
    if (!d) return;
    const amount = Number.parseFloat(item?.jumlah ?? 0) || 0;
    if (mode === "Tahunan") {
      addValue(d.getFullYear() - (nowYear - 6), "pemasukan", amount);
    } else if (d.getFullYear() === activeYear) {
      addValue(d.getMonth(), "pemasukan", amount);
    }
  });

  relevantKeluar.forEach((item) => {
    const d = parseDateSafe(item?.tanggal_penyaluran);
    if (!d) return;
    const amount = Number.parseFloat(item?.jumlah ?? 0) || 0;
    if (mode === "Tahunan") {
      addValue(d.getFullYear() - (nowYear - 6), "pengeluaran", amount);
    } else if (d.getFullYear() === activeYear) {
      addValue(d.getMonth(), "pengeluaran", amount);
    }
  });

  return result.map((row) => ({
    ...row,
    pemasukan:
      uiKategori === "Zakat Fitrah Beras"
        ? Number(row.pemasukan.toFixed(1))
        : Math.round(row.pemasukan),
    pengeluaran:
      uiKategori === "Zakat Fitrah Beras"
        ? Number(row.pengeluaran.toFixed(1))
        : Math.round(row.pengeluaran),
  }));
};

// ─── KOMPONEN BANTUAN LOKAL ───
const CustomTooltip = ({ active, payload, label, kategori }) => {
  if (!active || !payload?.length) return null;
  const fmt = (n, kat) => {
    if (kat === "Zakat Fitrah Beras") return `${n} KG`;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(n);
  };
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm font-['Manrope']">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: p.color }}
          />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-semibold" style={{ color: p.color }}>
            {fmt(p.value, kategori)}
          </span>
        </div>
      ))}
    </div>
  );
};

const ToggleBtnGroup = ({ options, active, onSelect }) => (
  <div className="flex items-center gap-1 bg-gray-50 p-0.5 border border-gray-100 rounded-lg">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onSelect(opt)}
        className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all duration-200 ${
          active === opt
            ? "bg-[#10B981] text-white shadow-sm"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/30"
        }`}
      >
        {opt}
      </button>
    ))}
  </div>
);

// ─── KOMPONEN KPICARD LOKAL (Perbaikan Masalah Utama) ───
const KpiCard = ({ icon: IconComponent, label, value }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 transition-all duration-300 hover:shadow-md">
    <div className="w-14 h-14 bg-[#F0FDF4] rounded-xl flex items-center justify-center text-[#10B981] shrink-0">
      <IconComponent size={28} strokeWidth={2.5} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 truncate">
        {label}
      </p>
      <h3 className="text-3xl font-extrabold tracking-tight text-gray-900">
        {value}
      </h3>
    </div>
  </div>
);

const ChartArea = ({
  title,
  subtitle,
  data,
  kategori,
  setKategori,
  waktu,
  setWaktu,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
    <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between mb-8 gap-4">
      <div>
        <h2 className="text-lg font-extrabold text-gray-900">{title}</h2>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <ToggleBtnGroup
          options={[
            "Zakat Maal",
            "Zakat Fitrah Uang",
            "Zakat Fitrah Beras",
            "Infaq",
            "Sedekah",
          ]}
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
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
      >
        <defs>
          <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          stroke="#F3F4F6"
          strokeDasharray="4 4"
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "#9CA3AF", fontWeight: 600 }}
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis hide />
        <Tooltip content={<CustomTooltip kategori={kategori} />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 20, fontWeight: 700 }}
          iconType="circle"
        />
        <Area
          type="monotone"
          dataKey="pemasukan"
          name="Pemasukan"
          stroke="#10B981"
          strokeWidth={3}
          fill="url(#colorPemasukan)"
          dot={false}
        />
        <Area
          type="monotone"
          dataKey="pengeluaran"
          name="Pengeluaran"
          stroke="#EF4444"
          strokeWidth={2}
          strokeDasharray="5 5"
          fill="none"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

// ─── COMPONENT INDUK ───
export default function DashboardAmil() {
  const [zisKategori, setZisKategori] = useState("Zakat Maal");
  const [zisWaktu, setZisWaktu] = useState("Bulanan");
  const [kpiCounts, setKpiCounts] = useState({ muzakki: 0, mustahik: 0 });
  const [zisPemasukanItems, setZisPemasukanItems] = useState([]);
  const [zisPengeluaranItems, setZisPengeluaranItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;
    const normalizeArray = (v) =>
      Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : [];
    const is404 = (err) => err?.response?.status === 404;

    const load = async () => {
      setErrorMsg("");
      try {
        const settled = await Promise.allSettled([
          muzakkiService.getAllMuzakki(),
          mustahikService.getAllMustahik(),
          pemasukanZISService.getAllPemasukanZIS(),
          pengeluaranZISService.getAllPengeluaranZIS(),
        ]);

        const pickArray = (idx) => {
          const r = settled[idx];
          if (r.status === "fulfilled") return normalizeArray(r.value);
          return is404(r.reason) ? [] : null;
        };

        const muzakkiArr = pickArray(0);
        const mustahikArr = pickArray(1);
        const pemasukanArr = pickArray(2);
        const pengeluaranArr = pickArray(3);

        if (!cancelled) {
          setKpiCounts({
            muzakki: muzakkiArr?.length || 0,
            mustahik: mustahikArr?.length || 0,
          });
          setZisPemasukanItems(pemasukanArr || []);
          setZisPengeluaranItems(pengeluaranArr || []);
        }
      } catch (err) {
        if (!cancelled)
          setErrorMsg(err?.message || "Gagal memuat data dashboard");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const kpiCards = useMemo(
    () => KPI_TEMPLATE.map((t) => ({ ...t, value: kpiCounts[t.key] ?? 0 })),
    [kpiCounts],
  );

  const zisChartData = useMemo(() => {
    return buildZisSeries({
      pemasukanItems: zisPemasukanItems,
      pengeluaranItems: zisPengeluaranItems,
      uiKategori: zisKategori,
      mode: zisWaktu,
    });
  }, [zisPemasukanItems, zisPengeluaranItems, zisKategori, zisWaktu]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-['Manrope']">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">
            Dashboard Utama ZIS
          </h1>
          <p className="text-sm text-gray-600 mt-1 font-medium">
            Selamat datang kembali, pantau aktivitas Dasawisma hari ini.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
            <p className="text-sm font-bold text-red-700">{errorMsg}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {kpiCards.map((card) => (
            <KpiCardShared
              key={card.id}
              label={card.label}
              value={card.value}
              icon={card.icon}
            />
          ))}
        </div>

        {/* Chart ZIS */}
        <div className="flex flex-col gap-6">
          <ChartArea
            title="Tren Transaksi ZIS"
            subtitle={`Laporan akumulasi dana ${zisWaktu.toLowerCase()} ${new Date().getFullYear()}`}
            data={zisChartData}
            kategori={zisKategori}
            setKategori={setZisKategori}
            waktu={zisWaktu}
            setWaktu={setZisWaktu}
          />
        </div>
      </div>
    </PageTransition>
  );
}
