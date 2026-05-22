import { useEffect, useMemo, useState } from "react";
import { HandHeart, Users, Wallet, UsersRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import PageTransition from "../../components/shared/PageTransition";
import ChartZis from "../../components/shared/ChartZis";
import ChartKas from "../../components/shared/ChartKas";

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

const KPI_TEMPLATE = [
  { id: 1, icon: HandHeart, label: "JUMLAH MUZZAKI", key: "muzakki" },
  { id: 2, icon: Users, label: "JUMLAH MUSTAHIQ", key: "mustahik" },
  { id: 3, icon: Wallet, label: "JUMLAH AMIL", key: "amil" },
  { id: 4, icon: UsersRound, label: "JUMLAH ANGGOTA DASAWISMA", key: "anggota" },
];

const CLR = {
  primary: "#0F766E",
  primaryBg: "#ECFDF5",
  accent: "#10B981",
  danger: "#EF4444",
};

// ─── Sub-Komponen KpiCard Lokal ───
const KpiCard = ({ icon: IconComponent, label, value }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col justify-between" style={{ minHeight: 140 }}>
    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: CLR.primaryBg }}>
      <IconComponent size={20} style={{ color: CLR.accent }} strokeWidth={2} />
    </div>
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

export default function DashboardUtama() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [kpiCounts, setKpiCounts] = useState({ muzakki: 0, mustahik: 0, amil: 0, anggota: 0 });
  
  // Data State untuk dikirim ke komponen anak grafik
  const [zisPemasukanItems, setZisPemasukanItems] = useState([]);
  const [zisPengeluaranItems, setZisPengeluaranItems] = useState([]);
  const [kasPemasukanItems, setKasPemasukanItems] = useState([]);
  const [kasPengeluaranItems, setKasPengeluaranItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const unwrapToArray = (v) => Array.isArray(v) ? v : (Array.isArray(v?.data) ? v.data : []);
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

        const pick = (idx) => {
          const r = settled[idx];
          if (r.status === "fulfilled") return unwrapToArray(r.value);
          return is404(r.reason) ? [] : null;
        };

        const muzakkiArr = pick(0);
        const mustahikArr = pick(1);
        const amilArr = pick(2);
        const anggotaArr = pick(3);
        const pemasukanArr = pick(4);
        const pengeluaranArr = pick(5);
        const kasMasukArr = pick(6);
        const kasKeluarArr = pick(7);

        if (!cancelled) {
          setKpiCounts({
            muzakki: muzakkiArr?.length || 0,
            mustahik: mustahikArr?.length || 0,
            amil: amilArr?.length || 0,
            anggota: anggotaArr?.length || 0,
          });
          setZisPemasukanItems(pemasukanArr || []);
          setZisPengeluaranItems(pengeluaranArr || []);
          setKasPemasukanItems(kasMasukArr || []);
          setKasPengeluaranItems(kasKeluarArr || []);

          const firstError = settled.find((x) => x.status === "rejected" && !is404(x.reason));
          if (firstError) {
            setErrorMsg(firstError.reason?.response?.data?.message || firstError.reason?.message || "Gagal memuat sebagian data dashboard");
          }
        }
      } catch (err) {
        if (!cancelled) setErrorMsg(err?.message || "Gagal memuat data dashboard");
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const kpiCards = useMemo(() => KPI_TEMPLATE.map((t) => ({ ...t, value: kpiCounts[t.key] ?? 0 })), [kpiCounts]);

  const checkProfileCompletion = async () => {
    try {
      const updatedUser = await authService.getMe();
      useAuthStore.setState({ user: updatedUser?.user || updatedUser });
      const info = updatedUser?.user || updatedUser;
      if (!info?.nama_lengkap || !info?.nomor_telpon || !info?.alamat || !info?.tanggal_lahir) {
        const result = await Swal.fire({
          icon: "warning",
          title: "Lengkapi Data Anda",
          text: "Silakan lengkapi profil terlebih dahulu sebelum menggunakan aplikasi.",
          confirmButtonText: "Lengkapi Sekarang",
          confirmButtonColor: "#10B981",
          allowOutsideClick: false,
          allowEscapeKey: false,
        });
        if (result.isConfirmed) navigate("/pengaturan");
      }
    } catch (e) { console.log(e); }
  };

  useEffect(() => { checkProfileCompletion(); }, []);

  // Shared Formatter untuk Tooltip Grafik agar hemat memori
  const customTooltipFormatter = (kategori) => ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const fmt = (n) => {
      if (kategori === "Zakat Fitrah Beras") return `${n} KG`;
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
    };
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-3 text-sm font-['Manrope']">
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

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-['Manrope']">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: CLR.primary }}>Dashboard Utama Dasawisma</h1>
          <p className="text-sm text-gray-500 mt-1">Selamat datang kembali, pantau aktivitas Dasawisma hari ini.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {kpiCards.map((card) => (
            <KpiCard key={card.id} icon={card.icon} label={card.label} value={card.value} />
          ))}
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
            <p className="text-sm font-bold text-red-700">{errorMsg}</p>
          </div>
        )}

        {/* Pemanggilan Komponen Grafik Hasil Refactor */}
        <div className="flex flex-col gap-6">
          <ChartZis 
            pemasukanItems={zisPemasukanItems} 
            pengeluaranItems={zisPengeluaranItems} 
            themeColors={CLR} 
            customTooltipFormatter={customTooltipFormatter} 
          />
          <ChartKas 
            pemasukanItems={kasPemasukanItems} 
            pengeluaranItems={kasPengeluaranItems} 
            themeColors={CLR} 
            customTooltipFormatter={customTooltipFormatter} 
          />
        </div>
      </div>
    </PageTransition>
  );
}