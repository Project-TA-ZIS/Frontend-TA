import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, FileText, Settings } from "lucide-react";
import LogoDasawisma from "../../assets/Logo.svg";

export default function AnggotaSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // Menu disesuaikan persis dengan mockup Anggota
  const menuItems = [
    { name: "DASHBOARD", icon: LayoutDashboard, path: "/anggota/dashboard" },
    { name: "LAPORAN KAS", icon: FileText, path: "/anggota/laporan-kas" },
    { name: "PENGATURAN", icon: Settings, path: "/anggota/pengaturan" },
  ];

  return (
    <div className="w-64 h-screen bg-[#F0FDF4] border-r border-[#A7F3D0] flex flex-col fixed left-0 top-0 font-['Manrope']">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-[#A7F3D0]/50 mb-4">
        <img
          src={LogoDasawisma}
          alt="Logo Dasawisma"
          onClick={() => navigate("/anggota/dashboard")}
          style={{ cursor: "pointer" }}
          // Memperbesar logo secara signifikan: h-12 (tinggi 48px) untuk layar kecil, h-16 (tinggi 64px) untuk layar medium ke atas.
          // w-auto memastikan aspek rasio logo tetap terjaga. object-contain untuk mencegah distorsi.
          className="h-15 md:h-17 w-auto object-contain drop-shadow-sm group-hover:scale-[1.02] transition-transform duration-300"
        />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.includes(item.path);

          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-bold transition-all duration-200 ${
                isActive
                  ? "text-[#0F766E] bg-[#D1FAE5] shadow-sm"
                  : "text-[#059669]/70 hover:text-[#0F766E] hover:bg-[#ECFDF5]"
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
