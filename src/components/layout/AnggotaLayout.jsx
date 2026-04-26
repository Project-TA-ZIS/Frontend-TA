import React from 'react';
import AnggotaSidebar from './AnggotaSidebar';

export default function AnggotaLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-['Manrope']">
      {/* Sidebar Khusus Anggota */}
      <AnggotaSidebar />
      
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Topbar / Header Profil */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-end px-10 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">Anggota Dasaswisma</p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Warga Dasawisma</p>
            </div>
            <div className="w-10 h-10 bg-[#10B981] rounded-full flex items-center justify-center text-white font-bold border-2 border-white shadow-md">
              AD
            </div>
          </div>
        </header>

        {/* Area Scroll untuk Halaman */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}