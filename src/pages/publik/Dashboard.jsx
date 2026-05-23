import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Coins, Users, HandHeart } from "lucide-react";
import PageTransition from "../../components/shared/PageTransition";
import Footer from "../../components/layout/Footer";
import NavbarUmum from "../../components/shared/NavbarUmum";
import ChartZis from "../../components/shared/ChartZis";
import KpiCardShared from "../../components/shared/KpiCardShared";

import muzakkiService from "../../services/muzakki.service";
import mustahikService from "../../services/mustahik.service";
import pemasukanZISService from "../../services/pemasukanZIS.service";
import pengeluaranZISService from "../../services/pengeluaranZIS.service";

const CLR = {
  primary: "#0F766E",
  primaryBg: "#ECFDF5",
  accent: "#10B981",
  danger: "#EF4444",
};

export default function Dashboard() {
  const [errorMsg, setErrorMsg] = useState("");
  const [kpiCounts, setKpiCounts] = useState({
    muzakki: 0,
    mustahik: 0,
  });

  // Data State untuk dikirim ke komponen anak grafik
  const [zisPemasukanItems, setZisPemasukanItems] = useState([]);
  const [zisPengeluaranItems, setZisPengeluaranItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const unwrapToArray = (v) =>
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

        const pick = (idx) => {
          const r = settled[idx];
          if (r.status === "fulfilled") return unwrapToArray(r.value);
          return is404(r.reason) ? [] : null;
        };

        const muzakkiArr = pick(0);
        const mustahikArr = pick(1);
        const pemasukanArr = pick(2); // PERBAIKAN: Index array diperbaiki ke urutan yang benar
        const pengeluaranArr = pick(3); // PERBAIKAN: Index array diperbaiki ke urutan yang benar

        if (!cancelled) {
          setKpiCounts({
            muzakki: muzakkiArr?.length || 0,
            mustahik: mustahikArr?.length || 0,
          });
          setZisPemasukanItems(pemasukanArr || []);
          setZisPengeluaranItems(pengeluaranArr || []);

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
        if (!cancelled)
          setErrorMsg(err?.message || "Gagal memuat data dashboard");
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Shared Formatter untuk Tooltip Grafik agar hemat memori
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
      <div className="min-h-screen bg-gray-50 font-['Manrope'] flex flex-col">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* ─── NAVBAR PUBLIK ─── */}
        <NavbarUmum />

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

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
              <p className="text-sm font-bold text-red-700">{errorMsg}</p>
            </div>
          )}

          {/* ─── CARDS RINGKASAN REUSABLE (PERBAIKAN: Mengganti isLoading dengan kpiCounts langsung) ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <KpiCardShared
              label="Jumlah Muzzaki"
              value={kpiCounts.muzakki}
              icon={HandHeart}
            />
            <KpiCardShared
              label="Jumlah Mustahiq"
              value={kpiCounts.mustahik}
              icon={Users}
            />
          </div>

          {/* AREA CHART */}
          <div className="w-full">
            <ChartZis
              pemasukanItems={zisPemasukanItems}
              pengeluaranItems={zisPengeluaranItems}
              themeColors={CLR}
              customTooltipFormatter={customTooltipFormatter}
            />
          </div>
        </main>
      </div>
      <Footer />
    </PageTransition>
  );
}