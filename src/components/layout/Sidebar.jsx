import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  FileText,
  Users,
  UserCog,
  Settings,
  LogOut
} from "lucide-react";
import LogoDasawisma from "../../assets/Logo.svg";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Kelola Kas", icon: Wallet, path: "/kelola-kas" },
    { name: "Laporan ZIS", icon: FileText, path: "/laporan-zis" }, 
    { name: "Anggota Dasawisma", icon: Users, path: "/anggota-dasawisma" }, 
    { name: "Anggota Amil", icon: UserCog, path: "/anggota-amil" }, 
    { name: "Pengaturan", icon: Settings, path: "/pengaturan" }, 
  ];

  return (
    <div className="w-64 h-screen bg-[#F0FDF4] flex flex-col fixed left-0 top-0 font-['Manrope'] z-50 justify-between">
      
      {/* Bagian Atas: Logo & Navigasi */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* ─── LOGO AREA ─── */}
        <div className="px-7 pt-8 pb-4 flex items-center">
          <img
            src={LogoDasawisma}
            alt="Logo Dasawisma"
            onClick={() => navigate("/dashboard")}
            className="h-[75px] w-auto object-contain object-left drop-shadow-sm cursor-pointer hover:scale-[1.02] transition-transform duration-300"
          />
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
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-bold tracking-wide transition-all duration-300 ${
                  isActive
                    ? "text-[#0F766E] bg-white shadow-sm shadow-emerald-800/5 translate-x-1"
                    : "text-[#059669]/70 hover:text-[#0F766E] hover:bg-white/50"
                }`}
              >
                <Icon 
                  className={`w-4.5 h-4.5 shrink-0 transition-colors duration-300 ${isActive ? "text-[#10B981]" : ""}`} 
                  strokeWidth={isActive ? 2.5 : 2} 
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}