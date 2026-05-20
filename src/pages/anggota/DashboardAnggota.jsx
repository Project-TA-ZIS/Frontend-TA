import { useEffect, useMemo, useState } from "react";
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
import PageTransition from "../../components/PageTransition";
import muzakkiService from "../../services/muzakki.service";
import mustahikService from "../../services/mustahik.service";
import dasawismaService from "../../services/dasawisma.service";
import amilService from "../../services/amil.service";
import pemasukanZISService from "../../services/pemasukanZIS.service";
import pengeluaranZISService from "../../services/pengeluaranZIS.service";
import pemasukanDasawismaService from "../../services/pemasukanDasawisma.service";
import pengeluaranDasawismaService from "../../services/pengeluaranDasawisma.service";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

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
  if (dateLike instanceof Date) {
    return Number.isNaN(dateLike.getTime()) ? null : dateLike;
  }
  const safe = String(dateLike).trim();
  if (!safe) return null;

  // If it already looks like an ISO datetime (has 'T' or time part), parse directly.
  const looksLikeDateTime = safe.includes("T") || /\d{2}:\d{2}/.test(safe);
  const d = looksLikeDateTime ? new Date(safe) : new Date(`${safe}T00:00:00`);
  if (!Number.isNaN(d.getTime())) return d;

  // Fallback: try direct parse.
  const d2 = new Date(safe);
  return Number.isNaN(d2.getTime()) ? null : d2;
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
  if (k.includes("zakat fitrah")) return "Zakat Fitrah";
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
    if (idx < 0 || idx >= result.length) return;
    result[idx][key] += amount;
  };

  // For Bulanan: if current year has no data, show the latest year that exists in data.
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

  (relevantMasuk || []).forEach((item) => {
    const d = parseDateSafe(item?.tanggal_penghimpunan);
    if (!d) return;
    const amount = Number.parseFloat(item?.jumlah ?? 0) || 0;

    if (mode === "Tahunan") {
      const year = d.getFullYear();
      const idx = year - (nowYear - 6);
      addValue(idx, "pemasukan", amount);
    } else {
      if (d.getFullYear() !== activeYear) return;
      addValue(d.getMonth(), "pemasukan", amount);
    }
  });

  (relevantKeluar || []).forEach((item) => {
    const d = parseDateSafe(item?.tanggal_penyaluran);
    if (!d) return;
    const amount = Number.parseFloat(item?.jumlah ?? 0) || 0;

    if (mode === "Tahunan") {
      const year = d.getFullYear();
      const idx = year - (nowYear - 6);
      addValue(idx, "pengeluaran", amount);
    } else {
      if (d.getFullYear() !== activeYear) return;
      addValue(d.getMonth(), "pengeluaran", amount);
    }
  });

  // Ensure integers for nicer tooltip formatting
  return result.map((row) => ({
    ...row,
    pemasukan: Math.round(row.pemasukan),
    pengeluaran: Math.round(row.pengeluaran),
  }));
};

const buildKasSeries = ({
  pemasukanItems,
  pengeluaranItems,
  mode,
  now = new Date(),
}) => {
  const nowYear = now.getFullYear();
  const result = buildEmptySeries(mode, now);

  const latestYearInData = Math.max(
    getMaxYearFromItems(pemasukanItems, "tanggal_penghimpunan") ?? -Infinity,
    getMaxYearFromItems(pengeluaranItems, "tanggal_penyaluran") ?? -Infinity,
  );
  const activeYear =
    mode === "Tahunan" || latestYearInData === -Infinity
      ? nowYear
      : latestYearInData;

  const addValue = (idx, key, amount) => {
    if (idx < 0 || idx >= result.length) return;
    result[idx][key] += amount;
  };

  (pemasukanItems || []).forEach((item) => {
    const d = parseDateSafe(item?.tanggal_penghimpunan);
    if (!d) return;
    const amount = Number.parseFloat(item?.jumlah ?? 0) || 0;

    if (mode === "Tahunan") {
      const year = d.getFullYear();
      const idx = year - (nowYear - 6);
      addValue(idx, "pemasukan", amount);
    } else {
      if (d.getFullYear() !== activeYear) return;
      addValue(d.getMonth(), "pemasukan", amount);
    }
  });

  (pengeluaranItems || []).forEach((item) => {
    const d = parseDateSafe(item?.tanggal_penyaluran);
    if (!d) return;
    const amount = Number.parseFloat(item?.jumlah ?? 0) || 0;

    if (mode === "Tahunan") {
      const year = d.getFullYear();
      const idx = year - (nowYear - 6);
      addValue(idx, "pengeluaran", amount);
    } else {
      if (d.getFullYear() !== activeYear) return;
      addValue(d.getMonth(), "pengeluaran", amount);
    }
  });

  return result.map((row) => ({
    ...row,
    pemasukan: Math.round(row.pemasukan),
    pengeluaran: Math.round(row.pengeluaran),
  }));
};

