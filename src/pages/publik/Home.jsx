import React from "react";
import { Link, useNavigate } from "react-router-dom";
import PageTransition from "../../components/PageTransition";
import Footer from "../../components/layout/Footer";

export default function Home() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 font-['Manrope'] flex flex-col">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* ─── NAVBAR PUBLIK ─── */}
        <nav className="w-full bg-[#F0FDF4] px-6 md:px-12 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0F766E] rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="font-extrabold text-[#0F766E] text-lg leading-tight tracking-wide">
                DASAWISMA
              </h1>
              <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                LENTENG AGUNG
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-[#F0FDF4] rounded-xl p-1 border border-emerald-100/50">
            <Link
              to="/"
              className="px-6 py-2 rounded-lg bg-white text-[#0F766E] shadow-sm font-bold text-xs uppercase tracking-wider transition-all"
            >
              Home
            </Link>
            <Link
              to="/dashboard-publik"
              className="px-6 py-2 rounded-lg text-gray-500 hover:bg-white hover:text-[#0F766E] font-bold text-xs uppercase tracking-wider transition-all"
            >
              Dashboard
            </Link>
            <Link
              to="/zis-publik"
              className="px-6 py-2 rounded-lg text-gray-500 hover:bg-white hover:text-[#0F766E] font-bold text-xs uppercase tracking-wider transition-all"
            >
              Laporan ZIS
            </Link>
          </div>

          <div>
            <button
              onClick={() => navigate("/login")}
              className="bg-[#10B981] hover:bg-[#059669] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-500/20"
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
