import React from 'react';
import { Search } from 'lucide-react';
import AmilSidebar from './AmilSidebar';

export default function AmilLayout({ children }) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-['Manrope']">
      <AmilSidebar />
      
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Header / Topbar (Dengan Search Bar seperti Mockup) */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-10 shrink-0 shadow-sm z-10">
          {/* Search Bar */}
          <div className="relative w-96">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari data warga atau transaksi..."
              className="bg-gray-100/70 border-none text-gray-700 text-sm rounded-lg focus:ring-2 focus:ring-[#10B981] block w-full pl-11 pr-4 py-2.5 font-medium outline-none transition-all"
            />
          </div>

          {/* Profile Area */}
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">Amil</p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">AMIL ZAKAT</p>
            </div>
            <div className="w-10 h-10 bg-[#0F766E] rounded-full flex items-center justify-center text-white font-bold shadow-md">
              AM
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}