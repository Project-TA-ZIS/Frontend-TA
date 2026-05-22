import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PageTransition from "../../components/shared/PageTransition";
import LogoDasawisma from "../../assets/Logo.svg";
import Footer from "../../components/layout/Footer";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 font-['Manrope'] flex flex-col">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* ─── NAVBAR PUBLIK ─── */}
        <nav className="w-full bg-[#F0FDF4]/90 backdrop-blur-md px-6 md:px-12 py-4 flex items-center justify-between border-b border-emerald-100/50 sticky top-0 z-50 transition-all duration-300">
          <div className="flex items-center gap-3">
            {/* ─── LOGO SVG ─── */}
            <img
              src={LogoDasawisma}
              alt="Logo Dasawisma"
              // Memperbesar logo secara signifikan: h-12 (tinggi 48px) untuk layar kecil, h-16 (tinggi 64px) untuk layar medium ke atas.
              // w-auto memastikan aspek rasio logo tetap terjaga. object-contain untuk mencegah distorsi.
              className="h-15 md:h-17 w-auto object-contain drop-shadow-sm group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>

          {/* ─── BAGIAN TENGAH: MENU NAVIGASI ─── */}
          {/* Tambahan absolute left-1/2 dan -translate-x-1/2 akan memaksa elemen berada tepat di tengah layar */}
          <div className="hidden md:flex items-center gap-1 bg-white/70 backdrop-blur-sm rounded-full p-1.5 border border-emerald-100/60 shadow-[0_2px_10px_-4px_rgba(15,118,110,0.1)] absolute left-1/2 -translate-x-1/2">
            {/* Tautan HOME */}
            <Link
              to="/"
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                location.pathname === "/"
                  ? "bg-white text-[#0F766E] shadow-sm"
                  : "text-gray-500 hover:bg-emerald-50 hover:text-[#0F766E]"
              }`}
            >
              Home
            </Link>

            {/* Tautan DASHBOARD */}
            <Link
              to="/dashboard-publik"
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                location.pathname === "/dashboard-publik"
                  ? "bg-white text-[#0F766E] shadow-sm"
                  : "text-gray-500 hover:bg-emerald-50 hover:text-[#0F766E]"
              }`}
            >
              Dashboard
            </Link>

            {/* Tautan LAPORAN ZIS */}
            <Link
              to="/zis-publik"
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                location.pathname === "/zis-publik"
                  ? "bg-white text-[#0F766E] shadow-sm"
                  : "text-gray-500 hover:bg-emerald-50 hover:text-[#0F766E]"
              }`}
            >
              Laporan ZIS
            </Link>
          </div>

          <div>
            <button
              onClick={() => navigate("/login")}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-8 py-2.5 rounded-full text-sm transition-all duration-300 shadow-[0_4px_12px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_16px_rgba(16,185,129,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            >
              Masuk
            </button>
          </div>
        </nav>

        {/* ─── KONTEN UTAMA ─── */}
        <main className="w-full px-6 md:px-12 lg:px-20 py-10 flex-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F766E] mb-2">
              Halaman Utama
            </h2>
            <p className="text-gray-500 font-medium">
              Selamat datang kembali, mari kenali lebih dekat program kami.
            </p>
          </div>

          {/* SECTION 1: DASAWISMA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center mb-20">
            <div className="order-2 md:order-1 space-y-4">
              <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-widest rounded-lg">
                Tentang Kami
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                Apa itu Program Dasawisma?
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium text-sm md:text-base">
                Dasawisma adalah kelompok ibu-ibu yang berasal dari 10 kepala
                keluarga (KK) rumah yang bertetangga untuk mempermudah jalannya
                suatu program desa atau kelurahan. Program ini sangat penting
                untuk pemberdayaan kesejahteraan keluarga, pemantauan kesehatan
                warga, hingga pengelolaan data kependudukan skala mikro yang
                akurat.
              </p>
            </div>
            <div className="order-1 md:order-2">
              <div className="w-full aspect-video bg-gray-200 rounded-2xl border-4 border-white shadow-md overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-sm">
                  [ Area Foto Kegiatan Dasawisma ]
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: ZIS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20 items-center pb-8">
            <div>
              <div className="w-full aspect-video bg-gray-200 rounded-2xl border-4 border-white shadow-md overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 font-bold text-sm">
                  [ Area Foto Penyaluran ZIS ]
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="inline-block px-3 py-1 bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-widest rounded-lg">
                Transparansi
              </div>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                Pengelolaan Zakat, Infaq, & Shodaqoh
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium text-sm md:text-base">
                Sistem kami tidak hanya mengelola data warga, tetapi juga
                mengintegrasikan pencatatan penerimaan dan penyaluran ZIS secara
                transparan. Hal ini memastikan setiap dana yang dititipkan oleh
                Muzzaki dapat dipantau dan disalurkan dengan tepat sasaran
                kepada para Mustahik di lingkungan sekitar.
              </p>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </PageTransition>
  );
}
