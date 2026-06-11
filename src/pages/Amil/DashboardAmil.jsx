import React, { useEffect, useMemo, useState } from "react";
import { HandHeart, Users } from "lucide-react";
import PageTransition from "../../components/shared/PageTransition";
import KpiCardShared from "../../components/shared/KpiCardShared";
import ChartZis from "../../components/shared/ChartZis";
import muzakkiService from "../../services/muzakki.service";
import mustahikService from "../../services/mustahik.service";
import pemasukanZISService from "../../services/pemasukanZIS.service";
import pengeluaranZISService from "../../services/pengeluaranZIS.service";

const KPI_TEMPLATE = [
  { id: 1, icon: HandHeart, label: "Jumlah Muzzaki", key: "muzakki" },
  { id: 2, icon: Users, label: "Jumlah Mustahiq", key: "mustahik" },
];

// Palet warna grafik (dipakai komponen ChartZis agar seragam antar halaman).
const CLR = {
  primary: "#0F766E",
  primaryBg: "#ECFDF5",
  accent: "#10B981",
  danger: "#EF4444",
};

// Dashboard utama Amil: kartu jumlah muzakki/mustahik + grafik tren ZIS.
export default function DashboardAmil() {
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

  // Membuat isi tooltip grafik (nilai diformat Rupiah atau KG untuk beras).
  const customTooltipFormatter = (kategori) => ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const fmt = (n) => {
      if (kategori === "Zakat Fitrah Beras") return `${n} KG`;
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
              {fmt(p.value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 p-4 md:p-10 font-['Manrope']">
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

        {/* Grafik Tren Transaksi ZIS (komponen bersama, seragam dgn dashboard lain) */}
        <div className="flex flex-col gap-6">
          <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <ChartZis
              pemasukanItems={zisPemasukanItems}
              pengeluaranItems={zisPengeluaranItems}
              themeColors={CLR}
              customTooltipFormatter={customTooltipFormatter}
            />
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
