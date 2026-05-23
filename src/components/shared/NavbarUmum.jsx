import React from "react";
import LogoDasawisma from "../../assets/Logo.svg";
import { Link, useLocation, useNavigate } from "react-router-dom";

function NavbarUmum() {
  return (
    <>
      {/* ─── NAVBAR PUBLIK ─── */}
      <nav className="w-full bg-[#F0FDF4]/90 backdrop-blur-md px-6 md:px-12 py-4 flex items-center justify-between border-b border-emerald-100/50 sticky top-0 z-50 transition-all duration-300">
        <div className="flex items-center gap-3">
          {/* ─── LOGO SVG ─── */}
          <img
            src={LogoDasawisma}
            alt="Logo Dasawisma"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
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
    </>
  );
}

export default NavbarUmum;
