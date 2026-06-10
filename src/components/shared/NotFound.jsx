import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home, AlertCircle } from "lucide-react";
import PageTransition from "./PageTransition"; // Karena berada dalam satu folder yang sama (shared)

// Halaman 404: ditampilkan saat user membuka URL yang tidak terdaftar.
export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Ornamen Latar Belakang Estetik */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md text-center space-y-6 z-10 animate-in fade-in zoom-in-95 duration-500">
          {/* Ilustrasi Angka 404 */}
          <div className="relative inline-block">
            <h1 className="text-9xl font-extrabold text-[#0F766E]/10 tracking-widest select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-emerald-50 text-[#10B981] rounded-2xl flex items-center justify-center shadow-md border border-emerald-100/50 animate-bounce duration-1000">
                <AlertCircle size={32} strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Teks Deskripsi Pemandu */}
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Halaman Tidak Ditemukan
            </h2>
            <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
              Maaf, alamat URL yang Anda tuju salah atau halaman tersebut telah
              dipindahkan oleh pengelola sistem Dasawisma.
            </p>
          </div>

          {/* Tombol Navigasi Alternatif Balik Jalan */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => navigate("/")} // Langsung meloncat ke halaman utama publik
              className="flex items-center justify-center gap-2 bg-[#0F766E] hover:bg-[#0c645d] text-white font-bold py-3 px-5 rounded-xl text-xs transition-all shadow-md active:scale-95 shadow-teal-900/10"
            >
              <Home size={14} />
              Ke Beranda Utama
            </button>
          </div>
        </div>

        {/* Footer Kecil */}
        <p className="absolute bottom-6 text-[10px] text-gray-400 font-bold tracking-wider uppercase">
          Sistem Informasi Dasawisma Lenteng Agung
        </p>
      </div>
    </PageTransition>
  );
}
