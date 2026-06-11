import React, { useState } from "react";
import LogoDasawisma from "../../assets/Logo.svg";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LogIn, Menu, X } from "lucide-react"; // Menambah ikon LogIn

// Navbar untuk halaman publik (tanpa login): logo, menu navigasi, tombol Masuk,
// dan menu hamburger untuk tampilan mobile.
function NavbarUmum() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Daftar link navigasi publik.
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/dashboard-publik", label: "Dashboard" },
    { to: "/zis-publik", label: "Laporan ZIS" },
  ];

  // Menghasilkan kelas styling link; menu yang sedang aktif diberi gaya berbeda.
  const linkClass = (path) =>
    `px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
      location.pathname === path
        ? "bg-white text-[#0F766E] shadow-sm"
        : "text-gray-500 hover:bg-emerald-50 hover:text-[#0F766E]"
    }`;

  return (
    <>
      <nav className="w-full bg-[#F0FDF4]/90 backdrop-blur-md px-4 sm:px-6 md:px-12 py-3 md:py-4 flex items-center justify-between border-b border-emerald-100/50 sticky top-0 z-50 transition-all duration-300">
        
        {/* LOGO */}
        <div className="flex items-center gap-3 shrink-0">
          <img
            src={LogoDasawisma}
            alt="Logo Dasawisma"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
            className="h-12 md:h-16 w-auto object-contain drop-shadow-sm transition-transform duration-300 hover:scale-[1.02]"
          />
        </div>

        {/* MENU TENGAH (DESKTOP) */}
        <div className="hidden md:flex items-center gap-1 bg-emerald-50 rounded-full p-1.5 border border-emerald-200 shadow-[0_4px_16px_-4px_rgba(15,118,110,0.25)] absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to} className={linkClass(link.to)}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* TOMBOL MASUK (DESKTOP SAJA) + HAMBURGER */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate("/login")}
            className="hidden md:block bg-[#10B981] hover:bg-[#059669] text-white font-bold px-8 py-2.5 rounded-full text-sm transition-all duration-300 shadow-md hover:-translate-y-0.5"
          >
            Masuk
          </button>

          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-[#0F766E] hover:bg-emerald-100/60 transition-colors duration-300"
          >
            {isOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
          </button>
        </div>
      </nav>

      {/* MENU DROPDOWN (MOBILE) */}
      <div
        className={`md:hidden sticky top-[72px] z-40 bg-[#F0FDF4]/95 backdrop-blur-md border-b border-emerald-100/50 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 py-3" : "max-h-0 py-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={`px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider transition-all ${
                location.pathname === link.to
                  ? "bg-white text-[#0F766E] shadow-sm"
                  : "text-gray-600 hover:bg-emerald-50 hover:text-[#0F766E]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          
          {/* Tombol Masuk Pindah ke Sini */}
          <button
            onClick={() => {
              setIsOpen(false);
              navigate("/login");
            }}
            className="flex items-center gap-2 mt-2 px-4 py-3 rounded-xl font-bold text-sm uppercase tracking-wider text-white bg-[#10B981] hover:bg-[#059669] transition-all"
          >
            <LogIn size={16} /> Masuk Akun
          </button>
        </div>
      </div>
    </>
  );
}

export default NavbarUmum;