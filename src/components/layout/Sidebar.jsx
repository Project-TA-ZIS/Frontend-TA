import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wallet, 
  FileText, 
  Users, 
  UserCog, 
  Settings 
} from 'lucide-react';

export default function Sidebar() {
  // Mengambil informasi URL yang sedang aktif di browser saat ini
  const location = useLocation();

  // Menambahkan properti 'path' pada setiap menu
  const menuItems = [
    { name: 'DASHBOARD', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'KELOLA KAS', icon: Wallet, path: '/kelola-kas' },
    { name: 'LAPORAN ZIS', icon: FileText, path: '/laporan-zis' }, // (Belum dibuat halamannya)
    { name: 'ANGGOTA DASAWISMA', icon: Users, path: '/anggota-dasawisma' }, // (Belum dibuat)
    { name: 'ANGGOTA AMIL', icon: UserCog, path: '/anggota-amil' }, // (Belum dibuat)
    { name: 'PENGATURAN', icon: Settings, path: '/pengaturan' }, // (Belum dibuat)
  ];

  return (
    <div className="w-64 h-screen bg-[#F0FDF4] border-r border-[#A7F3D0] flex flex-col fixed left-0 top-0 font-['Manrope']">
      
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3 border-b border-[#A7F3D0]/50 mb-4">
        <div className="w-10 h-10 bg-[#0F766E] rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-white font-extrabold text-2xl leading-none">D</span>
        </div>
        <div>
          <h1 className="font-extrabold text-[#064E3B] leading-tight text-lg tracking-tight">DASAWISMA</h1>
          <p className="text-[10px] font-bold text-[#0F766E] tracking-[0.2em] uppercase">Lenteng Agung</p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Pengecekan otomatis: apakah path menu ini sama dengan URL di browser?
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-[13px] font-bold transition-all duration-200 ${
                isActive 
                  ? 'text-[#0F766E] bg-[#D1FAE5] shadow-sm' 
                  : 'text-[#059669]/70 hover:text-[#0F766E] hover:bg-[#ECFDF5]'
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