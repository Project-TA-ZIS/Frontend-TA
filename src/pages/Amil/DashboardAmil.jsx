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
import KpiCardShared from "../../components/shared/KpiCardShared";
import muzakkiService from "../../services/muzakki.service";
import mustahikService from "../../services/mustahik.service";
import pemasukanZISService from "../../services/pemasukanZIS.service";
import pengeluaranZISService from "../../services/pengeluaranZIS.service";

const KPI_TEMPLATE = [
  { id: 1, icon: HandHeart, label: "Jumlah Muzzaki", key: "muzakki" },
  { id: 2, icon: Users, label: "Jumlah Mustahiq", key: "mustahik" },
];

const MONTH_LABELS = [
  "JAN", "FEB", "MAR", "APR", "MEI", "JUN", "JUL", "AGT", "SEP", "OKT", "NOV", "DES",
];

// Ubah berbagai bentuk input tanggal menjadi objek Date secara aman.
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

// Cari tahun terbaru dari sekumpulan data (untuk menentukan tahun aktif grafik).
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

// Samakan penulisan kategori dari server menjadi label baku yang dipakai UI.
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

// Buat kerangka data grafik berisi nol: 12 bulan (Bulanan) atau 7 tahun (Tahunan).
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

// Susun data grafik ZIS untuk kategori terpilih: jumlahkan nominal pemasukan &
// pengeluaran per bulan/tahun.
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

// Komponen isi tooltip grafik (nilai diformat Rupiah atau KG untuk beras).
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
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs md:text-sm font-['Manrope'] z-50 relative">
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full inline-block shrink-0"
            style={{ background: p.color }}
          />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-semibold whitespace-nowrap" style={{ color: p.color }}>
            {fmt(p.value, kategori)}
          </span>
        </div>
      ))}
    </div>
  );
};

// Kelompok tombol pilihan (mis. kategori atau Bulanan/Tahunan); menyorot yang aktif.
const ToggleBtnGroup = ({ options, active, onSelect }) => (
  <div className="inline-flex items-center gap-1 bg-gray-50 p-1 border border-gray-100 rounded-lg min-w-max">
    {options.map((opt) => (
      <button
        key={opt}
        onClick={() => onSelect(opt)}
        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-md text-[10px] md:text-xs font-bold transition-all duration-200 ${
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

// Komponen kartu grafik area lengkap dengan judul + filter kategori & periode.
const ChartArea = ({
  title,
  subtitle,
  data,
  kategori,
  setKategori,
  waktu,
  setWaktu,
}) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 md:p-6 w-full">
    <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between mb-6">
      <div>
        <h2 className="text-base md:text-lg font-extrabold text-gray-900">{title}</h2>
        <p className="text-xs md:text-sm font-medium text-gray-500 mt-0.5">{subtitle}</p>
      </div>
      
      {/* Area Filter yang bisa di-scroll horizontal di HP */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 md:gap-3 w-full md:w-auto">
        <div className="w-full overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          <ToggleBtnGroup
            options={["Zakat Maal", "Zakat Fitrah Uang", "Zakat Fitrah Beras", "Infaq", "Sedekah"]}
            active={kategori}
            onSelect={setKategori}
          />
        </div>
        <div className="w-full overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
          <ToggleBtnGroup
            options={["Bulanan", "Tahunan"]}
            active={waktu}
            onSelect={setWaktu}
          />
        </div>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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

// Halaman Dashboard Amil: kartu jumlah muzakki & mustahik + grafik tren ZIS.
export default function DashboardAmil() {
  const [zisKategori, setZisKategori] = useState("Zakat Maal");
  const [zisWaktu, setZisWaktu] = useState("Bulanan");
  const [kpiCounts, setKpiCounts] = useState({ muzakki: 0, mustahik: 0 });
  const [zisPemasukanItems, setZisPemasukanItems] = useState([]);
  const [zisPengeluaranItems, setZisPengeluaranItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  // Saat halaman dibuka: muat data muzakki, mustahik, dan transaksi ZIS.
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

        if (!cancelled) {
          setKpiCounts({
            muzakki: pickArray(0)?.length || 0,
            mustahik: pickArray(1)?.length || 0,
          });
          setZisPemasukanItems(pickArray(2) || []);
          setZisPengeluaranItems(pickArray(3) || []);
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

  // Gabungkan template KPI dengan angka hasil hitung untuk dirender jadi kartu.
  const kpiCards = useMemo(
    () => KPI_TEMPLATE.map((t) => ({ ...t, value: kpiCounts[t.key] ?? 0 })),
    [kpiCounts],
  );

  // Susun data grafik ZIS sesuai kategori & periode yang dipilih.
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
      <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-['Manrope']">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F766E]">
            Dashboard Utama ZIS
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1 font-medium">
            Selamat datang kembali, pantau aktivitas Dasawisma hari ini.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 md:p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
            <p className="text-xs md:text-sm font-bold text-red-700">{errorMsg}</p>
          </div>
        )}

        {/* KPI Cards: 1 kolom ke bawah di HP, 2 kolom di desktop (samakan dengan dashboard publik) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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