const KPI_TEMPLATE = [
  { id: 1, icon: HandHeart, label: "JUMLAH MUZZAKI", key: "muzakki" },
  { id: 2, icon: Users, label: "JUMLAH MUSTAHIQ", key: "mustahik" },
  { id: 3, icon: Wallet, label: "JUMLAH AMIL", key: "amil" },
  {
    id: 4,
    icon: UsersRound,
    label: "JUMLAH ANGGOTA DASAWISMA",
    key: "anggota",
  },
];

// ─── Theme Constants ──────────────────────────────────────────────────────────
const CLR = {
  primary: "#0F766E",
  primaryBg: "#ECFDF5",
  accent: "#10B981",
  danger: "#EF4444",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{ fontFamily: "Manrope, sans-serif" }}
      className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm"
    >
      <p className="font-bold text-gray-700 mb-2">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ background: p.color }}
          />
          <span className="text-gray-500 capitalize">{p.name}:</span>
          <span className="font-semibold" style={{ color: p.color }}>
            {fmt(p.value)}
          </span>
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
            ? {
                background: CLR.accent,
                color: "#fff",
                fontFamily: "Manrope, sans-serif",
              }
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
    <div
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between"
      style={{ minHeight: 140 }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center"
        style={{ background: CLR.primaryBg }}
      >
        <IconComponent
          size={20}
          style={{ color: CLR.accent }}
          strokeWidth={2}
        />
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
const TrenChart = ({
  title,
  subtitle,
  data,
  gradientId,
  rightControls,
  gradientColor = CLR.accent,
  series,
}) => {
  const defaultSeries = [
    {
      dataKey: "pemasukan",
      name: "Pemasukan",
      stroke: CLR.accent,
      strokeWidth: 3,
      fill: `url(#${gradientId})`,
      dot: false,
      activeDot: { r: 5, fill: CLR.accent, stroke: "#fff", strokeWidth: 2 },
    },
    {
      dataKey: "pengeluaran",
      name: "Pengeluaran",
      stroke: CLR.danger,
      strokeWidth: 2,
      strokeDasharray: "5 5",
      fill: "none",
      dot: false,
      activeDot: { r: 4, fill: CLR.danger, stroke: "#fff", strokeWidth: 2 },
    },
  ];

  const effectiveSeries =
    Array.isArray(series) && series.length ? series : defaultSeries;

  return (
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
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gradientColor} stopOpacity={0.25} />
              <stop offset="95%" stopColor={gradientColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#F3F4F6"
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="label"
            tick={{
              fontFamily: "Manrope, sans-serif",
              fontSize: 11,
              fill: "#9CA3AF",
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              fontFamily: "Manrope, sans-serif",
              fontSize: 12,
              paddingTop: 16,
            }}
          />
          {effectiveSeries.map((s) => (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name}
              stroke={s.stroke}
              strokeWidth={s.strokeWidth}
              strokeDasharray={s.strokeDasharray}
              fill={s.fill}
              dot={s.dot}
              activeDot={s.activeDot}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardAnggota() {
  const [zisKategori, setZisKategori] = useState("Zakat Maal");
  const [zisWaktu, setZisWaktu] = useState("Bulanan");
  const [kasWaktu, setKasWaktu] = useState("Bulanan");

  const [kpiCounts, setKpiCounts] = useState({
    muzakki: 0,
    mustahik: 0,
    amil: 0,
    anggota: 0,
  });
  const [zisPemasukanItems, setZisPemasukanItems] = useState([]);
  const [zisPengeluaranItems, setZisPengeluaranItems] = useState([]);
  const [kasPemasukanItems, setKasPemasukanItems] = useState([]);
  const [kasPengeluaranItems, setKasPengeluaranItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let cancelled = false;

    const unwrapToArray = (res, arraySelector) => {
      const arr = arraySelector?.(res);
      return Array.isArray(arr) ? arr : [];
    };

    const is404 = (err) => err?.response?.status === 404;

    const load = async () => {
      setErrorMsg("");
      try {
        const settled = await Promise.allSettled([
          muzakkiService.getAllMuzakki(),
          mustahikService.getAllMustahik(),
          amilService.getAllAmil(),
          dasawismaService.getAllAnggotaDasawisma(),
          pemasukanZISService.getAllPemasukanZIS(),
          pengeluaranZISService.getAllPengeluaranZIS(),
          pemasukanDasawismaService.getAllPemasukanKas(),
          pengeluaranDasawismaService.getAllPengeluaran(),
        ]);

        const pick = (idx, selector) => {
          const r = settled[idx];
          if (r.status === "fulfilled") return unwrapToArray(r.value, selector);
          if (is404(r.reason)) return [];
          // non-404 errors are reported, but we still try to render what we can
          return null;
        };

        const muzakkiArr = pick(0, (v) => v?.data);
        const mustahikArr = pick(1, (v) => v?.data);
        const amilArr = pick(2, (v) => v?.data);
        const anggotaArr = pick(3, (v) => v?.data);
        const pemasukanArr = pick(4, (v) => v?.data);
        const pengeluaranArr = pick(5, (v) => v?.data);
        const kasMasukArr = pick(6, (v) => v?.data);
        const kasKeluarArr = pick(7, (v) => v?.data);

        if (!cancelled) {
          setKpiCounts({
            muzakki: Array.isArray(muzakkiArr) ? muzakkiArr.length : 0,
            mustahik: Array.isArray(mustahikArr) ? mustahikArr.length : 0,
            amil: Array.isArray(amilArr) ? amilArr.length : 0,
            anggota: Array.isArray(anggotaArr) ? anggotaArr.length : 0,
          });
          setZisPemasukanItems(Array.isArray(pemasukanArr) ? pemasukanArr : []);
          setZisPengeluaranItems(
            Array.isArray(pengeluaranArr) ? pengeluaranArr : [],
          );
          setKasPemasukanItems(Array.isArray(kasMasukArr) ? kasMasukArr : []);
          setKasPengeluaranItems(
            Array.isArray(kasKeluarArr) ? kasKeluarArr : [],
          );

          const firstError = settled.find(
            (x) => x.status === "rejected" && !is404(x.reason),
          );
          if (firstError) {
            setErrorMsg(
              firstError.reason?.response?.data?.message ||
                firstError.reason?.message ||
                "Gagal memuat sebagian data dashboard",
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(
            err?.response?.data?.message ||
              err?.message ||
              "Gagal memuat data dashboard",
          );
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const zisChartData = useMemo(() => {
    return buildZisSeries({
      pemasukanItems: zisPemasukanItems,
      pengeluaranItems: zisPengeluaranItems,
      uiKategori: zisKategori,
      mode: zisWaktu,
    });
  }, [zisPemasukanItems, zisPengeluaranItems, zisKategori, zisWaktu]);
  const kasChartData = useMemo(() => {
    return buildKasSeries({
      pemasukanItems: kasPemasukanItems,
      pengeluaranItems: kasPengeluaranItems,
      mode: kasWaktu,
    });
  }, [kasPemasukanItems, kasPengeluaranItems, kasWaktu]);

  const kpiCards = useMemo(() => {
    return KPI_TEMPLATE.map((t) => ({
      ...t,
      value: kpiCounts[t.key] ?? 0,
    }));
  }, [kpiCounts]);

  const navigate = useNavigate();
  const checkProfileCompletion = async () => {
    try {
      // contoh ambil data user dari localStorage / API
      const user = JSON.parse(localStorage.getItem("user"));

      // cek apakah profile belum lengkap
      const isIncomplete =
        !user?.nama_lengkap ||
        !user?.nomor_telpon ||
        !user?.alamat ||
        !user?.tanggal_lahir;

      if (isIncomplete) {
        const result = await Swal.fire({
          icon: "warning",
          title: "Lengkapi Data Anda",
          text: "Silakan lengkapi profil terlebih dahulu sebelum menggunakan aplikasi.",
          confirmButtonText: "Lengkapi Sekarang",
          confirmButtonColor: "#10B981",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });

        if (result.isConfirmed) {
          navigate("/anggota/pengaturan");
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkProfileCompletion();
  }, []);

  return (
    <PageTransition>
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
          {kpiCards.map((card) => (
            <KpiCard
              key={card.id}
              icon={card.icon}
              label={card.label}
              value={card.value}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
            <p className="text-sm font-bold text-red-700">{errorMsg}</p>
          </div>
        )}

        {/* Charts */}
        <div className="flex flex-col gap-6">
          {/* Chart 1 – ZIS */}
          <TrenChart
            title="Tren Transaksi ZIS"
            subtitle={`Laporan akumulasi dana ${zisWaktu.toLowerCase()} ${new Date().getFullYear()}`}
            data={zisChartData}
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
            subtitle={`Laporan akumulasi dana ${kasWaktu.toLowerCase()} ${new Date().getFullYear()}`}
            data={kasChartData}
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
    </PageTransition>
  );
}
