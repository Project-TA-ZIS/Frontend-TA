import React, { useEffect, useMemo, useState } from "react";
import { HandHeart, Users, Wallet, UsersRound, X, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import PageTransition from "../../components/shared/PageTransition";
import ChartZis from "../../components/shared/ChartZis";
import ChartKas from "../../components/shared/ChartKas";
import MustahikChart from "../../components/shared/ZIS/MustahikChart";

import muzakkiService from "../../services/muzakki.service";
import mustahikService from "../../services/mustahik.service";
import amilService from "../../services/amil.service";
import dasawismaService from "../../services/dasawisma.service";
import pemasukanZISService from "../../services/pemasukanZIS.service";
import pengeluaranZISService from "../../services/pengeluaranZIS.service";
import pemasukanDasawismaService from "../../services/pemasukanDasawisma.service";
import pengeluaranDasawismaService from "../../services/pengeluaranDasawisma.service";
import authService from "../../services/auth.service";
import useAuthStore from "../../store/useAuthStore";

// Halaman Dashboard utama koordinator: kartu jumlah (muzakki, mustahik, amil,
// anggota) + grafik tren ZIS & Kas.
export default function DashboardUtama() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
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
  const [mustahikItems, setMustahikItems] = useState([]);
  // Kontrol popup grafik sebaran Mustahik per kategori asnaf.
  const [isMustahikChartOpen, setIsMustahikChartOpen] = useState(false);
  const user = useAuthStore((s) => s.user) || {};

  const KPI_TEMPLATE = [
    { id: 1, icon: HandHeart, label: "JUMLAH MUZZAKI", key: "muzakki" },
    { id: 2, icon: Users, label: "JUMLAH MUSTAHIQ", key: "mustahik" },
    { id: 3, icon: Wallet, label: "JUMLAH AMIL", key: "amil" },
    {
      id: 4,
      icon: UsersRound,
      label: `JUMLAH ANGGOTA DASAWISMA ${user?.nama_rw || "-"}`,
      key: "anggota",
    },
  ];

  const CLR = {
    primary: "#0F766E",
    primaryBg: "#ECFDF5",
    accent: "#10B981",
    danger: "#EF4444",
  };

  // ─── Sub-Komponen KpiCard Lokal ───
  // Kartu indikator (ikon + label + angka) untuk menampilkan jumlah data.
  // Dibuat identik dengan KpiCard di Dashboard Anggota agar tampilannya seragam.
  const KpiCard = ({ icon: IconComponent, label, value, onDetailClick }) => (
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
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
          {label}
        </p>
        <div className="flex items-end justify-between gap-2">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {/* Tombol "Lihat Detail" di kanan bawah (hanya muncul bila onDetailClick diberikan) */}
          {onDetailClick && (
            <button
              type="button"
              onClick={onDetailClick}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#10B981] hover:text-[#059669] transition-colors shrink-0"
            >
              Lihat Detail
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Saat halaman dibuka: muat 8 sumber data sekaligus untuk kartu KPI & grafik.
  useEffect(() => {
    let cancelled = false; // cegah update state setelah komponen unmount
    const unwrapToArray = (v) =>
      Array.isArray(v) ? v : Array.isArray(v?.data) ? v.data : [];
    const is404 = (err) => err?.response?.status === 404;

    const load = async () => {
      setErrorMsg("");
      try {
        const settled = await Promise.allSettled([
          muzakkiService.getAllMuzakki(),
          mustahikService.getAllMustahik(),
          amilService.getAllAmil(),
          dasawismaService.getAnggotaDasawismaByRW(),
          pemasukanZISService.getAllPemasukanZIS(),
          pengeluaranZISService.getAllPengeluaranZIS(),
          pemasukanDasawismaService.getPemasukanKasByRw(),
          pengeluaranDasawismaService.getPengeluaranByRW(),
        ]);

        const pick = (idx) => {
          const r = settled[idx];
          if (r.status === "fulfilled") return unwrapToArray(r.value);
          return is404(r.reason) ? [] : null;
        };

        if (!cancelled) {
          const mustahikData = pick(1) || [];
          setKpiCounts({
            muzakki: pick(0)?.length || 0,
            mustahik: mustahikData.length,
            amil: pick(2)?.length || 0,
            anggota: pick(3)?.length || 0,
          });
          setMustahikItems(mustahikData);
          setZisPemasukanItems(pick(4) || []);
          setZisPengeluaranItems(pick(5) || []);
          setKasPemasukanItems(pick(6) || []);
          setKasPengeluaranItems(pick(7) || []);

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

  // Gabungkan template KPI dengan angka hasil hitung untuk dirender jadi kartu.
  const kpiCards = useMemo(
    () => KPI_TEMPLATE.map((t) => ({ ...t, value: kpiCounts[t.key] ?? 0 })),
    [kpiCounts],
  );

  // Cek kelengkapan profil; jika belum lengkap, arahkan ke halaman pengaturan.
  const checkProfileCompletion = async () => {
    try {
      const updatedUser = await authService.getMe();
      useAuthStore.setState({ user: updatedUser?.user || updatedUser });
      const info = updatedUser?.user || updatedUser;
      if (
        !info?.nama_lengkap ||
        !info?.nomor_telpon ||
        !info?.alamat ||
        !info?.tanggal_lahir
      ) {
        const result = await Swal.fire({
          icon: "warning",
          title: "Lengkapi Data Anda",
          text: "Silakan lengkapi profil terlebih dahulu sebelum menggunakan aplikasi.",
          confirmButtonText: "Lengkapi Sekarang",
          confirmButtonColor: "#10B981",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
        if (result.isConfirmed) navigate("/anggota/pengaturan");
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Jalankan pengecekan kelengkapan profil sekali saat halaman dibuka.
  useEffect(() => {
    checkProfileCompletion();
  }, []);

  // Membuat isi tooltip grafik (label + nilai diformat Rupiah atau KG untuk beras).
  const customTooltipFormatter =
    (kategori) =>
    ({ active, payload, label }) => {
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
        <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-xs md:text-sm font-['Manrope'] z-50">
          <p className="font-bold text-gray-700 mb-2">{label}</p>
          {payload.map((p) => (
            <div key={p.name} className="flex items-center gap-2 mb-1">
              <span
                className="w-2 h-2 rounded-full inline-block shrink-0"
                style={{ background: p.color }}
              />
              <span className="text-gray-500 capitalize whitespace-nowrap">
                {p.name}:
              </span>
              <span
                className="font-semibold whitespace-nowrap"
                style={{ color: p.color }}
              >
                {fmt(p.value)}
              </span>
            </div>
          ))}
        </div>
      );
    };

  return (
    <PageTransition>
      <div
        className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 overflow-x-hidden"
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        {/* Header Responsif */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-[#0F766E]">
            Dashboard Utama
          </h1>
          <p className="text-xs md:text-sm text-gray-600 mt-1 font-medium">
            Pantau aktivitas Dasawisma hari ini.
          </p>
        </div>

        {/* KPI Cards dengan Grid Responsif */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((card) => (
            <KpiCard
              key={card.id}
              icon={card.icon}
              label={card.label}
              value={card.value}
              onDetailClick={
                card.key === "mustahik"
                  ? () => setIsMustahikChartOpen(true)
                  : undefined
              }
            />
          ))}
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 md:p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
            <p className="text-xs md:text-sm font-bold text-red-700">
              {errorMsg}
            </p>
          </div>
        )}

        {/* Wrapper Grafik Responsif */}
        <div className="flex flex-col gap-6 md:gap-8 w-full">
          <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <ChartZis
              pemasukanItems={zisPemasukanItems}
              pengeluaranItems={zisPengeluaranItems}
              themeColors={CLR}
              customTooltipFormatter={customTooltipFormatter}
            />
          </div>

          <div className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <ChartKas
              pemasukanItems={kasPemasukanItems}
              pengeluaranItems={kasPengeluaranItems}
              themeColors={CLR}
              customTooltipFormatter={customTooltipFormatter}
              namaRW={user?.nama_rw}
            />
          </div>
        </div>

        {/* ─── POPUP: Grafik Sebaran Mustahik per Kategori (Asnaf) ─── */}
        {isMustahikChartOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="bg-[#0F766E] px-5 md:px-7 py-4 md:py-5 flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-extrabold text-white tracking-tight">
                  Sebaran Mustahik per Kategori
                </h2>
                <button
                  type="button"
                  onClick={() => setIsMustahikChartOpen(false)}
                  className="text-emerald-100 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 md:p-2 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body: Pie Chart */}
              <div className="p-5 md:p-7">
                <MustahikChart data={mustahikItems} />
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
