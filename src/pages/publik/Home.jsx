import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import PageTransition from "../../components/shared/PageTransition";
import LogoDasawisma from "../../assets/Logo.svg";
import fotoDasawisma from "../../assets/foto_dasawisma.png";
import Footer from "../../components/layout/Footer";
import NavbarUmum from "../../components/shared/NavbarUmum";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 font-['Manrope'] flex flex-col">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');`}</style>

        {/* ─── NAVBAR PUBLIK ─── */}
        <NavbarUmum />

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
                  <img src={fotoDasawisma} alt="Foto Dasawisma" className="w-full h-full object-cover" />
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
