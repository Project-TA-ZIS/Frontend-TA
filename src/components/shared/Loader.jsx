import React from "react";
import { LoaderCircle } from "lucide-react";

function Loader() {
  return (
    <div className="fixed inset-0 bg-gray-50 flex flex-col items-center justify-center overflow-hidden z-50">
      {/* Background Blob */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-100/40 rounded-full blur-3xl"></div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Angka besar */}
        <div className="relative">
          <h1 className="text-9xl font-extrabold text-[#0F766E]/10 tracking-widest select-none">
            LOADING
          </h1>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-md border border-emerald-100">
              <LoaderCircle size={40} className="text-[#10B981] animate-spin" />
            </div>
          </div>
        </div>

        <h2 className="mt-6 text-xl font-extrabold text-gray-900">
          Memuat Halaman
        </h2>

        <p className="mt-2 text-xs text-gray-500 font-medium text-center max-w-xs">
          Mohon tunggu sebentar, sistem sedang menyiapkan data untuk Anda.
        </p>

        {/* Loading dots */}
        <div className="flex gap-2 mt-6">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
          <div
            className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>

      <p className="absolute bottom-6 text-[10px] text-gray-400 font-bold tracking-wider uppercase">
        Sistem Informasi Dasawisma Lenteng Agung
      </p>
    </div>
  );
}

export default Loader;
