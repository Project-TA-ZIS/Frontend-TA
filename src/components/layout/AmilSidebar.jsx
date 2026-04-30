import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, HandHeart, Users, Settings } from 'lucide-react';

export default function AmilSidebar() {
  const location = useLocation();

  // Menu sudah disesuaikan persis dengan desain mockup terbaru
  const menuItems = [
    { name: 'DASHBOARD', icon: LayoutDashboard, path: '/amil/dashboard' },
    { name: 'KELOLA ZIS', icon: Wallet, path: '/amil/kelola-zis' },
    { name: 'KELOLA MUZZAKI', icon: HandHeart, path: '/amil/kelola-muzzaki' },
    { name: 'KELOLA MUSTAHIK', icon: Users, path: '/amil/kelola-mustahik' },
    { name: 'PENGATURAN', icon: Settings, path: '/amil/pengaturan' },
  ];

  return (
    <div className="w-64 h-screen bg-[#F0FDF4] border-r border-[#A7F3D0] flex flex-col fixed left-0 top-0 font-['Manrope']">
      <div className="p-6 flex items-center gap-3 border-b border-[#A7F3D0]/50 mb-4">
        <div>
          <h1 className="font-extrabold text-[#064E3B] leading-tight text-lg tracking-tight">DASAWISMA</h1>
          <p className="text-[10px] font-bold text-[#0F766E] tracking-[0.2em] uppercase">Lenteng Agung</p>
        </div>
      </div>

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