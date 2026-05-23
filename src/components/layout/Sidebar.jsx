import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  FileText,
  Users,
  UserCog,
  Settings,
  Menu,
  X
} from "lucide-react";
import LogoDasawisma from "../../assets/Logo.svg";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  // State untuk mengontrol buka/tutup sidebar di mobile
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Kelola Kas", icon: Wallet, path: "/kelola-kas" },
    { name: "Laporan ZIS", icon: FileText, path: "/laporan-zis" },
    { name: "Kader Dasawisma", icon: Users, path: "/anggota-dasawisma" },
    { name: "Anggota Amil", icon: UserCog, path: "/anggota-amil" },
    { name: "Pengaturan", icon: Settings, path: "/pengaturan" },
  ];

  // Fungsi untuk menutup sidebar setelah menu diklik (khusus mobile)
  const handleMenuClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* ─── HAMBURGER BUTTON (Hanya Tampil di Mobile) ─── */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden fixed top-5 left-4 z-40 p-2 bg-white rounded-lg shadow-sm text-[#0F766E] border border-gray-100"
      >
        <Menu size={24} />
      </button>

      {/* ─── OVERLAY GELAP (Hanya Tampil saat Sidebar Terbuka di Mobile) ─── */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* ─── SIDEBAR CONTAINER ─── */}
      <div
        className={`w-64 h-screen bg-[#F0FDF4] flex flex-col fixed left-0 top-0 font-['Manrope'] z-50 justify-between transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col flex-1 overflow-hidden">
          
          {/* ─── LOGO AREA & CLOSE BUTTON ─── */}
          <div className="px-7 pt-8 pb-4 flex items-center justify-between">
            <img
              src={LogoDasawisma}
              alt="Logo Dasawisma"
              onClick={() => {
                navigate("/dashboard");
                handleMenuClick();
              }}
              className="h-[75px] w-auto object-contain object-left drop-shadow-sm cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            />
            {/* Tombol Close 'X' (Hanya Tampil di Mobile) */}
            <button 
              className="md:hidden text-[#0F766E] p-1 bg-white rounded-md shadow-sm"
              onClick={() => setIsOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          {/* ─── NAVIGATION MENU ─── */}
          <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={handleMenuClick} // Tutup sidebar otomatis saat link ditekan
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300 ${
                    isActive
                      ? "text-[#0F766E] bg-white shadow-sm shadow-emerald-800/5 translate-x-1"
                      : "text-[#059669]/70 hover:text-[#0F766E] hover:bg-white/50"
                  }`}
                >
                  <Icon
                    className={`w-4.5 h-4.5 shrink-0 transition-colors duration-300 ${
                      isActive ? "text-[#10B981]" : ""
                    }`}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}